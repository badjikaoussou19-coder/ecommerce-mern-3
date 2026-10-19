const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');

const DAYS = 30;
const notCancelled = { status: { $ne: 'Annulée' } };

// GET /api/stats (admin)
exports.getStats = asyncHandler(async (req, res) => {
  const today = new Date();
  const since = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - (DAYS - 1)));

  const [products, clients, orders, sales, recentOrders, byDay, topProducts, byStatus] = await Promise.all([
    Product.countDocuments(),
    User.countDocuments({ role: 'client' }),
    Order.countDocuments(),
    Order.aggregate([{ $match: notCancelled }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Order.find().sort('-createdAt').limit(5).populate('user', 'name'),
    Order.aggregate([
      { $match: { ...notCancelled, createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: notCancelled },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  // une valeur par jour, y compris les jours sans vente
  const map = new Map(byDay.map((d) => [d._id, d]));
  const salesByDay = Array.from({ length: DAYS }, (_, i) => {
    const date = new Date(since.getTime() + i * 86400000).toISOString().slice(0, 10);
    return { date, total: map.get(date)?.total || 0, orders: map.get(date)?.orders || 0 };
  });

  res.json({
    products,
    clients,
    orders,
    sales: sales[0]?.total || 0,
    recentOrders,
    salesByDay,
    topProducts,
    ordersByStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
  });
});
