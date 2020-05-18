const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    isCompleted: {
        type: Boolean,
        required: false,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'Player'
    }
}, { timestamps: true })

const Quest = mongoose.model('Quest', questSchema);

module.exports = Quest