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
const geocodeUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/Montpellier.json?&language=fr&access_token=pk.eyJ1IjoiZ2FldHoiLCJhIjoiY2s1cDdlcG8xMHQyYjNmbnN0YjJhcmNqeiJ9.kLu5p2ln7vq0X7CyQARZfQ';

// Exercice: get the latitude and longitude of Montpellier

request( {url: geocodeUrl, json: true} , (error, response) => {
    const latitude = response.body.features[0].center[1];
    const longitude = response.body.features[0].center[0];
    console.log('longitude: ' + longitude + ' latitude: ' + latitude);
});