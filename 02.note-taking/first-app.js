// Personal modules
const utils = require('./utils')
const { name, add } = require('./utils')

// User personal modules
const sum = utils.add(9, 15)
console.log(sum)
const sum1 = add(9, 15)
console.log(sum1)

// Npm local modules
const validator = require('validator');
const chalk = require('chalk');

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

// Use program argument vector (run "node first_app.js gaetan")
console.log(process.argv);
console.log(process.argv[2]);