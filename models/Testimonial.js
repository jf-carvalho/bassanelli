const mongoose = require('mongoose');
const TestimonialSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    customer: {
    	type: String,
    	required: true
    }
});

module.exports = Testimonial = mongoose.model('testimonial', TestimonialSchema);