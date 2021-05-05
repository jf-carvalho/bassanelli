const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const PermissionController = require('../../controllers/Permission')

router.get('/', auth, PermissionController.index);

module.exports = router;