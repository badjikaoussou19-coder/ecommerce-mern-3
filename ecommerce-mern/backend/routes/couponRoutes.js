const router = require('express').Router();
const c = require('../controllers/couponController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/validate', protect, c.validateCoupon); // avant /:id
router.get('/', protect, adminOnly, c.getCoupons);
router.post('/', protect, adminOnly, c.createCoupon);
router.put('/:id', protect, adminOnly, c.updateCoupon);
router.delete('/:id', protect, adminOnly, c.deleteCoupon);

module.exports = router;
