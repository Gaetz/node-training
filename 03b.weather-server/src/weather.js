const request = require('request');

const mapboxToken = 'pk.eyJ1IjoiZ2FldHoiLCJhIjoiY2s1cDdlcG8xMHQyYjNmbnN0YjJhcmNqeiJ9.kLu5p2ln7vq0X7CyQARZfQ';


function coordinates(city, callback)
{
    const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(city) + '.json?&language=fr&access_token='+ mapboxToken;
    request( {url: url, json: true} , (error, response) => {
        if(error) {
            console.log('Unable to connect to geocode API.');
        } else if(response.body.error) {
            console.log('Unable to find location.');
        } else {
            latitude = response.body.features[0].center[1];
            longitude = response.body.features[0].center[0];
            data = { latitude, longitude };
            callback(error, data);
        }
    });
}
function displayWeather(data, callback)
{
    const { latitude, longitude } = data;
    const url = 'https://api.darksky.net/forecast/ad95e11dbf8fe6961a05425dea338c24/'+latitude+','+longitude+'?lang=fr&units=si';

    request( { url: url }, (error, response) => {
        if(error) {
            console.log('Unable to connect to weather API.');
            return;
        }
        const res = JSON.parse(response.body);
        if (res.error) {
            console.log('Unable to find location\'s weather');
        } else {
            return callback(undefined, { summary: res.daily.data[0].summary, temperature: res.currently.temperature, precip: res.currently.precipProbability });
        }
    });
}

function weather(city, callback) {
    coordinates(city, (error, data) => {
        if (error) {
            console.log(error);
            return;
        }
        displayWeather(data, callback);
    });
}

module.exports = {
    weather
}