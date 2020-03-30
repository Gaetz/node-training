const express = require('express');
const path = require('path');
const weatherlib = require('./weather');


const app = express();

const publicStaticDir = path.join(__dirname, '../public');
app.use(express.static(publicStaticDir));

// For default path

/* 
// 1. Simple text
app.get('', (req, res) => {     // req: request data, res: response
    res.send('Hello express');
});

// 2. HTML
app.get('', (req, res) => {     // req: request data, res: response
    res.send('<h1>Weather</h1>');
});
*/
// 3. JSON

/*
app.get('', (req, res) => {     // req: request data, res: response
    res.send({
        name: 'Gaëtan',
        age: 32
    });
});
*/

/*
app.get('/help', (req, res) => {
    res.sendFile(publicStaticDir + '/help.html');
});


app.get('/about', (req, res) => {
    res.send({
        author: 'Gaetan',
        age: 33
    });
});
*/

/*
app.get('/weather', (req, res) => {
    const weather = weatherlib.weather('Montpellier', (error, data) =>{
        console.log(data);
        res.status(200).send(data);
    });
});


app.get('*', (req, res) => {
    res.status(404).send('This page does not exists');
});

// Exercice: return a weather json object with a forcast and a location
*/
/*
app.get('/weather', (req, res) => {
    res.send({
        forecast: 'Sunny',
        location: 'Montpellier'
    });
});
*/
// Now we will serve files of a 'public' folder we create in our server folder

// We can use those two variable to know were we are with node
//console.log(__dirname);
//console.log(__filename);

// We can also use the path module
//const path = require('path');
//console.log(path.join(__dirname, '../public'));

// Now go up and configure the server to use the public folder
// We create about and help html files in public, removing the node handler 
// We create a styles.css file in the css folder.
// We add :         <link rel="stylesheet" href="css/styles.css" /> in the index file, and to the other files
// Then create a js folder in the public folder, then a app.js file in this folder
// We add :        <script src="js/app.js"></script> in the index filde
// Create a img folder in the public folder and put an image inside
// We add :         <img src="img/godot.png" />

// Now we will add a query string to get the weather from a city. 
// Request in navigator will be: http://localhost:3000/weather?city=Montpellier

/*
app.get('/weather', (req, res) => {
    if(!req.query.city) {
        return res.send({
            error: 'You must provide a city'
        });
    }

    res.send({
        forecast: 'Sunny',
        location: req.query.city
    });
});
*/

// Now create a utils.js file that contains the geocode and the displayWeather functions.
// Exercice: Use this route to send back in a json request the weather forecast, using our new utils.
// Dont forget to install request.
/*
const utils = require('./utils')
const { geocode, displayWeather } = utils;

app.get('/weather', (req, res) => {
    if(!req.query.city) {
        return res.send({
            error: 'You must provide a city'
        });
    }

    geocode(req.query.city, (error, data) => {
        if(error) {
            return res.send({ error });
        }
    
        displayWeather(data, (error, resultData) => {
            if(error) {
                return res.send({ error });
            }

            res.send({
                data: resultData,
                location: req.query.city
            });
        })
    });
});
*/

function buildWeatherData(city) {
    return {
        summary: 'Il fait beau à ' + city,
        temperature: 20,
        precip:0.05
    }
}

const weatherLib = require('./weather')

app.get('/weather', (req, res) => {
    /*
    weatherLib.weather(req.query.city, (error, data) => {
        console.log(req.query.city);
        res.status(200).send(data);
    });
    */
    const data = buildWeatherData(req.query.city);
    res.status(200).send(data);
});


// Starts the server on port 4000
app.listen(4000, () => {
    console.log('Server has started on port 4000');
});