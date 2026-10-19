const router = require('express').Router();
const c = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', c.getCategories);
router.post('/', protect, adminOnly, c.createCategory);
router.delete('/:id', protect, adminOnly, c.deleteCategory);

module.exports = router;
