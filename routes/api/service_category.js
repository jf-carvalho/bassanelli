const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const permission = require('../../middleware/permission');

const ServiceCategoryController = require('../../controllers/ServiceCategory')
const validator = require('../../validators/ServiceCategory')

router.get('/:deleted?', auth, permission('VIEW.SERVICE_CATEGORIES'), ServiceCategoryController.index);
router.post('/', validator.create, permission('CREATE.SERVICE_CATEGORIES'), ServiceCategoryController.create);
router.delete('/:id/:hard?', auth, permission('MANAGE.SERVICE_CATEGORIES'), ServiceCategoryController.delete);
router.put('/:id', validator.update, permission('MANAGE.SERVICE_CATEGORIES'), ServiceCategoryController.update);
router.patch('/:id', auth, permission('MANAGE.SERVICE_CATEGORIES'), ServiceCategoryController.recover);

module.exports = router;