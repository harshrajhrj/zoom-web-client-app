const mongoose = require('mongoose');
const RecordSchema = new mongoose.Schema({
    meetingid: {
        type: String,
        required: true,
    },
    userid: {
        type: String,
        required: true,
    },
    recordingurl: {
        type: String,
        required: true,
        default: ''
    }
}, { collection: 'recording', timestamps: true })

module.exports = mongoose.model('Record', RecordSchema);