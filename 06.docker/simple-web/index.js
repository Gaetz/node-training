const express = require('express')

const app = express()

app.get('/', (req, res) => {
    res.send('Hello docker')
})

app.listen(8080, () => {
    console.log('Simple app server listening on port 8080')
})