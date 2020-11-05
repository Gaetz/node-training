/* 1. Create a post application */

const express = require('express')
const bodyParser = require('body-parser')
const { randomBytes } = require('crypto')
const cors = require('cors')
const axios = require('axios')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

const posts = {}

app.get('/posts', (req, res) => {
    res.send(posts)
})

/*
app.post('/posts', (req, res) => {
    const id = randomBytes(4).toString('hex')
    const { title } = req.body

    posts[id] = { id, title }

    res.status(201).send(posts[id])
})
*/

app.post('/posts', async (req, res) => {
    const id = randomBytes(4).toString('hex')
    const { title } = req.body

    posts[id] = { id, title }

    //await axios.post('http://localhost:4005/events', {
    await axios.post('http://event-bus-srv:4005/events', {
            type: 'PostCreated',
            data: { id, title }
        }
    )

    res.status(201).send(posts[id])
})

app.post('/events', async (req, res) => {
    console.log('Received Event:', req.body.type)
    res.send({})
})

app.listen(4000, () => {
    console.log('Version update')
    console.log('Posts server listening on 4000')
})