/* 2. Create a comment application for our posts */

const express = require('express')
const bodyParser = require('body-parser')
const { randomBytes } = require('crypto')
const cors = require('cors')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

const commentsByPostIds = {}

app.get('/posts/:id/comments', (req, res) => {
    res.send(commentsByPostIds[req.params.id] || [])
})

app.post('/posts/:id/comments', (req, res) => {
    const commentId = randomBytes(4).toString('hex')
    const { content } = req.body

    const comments = commentsByPostIds[req.params.id] || []
    comments.push({ id: commentId, content })
    commentsByPostIds[req.params.id] = comments
    res.status(201).send(comments)
})

app.listen(4001, () => {
    console.log('Comments server listening on 4001')
})