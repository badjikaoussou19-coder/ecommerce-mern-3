// Remplit la base avec un admin, un client, des catégories et des produits d'exemple
// Usage : npm run seed   (⚠️ efface les données existantes)
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Counter = require('./models/Counter');
const Coupon = require('./models/Coupon');
const Review = require('./models/Review');
const recomputeRating = require('./utils/rating');

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce');
  await Promise.all([User.deleteMany(), Category.deleteMany(), Product.deleteMany(), Order.deleteMany(), Counter.deleteMany(), Coupon.deleteMany(), Review.deleteMany()]);

  const [, client] = await User.create([
    { name: 'Administrateur', email: 'admin@boutik.sn', password: 'Admin123!', role: 'admin' },
    { name: 'Amadou Diop', email: 'client@boutik.sn', password: 'Client123!', role: 'client', phone: '770000000', address: 'Dakar' },
  ]);

  const cats = await Category.insertMany(['Électronique', 'Vêtements', 'Chaussures', 'Accessoires'].map((name) => ({ name })));
  const id = Object.fromEntries(cats.map((c) => [c.name, c._id]));

  const products = await Product.insertMany([
    { name: 'Casque Bluetooth', description: 'Casque sans fil avec réduction de bruit, 20 h d\'autonomie.', price: 25000, stock: 15, category: id['Électronique'] },
    { name: 'Souris sans fil', description: 'Souris ergonomique 2,4 GHz, silencieuse.', price: 10000, stock: 40, category: id['Électronique'] },
    { name: 'Chargeur rapide 30 W', description: 'Chargeur USB-C compatible smartphones et tablettes.', price: 8500, stock: 60, category: id['Électronique'] },
    { name: 'Enceinte portable', description: 'Enceinte étanche, son 360°.', price: 32000, stock: 12, category: id['Électronique'] },
    { name: 'T-shirt coton', description: 'T-shirt 100 % coton, coupe droite.', price: 6000, stock: 80, category: id['Vêtements'] },
    { name: 'Boubou brodé', description: 'Boubou traditionnel brodé à la main.', price: 45000, stock: 8, category: id['Vêtements'] },
    { name: 'Veste en jean', description: 'Veste en jean délavé, unisexe.', price: 22000, stock: 20, category: id['Vêtements'] },
    { name: 'Baskets de ville', description: 'Baskets légères et confortables.', price: 28000, stock: 25, category: id['Chaussures'] },
    { name: 'Sandales en cuir', description: 'Sandales artisanales en cuir véritable.', price: 12000, stock: 30, category: id['Chaussures'] },
    { name: 'Montre classique', description: 'Montre à quartz, bracelet acier.', price: 35000, stock: 10, category: id['Accessoires'] },
    { name: 'Sac à dos 20 L', description: 'Sac à dos résistant à l\'eau avec port USB.', price: 18000, stock: 22, category: id['Accessoires'] },
    { name: 'Lunettes de soleil', description: 'Verres polarisés, protection UV400.', price: 9000, stock: 0, category: id['Accessoires'] },
  ]);

  // Codes promo de démonstration
  await Coupon.create([
    { code: 'BIENVENUE10', type: 'percent', value: 10 },
    { code: 'TABASKI5000', type: 'fixed', value: 5000, minOrder: 20000 },
  ]);

  // Commandes de démonstration réparties sur 30 jours (pour les graphiques et les avis)
  const day = 86400000;
  const demo = [];
  for (let i = 0; i < 18; i++) {
    const picked = [products[i % 11], products[(i * 3 + 1) % 11]];
    const items = picked.map((p, k) => ({ product: p._id, name: p.name, price: p.price, image: p.image, quantity: 1 + ((i + k) % 3) }));
    const totalAmount = items.reduce((t, it) => t + it.price * it.quantity, 0);
    demo.push({
      orderNumber: 1001 + i,
      user: client._id,
      items,
      subtotal: totalAmount,
      totalAmount,
      shippingAddress: { fullName: client.name, phone: '770000000', address: 'Plateau', city: 'Dakar' },
      status: i < 12 ? 'Livrée' : i < 15 ? 'Expédiée' : i < 17 ? 'Confirmée' : 'En attente',
      createdAt: new Date(Date.now() - (29 - i * 1.6) * day),
    });
  }
  await Order.insertMany(demo);
  await Counter.create({ _id: 'order', seq: demo.length });

  // Quelques avis (le client a reçu ces produits)
  await Review.create([
    { product: products[0]._id, user: client._id, rating: 5, comment: 'Excellent son, très confortable.' },
    { product: products[1]._id, user: client._id, rating: 4, comment: 'Bonne souris, silencieuse comme annoncé.' },
    { product: products[4]._id, user: client._id, rating: 4, comment: 'Tissu agréable, taille correcte.' },
  ]);
  for (const p of [products[0], products[1], products[4]]) await recomputeRating(p._id);

  console.log('Base initialisée.\n  Admin  : admin@boutik.sn / Admin123!\n  Client : client@boutik.sn / Client123!\n  Codes promo : BIENVENUE10 (-10 %), TABASKI5000 (-5 000 FCFA dès 20 000 FCFA)');
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
