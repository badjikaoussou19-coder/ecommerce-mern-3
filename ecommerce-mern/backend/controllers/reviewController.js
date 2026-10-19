const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const recomputeRating = require('../utils/rating');

// GET /api/products/:id/reviews
exports.getProductReviews = asyncHandler(async (req, res) => {
  res.json(await Review.find({ product: req.params.id }).sort('-createdAt').populate('user', 'name'));
});

// POST /api/products/:id/reviews — seuls les clients ayant reçu le produit peuvent le noter
// Un second envoi met à jour l'avis existant.
exports.saveReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Produit introuvable');
  }
  if (req.user.role === 'admin') {
    res.status(403);
    throw new Error("L'administrateur ne peut pas publier d'avis");
  }
  const bought = await Order.exists({ user: req.user._id, status: 'Livrée', 'items.product': product._id });
  if (!bought) {
    res.status(403);
    throw new Error('Vous pouvez noter ce produit une fois votre commande livrée');
  }
  const review = await Review.findOneAndUpdate(
    { product: product._id, user: req.user._id },
    { rating: req.body.rating, comment: req.body.comment || '' },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  await recomputeRating(product._id);
  res.status(201).json(await review.populate('user', 'name'));
});

// DELETE /api/reviews/:id — l'auteur ou l'admin
exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Avis introuvable');
  }
  if (req.user.role !== 'admin' && String(review.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Vous ne pouvez supprimer que vos propres avis');
  }
  await review.deleteOne();
  await recomputeRating(review.product);
  res.json({ message: 'Avis supprimé' });
});
