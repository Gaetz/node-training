const yargs = require('yargs');
const validator = require('validator');
const chalk = require('chalk');
const fs = require('fs');

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

// Run: 'node app.js --help' to see the documentation
// Run: 'node app.js add --title="Things to buy"' to see it in action

 */

/* 2. Using params

yargs.command('add', 'Add a note',
    {
        title: { describe: 'Note title', demandOption: true, type: 'string' },
        body: { describe: 'Note body', demandOption: true, type:'string' }
    },
    function(argv) {
        console.log("Title: ", argv.title);
        console.log("Body: ", argv.body);
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

// Run: 'node app.js add --title="Things to buy" --body="ice cream, spinach"' to see it in action

*/


/* Using Json */

// Javascript object
const book = {
    title: 'Le discours de la méthode',
    author: 'René Descartes'
}

// Converted to json
const bookData = JSON.stringify(book);
console.log(bookData);
//console.log(bookData.title) won't work;

// Json to object
const parsedData = JSON.parse(bookData);
console.log(parsedData.title); // Work this time

// Store into a file
fs.writeFileSync('book.json', bookData);

// Read the file
const dataBuffer = fs.readFileSync('book.json');
const dataJSON = dataBuffer.toString();
const loadedBook = JSON.parse(dataJSON);
console.log(loadedBook.author);


/* 3. */
const notes = require('./notes');

yargs.command('add', 'Add a note',
    {
        title: { describe: 'Note title', demandOption: true, type: 'string' },
        body: { describe: 'Note body', demandOption: true, type:'string' }
    },
    function(argv) {
        notes.addNote(argv.title, argv.body);
    });

/*
* Exercice: create the remove note function which takes a title as a parameter
* Add colors in the console with chalk
* */


yargs.command('remove', 'Remove a note', {title: { describe: 'Note title', demandOption: true, type: 'string' }}, (argv) => {
    notes.removeNote(argv.title);
});

/* Exercice: now list notes */

yargs.command('read', 'Read a note', {title: { describe: 'Note title', demandOption: true, type: 'string' }}, (argv) => {
    notes.readNote(argv.title);
});
yargs.command('list', 'List notes', {}, () => {
    notes.listNotes();
});

yargs.parse();

// Run: 'node app.js add --title="Things to buy" --body="ice cream, spinach"' to see it in action

/* Debug on windows :
node inspect app.js add --title="Things to buy" --body="ice cream, spinach"
OR
node --inspect-brk app.js add --title="Things to buy" --body="ice cream, spinach"
Open chrome with chrome://inspect, select the folder you want to debug
Add "debugger" in the code where you want to start debugging
 */

