const validator = require('validator');
const add = require('./utils');
const getNotes = require('./notes.js');


const sum = add(9, 15);
console.log(sum);

const msg = getNotes();
console.log(msg);

console.log(validator.isEmail('gaetz@rufflerim.com'));
console.log(validator.isURL('http:/rufflerm.com'));
