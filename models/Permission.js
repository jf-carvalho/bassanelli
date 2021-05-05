const mongoose = require('mongoose');
const PermissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    group: {
        type: String,
        required: true
    },
});

module.exports = Permission = mongoose.model('permission', PermissionSchema);