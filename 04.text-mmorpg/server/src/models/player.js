const mongoose = require('mongoose');
const validator = require('validator');

const playerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        min: 7,
        validate(value) {
            if(value.toLowerCase().includes('password')) {
                throw new Error('Password is not valid');
            }
        }
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('Email is not valid');
            }
        }
    },
    age: {
        type: Number,
        default: 20,
        validate(value) {
            if(value < 1) {
                throw new Error('Age must be strictly positive');
            }
        }
    }
}, { timestamps: true })

playerSchema.virtual('quests', {
    ref: 'Quest',
    localField: '_id',
    foreignField: 'owner'
})

const Player = mongoose.model('Player', playerSchema);

module.exports = Player