const mongoose = require('mongoose');

const Quest = mongoose.model('Quest', {
    description: {
        type: String,
        required: true,
        trim: true
    },
    isCompleted: {
        type: Boolean,
        required: false,
        default: false
    }
});

module.exports = Quest