/* Intro to async

console.log('Starting');

// Wait two seconds before using the callback handler
setTimeout(() => console.log("Hoy!"), 2000);
// But this one send message after "Stopping" !
setTimeout(() => console.log("Zero"), 0);
// It is because the event loop wait for the call stack to be empty to run callbacks


console.log('Stopping');

 */

/* 2. Using a web api. Log to darksky.net/dev to get an api key.
Weather for Montpellier: https://api.darksky.net/forecast/ad95e11dbf8fe6961a05425dea338c24/43.3639,3.5238


 */
const request = require('request');


/* Without option
const url = 'https://api.darksky.net/forecast/ad95e11dbf8fe6961a05425dea338c24/43.3639,3.5238';

request( { url: url }, (error, response) => {
    const data = JSON.parse(response.body);
//    console.log(data);
    console.log(data.currently);

});
*/


// With options : https://darksky.net/dev/docs

/*
const url = 'https://api.darksky.net/forecast/ad95e11dbf8fe6961a05425dea338c24/43.3639,3.5238?units=si&lang=fr';

request( { url: url, json:true }, (error, response) => {
    //console.log(response.body.currently);
    const body = response.body;
    console.log(body.daily.data[0].summary + ' Il fait actuellement ' + body.currently.temperature + ' degrés et le risque de pluie est de ' + body.currently.precipProbability * 100 + '%.');

});
*/
// Exercice : print "It is currently [degrees] out, and there is [percentage] of risk of rain.



// 3. Geocoding: take adress and convert it to latitude and longitude
// https://docs.mapbox.com/api/search

const mapboxToken = 'pk.eyJ1IjoiZ2FldHoiLCJhIjoiY2s1cDdlcG8xMHQyYjNmbnN0YjJhcmNqeiJ9.kLu5p2ln7vq0X7CyQARZfQ';
const geocodeUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/Montpellier.json?&language=fr&access_token=' + mapboxToken;

// Exercice: get the latitude and longitude of Montpellier
/*
let longitude = 0.0;
let latitude = 0.0;
let url = '';
request( {url: geocodeUrl, json: true} , (error, response) => {
    if(error) {
        console.log('Unable to connect to weather API.');
    } else if(response.body.error) {
        console.log('Unable to find location.');
    } else {
        latitude = response.body.features[0].center[1];
        longitude = response.body.features[0].center[0];
        console.log('longitude: ' + longitude + ' latitude: ' + latitude);
        displayWeather(latitude, longitude);
    }
});
*/
// Exercice : get the coordinates of Montpellier with the geocode api and use them with the darksky api to get Montpellier weather

function coordinates(city, callback) {
    const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'+ encodeURIComponent(city)+'.json?&language=fr&access_token=' + mapboxToken;

    request( {url: url, json: true} , (error, response) => {
        if(error) {
            callback('Unable to connect to geocode API.');
        } else if(response.body.features.length === 0) {
            callback('Unable to find location');
        } else {
            const latitude = response.body.features[0].center[1];
            const longitude = response.body.features[0].center[0];
            const data = { latitude, longitude }; // Use shortcut to fill fields
            callback(error, data);
        }
    });
}

function displayWeather(data, callback) {
    const url = 'https://api.darksky.net/forecast/ad95e11dbf8fe6961a05425dea338c24/' + data.latitude + ',' + data.longitude + '?units=si&lang=fr';

    request({url: url, json: true}, (error, response) => {
        if (error) {
            callback('Unable to connect to weather API.');
        } else if (response.body.error) {
            callback('Unable to find location\'s weather');
        } else {
            const { temperature, precipProbability } = response.body.currently; // Use destructuring to create the two variables
            callback(undefined, response.body.daily.data[0].summary + ' Il fait actuellement ' + temperature + ' degrés et le risque de pluie est de ' + precipProbability * 100 + '%.');
        }
    });
}

/*
coordinates('Montpellier', (error, data) => {
    if(error) {
        return console.log(error);
    }

    displayWeather(data, (error, data) => {
        if(error) {
            return console.log(error);
        }
        console.log(data);
    })
});
*/
function weather(city, callback) {
    coordinates(city, (error, data) => {
        if (error) {
            console.log(error);
            return;
        }
        displayWeather(data, callback);
    });
}
 
weather('Montpellier', (error, data) => {
        console.log(data);
});