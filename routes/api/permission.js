const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const permission = require('../../middleware/permission');

const PermissionController = require('../../controllers/Permission')

router.get('/', auth, permission('MANAGE.PERMISSIONS'), PermissionController.index);

module.exports = router;