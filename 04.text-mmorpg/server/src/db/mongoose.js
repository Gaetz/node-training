const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/text-mmorpg', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

/* 1. Use model */ 

/*
const Player = mongoose.model('Player', {
    name: {
        type: String
    },
    age: {
        type: Number
    }
});

const me = Player({
    name: 'Gaetan',
    age: 34
});
me.save().then( () => {
    console.log(me);
}).catch( (error) => {
    console.log('Error: ', error);
});

const Quest = mongoose.model('Quest', {
    description: {
        type: String
    },
    isCompleted: {
        type: Boolean
    }
});

const beginnerQuest = Quest({
    description: "Fetch shiny things",
    isCompleted: false
});
beginnerQuest.save().then( () => {
    console.log(beginnerQuest);
}).catch( (error) => {
    console.log('Error: ', error);
});
*/

/* 2. Data validation and sanitization */
/*
const validator = require('validator');

const Player = mongoose.model('Player', {
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
});


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

const me = Player({
    name: 'Gaetan',
    password: 'blablabla',
    email: 'gaetz@artfx.fr',
    age: 34
});
me.save().then( () => {
    console.log(me);
}).catch( (error) => {
    console.log('Error: ', error);
});
*/

