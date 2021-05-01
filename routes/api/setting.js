const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const Setting = require('../../models/Setting')
const SettingController = require('../../controllers/Setting')
const validator = require('../../validators/Setting')

router.get('/', auth, SettingController.index);
router.post('/', validator.create, SettingController.create);
router.delete('/:id', auth, SettingController.delete);
router.put('/:id', validator.update, SettingController.update);

module.exports = router;