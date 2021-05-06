const express = require('express');
const router = express.Router();
const auth = require("../../middleware/auth");

const User = require('../../models/User');
const AuthController = require('../../controllers/Auth')
const validator = require('../../validators/Auth')

// ROUTES
router.get('/', auth, AuthController.index);
router.post('/', validator.login, AuthController.login);
router.get('/logout', AuthController.logout);

module.exports = router;