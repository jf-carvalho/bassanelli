const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const SettingController = require('../../controllers/Setting')
const validator = require('../../validators/Setting')

const permission = require('../../middleware/permission');

router.get('/', auth, permission('VIEW.SETTINGS'), SettingController.index);
router.patch('/:id', auth, permission('MANAGE.SETTINGS'), SettingController.update);

module.exports = router;