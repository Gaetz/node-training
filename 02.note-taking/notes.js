const fs = require('fs');

function getNotes() {
    return 'Your notes...'
}

function addNote(title, body) {
    const notes = loadNotes();

    /* Option to avoid multiple same titles */
    const duplicateNotes = notes.filter((note) => {
        return note.title === title;
    });
    if (duplicateNotes.length == 0) {
        notes.push({title: title, body: body});
        saveNotes(notes);
        console.log("New note added");
    } else {
        console.log("A note with this title already exists");
    }

    /*
    notes.push({ title: title, body: body });
    saveNotes(notes);
     */
}

function loadNotes() {
    try {
        const dataBuffer = fs.readFileSync('notes.json');
        const dataJSON = dataBuffer.toString();
        return JSON.parse(dataJSON);
    } catch(e) {
        return [];
    }
}

function saveNotes(notes) {
    const dataJSON = JSON.stringify(notes);
    fs.writeFileSync('notes.json', dataJSON);
}


function removeNote(title) {
    const notes = loadNotes();

    const notesToKeep = notes.filter((note) => {
        return note.title !== title;
    });

    if(notesToKeep.length < notes.length) {
        console.log('Note removed');
    }

    saveNotes(notesToKeep);

}

function listNotes() {
    const notes = loadNotes();
    console.log("NOTES:");
    notes.forEach((note) => {
       console.log("Title:" + note.title);
    });
}

function readNote(title) {
    const notes = loadNotes();
    const note = notes.find((note) => {
        return note.title === title;
    });
    if(note) {
        console.log("Title:" + note.title);
        console.log("Body:" + note.body);
    } else {
        console.log("This note does not exists");
    }
}

module.exports = {
    getNotes: getNotes,
    addNote: addNote,
    removeNote: removeNote,
    listNotes: listNotes,
    readNote: readNote
}