const mongoose = require('mongoose');
const ServiceCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        min: 3,
        max: 75
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        min: 3,
        max: 120
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'service_category'
    },
});

module.exports = ServiceCategory = mongoose.model('service_category', ServiceCategorySchema);