const Order = require('../models/Order');
const Product = require('../models/Product');
const Counter = require('../models/Counter');
const Coupon = require('../models/Coupon');
const { evaluateCoupon } = require('../utils/coupon');
const asyncHandler = require('../utils/asyncHandler');

const nextOrderNumber = async () => {
  const c = await Counter.findOneAndUpdate({ _id: 'order' }, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return 1000 + c.seq; // #1001, #1002, ...
};

const giveBackStock = async (items) => {
  for (const it of items) await Product.updateOne({ _id: it.product }, { $inc: { stock: it.quantity } });
};

const releaseCoupon = (filter) => Coupon.updateOne({ ...filter, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } });

// POST /api/orders — le prix et le total sont recalculés côté serveur
exports.createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Le panier est vide');
  }
  const a = shippingAddress || {};
  if (!a.fullName || !a.phone || !a.address || !a.city) {
    res.status(400);
    throw new Error('Adresse de livraison incomplète');
  }

  const wanted = new Map();
  for (const i of items) {
    const q = parseInt(i.quantity, 10);
    if (!i.product || !(q > 0)) {
      res.status(400);
      throw new Error('Article invalide dans le panier');
    }
    wanted.set(String(i.product), (wanted.get(String(i.product)) || 0) + q);
  }

  const reserved = [];
  let claimed = null;
  try {
    const orderItems = [];
    for (const [id, qty] of wanted) {
      // décrémente le stock seulement s'il est suffisant (opération atomique)
      const p = await Product.findOneAndUpdate({ _id: id, stock: { $gte: qty } }, { $inc: { stock: -qty } }, { new: true });
      if (!p) {
        const existing = await Product.findById(id);
        res.status(400);
        throw new Error(
          existing ? `Stock insuffisant pour « ${existing.name} » (${existing.stock} disponible)` : 'Un produit du panier est introuvable'
        );
      }
      reserved.push({ product: p._id, quantity: qty });
      orderItems.push({ product: p._id, name: p.name, price: p.price, image: p.image, quantity: qty });
    }

    const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Code promo : vérifié et recalculé côté serveur, utilisation réservée de façon atomique
    let discount = 0;
    let couponCode = '';
    if (req.body.couponCode) {
      const coupon = await Coupon.findOne({ code: String(req.body.couponCode).trim().toUpperCase() });
      const r = evaluateCoupon(coupon, subtotal);
      if (!r.ok) {
        res.status(400);
        throw new Error(r.message);
      }
      claimed = await Coupon.findOneAndUpdate(
        { _id: coupon._id, active: true, $or: [{ maxUses: 0 }, { $expr: { $lt: ['$usedCount', '$maxUses'] } }] },
        { $inc: { usedCount: 1 } },
        { new: true }
      );
      if (!claimed) {
        res.status(400);
        throw new Error("Ce code promo n'est plus disponible");
      }
      discount = r.discount;
      couponCode = coupon.code;
    }

    const order = await Order.create({
      orderNumber: await nextOrderNumber(),
      user: req.user._id,
      items: orderItems,
      subtotal,
      discount,
      couponCode,
      totalAmount: subtotal - discount,
      shippingAddress: { fullName: a.fullName, phone: a.phone, address: a.address, city: a.city },
    });
    res.status(201).json(order);
  } catch (err) {
    await giveBackStock(reserved);
    if (claimed) await releaseCoupon({ _id: claimed._id });
    throw err;
  }
});

// GET /api/orders (admin) — toutes les commandes
exports.getOrders = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  res.json(await Order.find(filter).sort('-createdAt').populate('user', 'name email'));
});

// GET /api/orders/mine — commandes du client connecté
exports.getMyOrders = asyncHandler(async (req, res) => {
  res.json(await Order.find({ user: req.user._id }).sort('-createdAt'));
});

// GET /api/orders/:id
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (!order) {
    res.status(404);
    throw new Error('Commande introuvable');
  }
  if (req.user.role !== 'admin' && String(order.user._id) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Vous n'avez pas accès à cette commande");
  }
  res.json(order);
});

// PUT /api/orders/:id — admin : change le statut ; client : annule une commande « En attente »
exports.updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Commande introuvable');
  }
  const { status } = req.body;
  if (!Order.STATUSES.includes(status)) {
    res.status(400);
    throw new Error(`Statut invalide. Valeurs possibles : ${Order.STATUSES.join(', ')}`);
  }

  if (req.user.role !== 'admin') {
    if (String(order.user) !== String(req.user._id)) {
      res.status(403);
      throw new Error("Vous n'avez pas accès à cette commande");
    }
    if (status !== 'Annulée' || order.status !== 'En attente') {
      res.status(403);
      throw new Error('Vous pouvez uniquement annuler une commande en attente');
    }
  }
  if (order.status === 'Annulée') {
    res.status(400);
    throw new Error('Une commande annulée ne peut plus être modifiée');
  }
  if (order.status === 'Livrée' && status === 'Annulée') {
    res.status(400);
    throw new Error('Une commande livrée ne peut pas être annulée');
  }

  if (status === 'Annulée') {
    await giveBackStock(order.items); // le stock est remis en vente
    if (order.couponCode) await releaseCoupon({ code: order.couponCode }); // l'utilisation du code est rendue
  }
  order.status = status;
  await order.save();
  res.json(order);
});
