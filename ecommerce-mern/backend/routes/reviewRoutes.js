const router = require('express').Router();
const { deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.delete('/:id', protect, deleteReview);

module.exports = router;
