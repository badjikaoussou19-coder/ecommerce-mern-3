const router = require('express').Router();
const c = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, c.getOrders);
router.post('/', protect, c.createOrder);
router.get('/mine', protect, c.getMyOrders); // avant /:id
router.get('/:id', protect, c.getOrder);
router.put('/:id', protect, c.updateOrder);

module.exports = router;
