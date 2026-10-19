const router = require('express').Router();
const { getStats } = require('../controllers/statsController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getStats);

module.exports = router;
