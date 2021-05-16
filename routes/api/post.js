const express = require("express");
const router = express.Router();
const auth = require('../../middleware/auth');
const permission = require('../../middleware/permission');

const PostController = require('../../controllers/Post')
const validator = require('../../validators/Post')

router.get('/:deleted?', auth, permission('VIEW.POST'), PostController.index);
router.post('/', validator.create, permission('CREATE.POST'), PostController.create);
router.delete('/:id/:hard?', auth, permission('MANAGE.POST'), PostController.delete);
router.put('/:id', validator.update, permission('MANAGE.POST'), PostController.update);
router.patch('/:id', auth, permission('MANAGE.POST'), PostController.recover);

module.exports = router;