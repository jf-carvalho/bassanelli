const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const permission = require('../../middleware/permission');

const UserController = require('../../controllers/User')
const validator = require('../../validators/User')

router.get('/', auth, permission('VIEW.USERS'), UserController.index);
router.post('/', validator.create, permission('CREATE.USERS'), UserController.create);
router.delete('/:id', auth, permission('MANAGE.USERS'), UserController.delete);
router.put('/:id', validator.update, permission('MANAGE.USERS'), UserController.update);
router.patch('/:id', validator.update_password, permission('MANAGE.USERS'), UserController.update_password);

module.exports = router;