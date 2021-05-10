const mongoose = require('mongoose');
const TestimonialSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    customer: {
    	type: String,
    	required: true
    },
    created_at: {
    	type: Date,
    	default: Date.now
    },
    updated_at: {
    	type: Date,
    	default: Date.now
    },
    deleted_at: {
    	type: Date
    }
});

module.exports = Testimonial = mongoose.model('testimonial', TestimonialSchema);