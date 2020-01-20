const yargs = require('yargs');
const validator = require('validator');
const chalk = require('chalk');

/* AT FIRST

const command = process.argv[2];

if (command === 'add') {
    console.log('Adding note');
} else if (command === 'remove') {
    console.log('Removing note');
}

// We want to use commands like: node app.js add --title="Big note"
// We will use a module that handles arguments: yargs


 */


// Configure yargs

/* 1.
yargs.command('add', 'Add a note', {}, function() {
    console.log("Add a note");
});
yargs.command('remove', 'Remove a note', {}, () => {
    console.log("Remove a note");
});
yargs.command('read', 'Read a note', {}, () => {
    console.log("Read a note");
});
yargs.command('list', 'List notes', {}, () => {
    console.log("List notes");
});

console.log(yargs.argv)


 */


yargs.command('add', 'Add a note',
    {
        title: { describe: 'Note title', demandOption: true, type: 'string' }
    },
    function(argv) {
        console.log("Title: ", argv.title);
    });
yargs.command('remove', 'Remove a note', {}, () => {
    console.log("Remove a note");
});
yargs.command('read', 'Read a note', {}, () => {
    console.log("Read a note");
});
yargs.command('list', 'List notes', {}, () => {
    console.log("List notes");
});

yargs.parse();

// Run: 'node app.js --help' to see the documentation
// Run: 'node app.js add --title="Things to buy"' to see it in action