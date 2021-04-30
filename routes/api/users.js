const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const User = require('../../models/User')
const UserController = require('../../controllers/User')
const validator = require('../../validators/User')

router.get('/', UserController.index);
router.post('/', validator.create, UserController.create);
router.delete('/:id', auth, UserController.delete);
router.put('/:id', validator.update, UserController.update);
router.patch('/:id', validator.update_password, UserController.update_password);

module.exports = router;