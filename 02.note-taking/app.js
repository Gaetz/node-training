// Personal modules
const { name, add } = require('./utils');
const getNotes = require('./notes.js');

// Npm local modules
const validator = require('validator');
const chalk = require('chalk');

// User personal modules
const sum = add(9, 15);
console.log(sum);

const msg = getNotes();
console.log(msg);

// Use npm modules
// - String validation with validator
console.log(validator.isEmail('gaetz@rufflerim.com'));
console.log(validator.isURL('http:/rufflerm.com'));

// - Console color with chalk
console.log(chalk.blue.bgGreen.bold('success'));
console.log(chalk.green.inverse.bold('other success'));
console.log(chalk.red('fail'));

// Install nodemon for auto update when you save your program
// (sudo) npm install -g nodemon

