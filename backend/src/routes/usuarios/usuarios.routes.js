const router = require('express').Router();
const controller = require('../controllers/user.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/', auth, controller.list);
router.get('/:id', auth, controller.getById);
router.post('/', controller.create);

module.exports = router;