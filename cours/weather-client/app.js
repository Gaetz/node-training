const request = require('request');

const mapboxToken = 'pk.eyJ1IjoiZ2FldHoiLCJhIjoiY2s1cDdlcG8xMHQyYjNmbnN0YjJhcmNqeiJ9.kLu5p2ln7vq0X7CyQARZfQ';

function geocode(city, callback) {
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
            callback(undefined, response.body.daily.data[0].summary + ' Il fait actuellement ' + temperature + ' degrÃ©s et le risque de pluie est de ' + precipProbability * 100 + '%.');
        }
    });
}


geocode('Montpellier', (error, data) => {
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