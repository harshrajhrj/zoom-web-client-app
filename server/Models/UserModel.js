const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    zoomid: {
        type: String,
        required: true,
    },
    displayName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    picUrl: {
        type: String,
        required: true,
        default: null
    },
    timeZone: {
        type: String,
        required: true,
        default: null
    },
    refreshToken: {
        type: String,
        required: true
    }
}, { collection: 'user', timestamps: true })

module.exports = mongoose.model('User', UserSchema);