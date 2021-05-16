const mongoose = require('mongoose');
const PostSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String
    },
    tags: {
        type: Array
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

module.exports = Post = mongoose.model('post', PostSchema);