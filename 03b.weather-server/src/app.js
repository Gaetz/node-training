const express = require('express');
const path = require('path');
const weatherlib = require('./weather');


const app = express();


const publicStaticDir = path.join(__dirname, '../public');
app.use(express.static(publicStaticDir));


// For default path
app.get('', (req, res) => {     // req: request data, res: response
    res.send('Hello express');
});

app.get('/help', (req, res) => {
    res.sendFile(publicStaticDir + '/help.html');
});


app.get('/about', (req, res) => {
    res.send({
        author: 'Gaetan',
        age: 33
    });
});


app.get('/weather', (req, res) => {
    const weather = weatherlib.weather('Montpellier', (error, data) =>{
        console.log(data);
        res.status(200).send(data);
    });
});


app.get('*', (req, res) => {
    res.status(404).send('This page does not exists');
});

// Starts the server on port 3000
app.listen(3000, () => {
    console.log('Server has started on port 3000');
});