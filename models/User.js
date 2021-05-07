const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    },
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "permission"
      }
    ],
    admin: {
        type: Boolean,
        default: false
    },
    reset_password_token: {
        type: String
    }
});

module.exports = User = mongoose.model('user', UserSchema);