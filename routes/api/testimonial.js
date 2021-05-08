const express = require("express");
const router = express.Router();
const auth = require('../../middleware/auth');

const TestimonialController = require('../../controllers/Testimonial')
const validator = require('../../validators/Testimonial')
const permission = require('../../middleware/permission');

router.get('/', auth, permission('VIEW.TESTIMONIAL'), TestimonialController.index);
router.post('/', validator.create, permission('CREATE.TESTIMONIAL'), TestimonialController.create);
router.delete('/', auth, permission('MANAGE.TESTIMONIAL'), TestimonialController.delete);
router.put('/', validator.update, permission('MANAGE.TESTIMONIAL'), TestimonialController.update);

module.exports = router;