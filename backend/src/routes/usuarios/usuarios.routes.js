const router = require('express').Router();
const controller = require('../../controllers/usuarios.controller');
const auth = require('../../middlewares/auth.middleware');

router.get('/', auth, controller.list);
router.get('/:id', auth, controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;