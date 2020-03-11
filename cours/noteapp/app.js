const yargs = require('yargs');
const notes = require('./notes');

yargs.command(
    'add',
    'Add a note',
    {
        title: { describe: 'Note title', demandOption: true, type:'string' }
    },
    (argv) => { notes.addNote(argv.title) }
);

yargs.command(
    'remove',
    'Remove a note',
    {
        title: { describe: 'Note title', demandOption: true, type:'string' }
    },
    (argv) => { notes.removeNote(argv.title) }
);

yargs.command(
    'list',
    'List notes',
    {},
    () => { notes.listNotes() }
);
yargs.parse();