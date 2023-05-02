const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
    Topic: {
        type: String,
        required: true
    },
    Agenda: {
        type: String,
        required: true
    },
    StartTime: {
        type: Date,
        required: true
    },
    Duration: {
        type: Number,
        required: true
    },
}, { collection: 'meeting', timestamps: true });

module.exports = mongoose.model('Meeting', MeetingSchema);