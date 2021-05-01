const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const Setting = require('../../models/Setting')
const SettingController = require('../../controllers/Setting')
const validator = require('../../validators/Setting')

router.get('/', auth, SettingController.index);
router.patch('/:id', auth, SettingController.update);

module.exports = router;