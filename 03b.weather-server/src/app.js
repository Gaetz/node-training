const express = require('express');
const app = express();

// For default path
app.get('', (req, res) => {     // req: request data, res: response
    res.send('Hello express');
});

app.get('/help', (req, res) => {
    res.send('Help page');
});


app.get('/about', (req, res) => {
    res.send('About page');
});


app.get('/weather', (req, res) => {
    res.send('The weather is...');
});

// Starts the server on port 3000
app.listen(3000, () => {
    console.log('Server has started on port 3000');
});