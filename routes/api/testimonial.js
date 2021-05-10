const express = require("express");
const router = express.Router();
const auth = require('../../middleware/auth');

const TestimonialController = require('../../controllers/Testimonial')
const validator = require('../../validators/Testimonial')
const permission = require('../../middleware/permission');

router.get('/:deleted?', auth, permission('VIEW.TESTIMONIAL'), TestimonialController.index);
router.post('/', validator.create, permission('CREATE.TESTIMONIAL'), TestimonialController.create);
router.delete('/:id/:hard?', auth, permission('MANAGE.TESTIMONIAL'), TestimonialController.delete);
router.put('/:id', validator.update, permission('MANAGE.TESTIMONIAL'), TestimonialController.update);
router.patch('/:id', auth, permission('MANAGE.TESTIMONIAL'), TestimonialController.recover);

module.exports = router;