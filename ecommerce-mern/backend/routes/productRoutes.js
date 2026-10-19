const router = require('express').Router();
const c = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const r = require('../controllers/reviewController');
const upload = require('../middleware/upload');

router.get('/', c.getProducts);
router.post('/upload', protect, adminOnly, upload.single('image'), c.uploadImage); // avant /:id
router.get('/:id', c.getProduct);
router.get('/:id/reviews', r.getProductReviews);
router.post('/:id/reviews', protect, r.saveReview);
router.post('/', protect, adminOnly, c.createProduct);
router.put('/:id', protect, adminOnly, c.updateProduct);
router.delete('/:id', protect, adminOnly, c.deleteProduct);

module.exports = router;
