const fs = require('fs');

function addNote(title) {
    console.log("Add note")
    const notes = load();
    notes.push( { title: 'courses' } );
    save(notes);
}

function removeNote(title) {
    console.log("Remove note");
    const notes = load();

    const filtered = notes.filter(
        (note) => note.title !== title
    );

    save(filtered);
}

function listNotes() {
    console.log("List notes")
    const notes = load();
    notes.forEach(element => {
        console.log(element.title)
    });
}

function load() {
    try {
        const dataBuffer = fs.readFileSync('notes.json');
        const dataJson = dataBuffer.toString();
        return JSON.parse(dataJson);
    } catch(e) {
        return [];
    }
}

function save(notes) {
    const jsonData = JSON.stringify(notes);
    fs.writeFileSync('notes.json', jsonData);
}

module.exports = {
    addNote: addNote,
    removeNote,
    listNotes
}