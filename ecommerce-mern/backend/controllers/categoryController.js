const Category = require('../models/Category');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/categories
exports.getCategories = asyncHandler(async (req, res) => {
  res.json(await Category.find().sort('name'));
});

// POST /api/categories (admin)
exports.createCategory = asyncHandler(async (req, res) => {
  res.status(201).json(await Category.create({ name: req.body.name }));
});

// DELETE /api/categories/:id (admin)
exports.deleteCategory = asyncHandler(async (req, res) => {
  if (await Product.exists({ category: req.params.id })) {
    res.status(400);
    throw new Error('Impossible de supprimer : des produits utilisent cette catégorie');
  }
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: 'Catégorie supprimée' });
});
