const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/products?search=casque&category=<id>
exports.getProducts = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.search) filter.name = { $regex: escapeRegex(req.query.search.trim()), $options: 'i' };
  if (req.query.category) filter.category = req.query.category;
  const products = await Product.find(filter).populate('category', 'name').sort('-createdAt');
  res.json(products);
});

// GET /api/products/:id
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name');
  if (!product) {
    res.status(404);
    throw new Error('Produit introuvable');
  }
  res.json(product);
});

// POST /api/products (admin)
exports.createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, image, category, stock } = req.body;
  const product = await Product.create({ name, description, price, image, category, stock });
  res.status(201).json(await product.populate('category', 'name'));
});

// PUT /api/products/:id (admin)
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Produit introuvable');
  }
  ['name', 'description', 'price', 'image', 'category', 'stock'].forEach((f) => {
    if (req.body[f] !== undefined) product[f] = req.body[f];
  });
  await product.save();
  res.json(await product.populate('category', 'name'));
});

// DELETE /api/products/:id (admin)
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Produit introuvable');
  }
  await product.deleteOne();
  res.json({ message: 'Produit supprimé' });
});

// POST /api/products/upload (admin) — envoi d'une image
exports.uploadImage = (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Aucune image reçue');
  }
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
};
