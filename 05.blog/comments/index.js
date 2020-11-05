/* 2. Create a comment application for our posts */

const express = require('express')
const bodyParser = require('body-parser')
const { randomBytes } = require('crypto')
const cors = require('cors')
const axios = require('axios')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

const commentsByPostId = {}

app.get('/posts/:id/comments', (req, res) => {
    res.send(commentsByPostId[req.params.id] || [])
})

/*
app.post('/posts/:id/comments', (req, res) => {
    const commentId = randomBytes(4).toString('hex')
    const { content } = req.body

    const comments = commentsByPostIds[req.params.id] || []
    comments.push({ id: commentId, content })
    commentsByPostIds[req.params.id] = comments
    res.status(201).send(comments)
})
*/

/*
app.post('/posts/:id/comments', async (req, res) => {
    const commentId = randomBytes(4).toString('hex')
    const { content } = req.body

    const comments = commentsByPostId[req.params.id] || []
    //comments.push({ id: commentId, content })
    comments.push({ id: commentId, content, status: 'pending' })

    await axios.post('http://localhost:4005/events', {
        type: 'CommentCreated',
        //data: { id: commentId, content, postId: req.params.id }
        data: { id: commentId, content, postId: req.params.id, status: 'pending' }
        }
    )

    commentsByPostId[req.params.id] = comments
    res.status(201).send(comments)
})


app.post('/events', async (req, res) => {
    console.log('Received Event:', req.body.type)

    // Add for moderation
    const { type, data } = req.body
    if (type === 'CommentModerated') {
        const { postId, id, status, content } = data
        const comments = commentsByPostId[postId]
        const comment = comments.find(comment => comment.id === id)
        comment.status = status
        await axios.post('http://localhost:4005/events', {
            type: 'CommentUpdated',
            data: { id, status, content, postId }
        })
    }


    res.send({})
})

*/

app.post('/posts/:id/comments', async (req, res) => {
    const commentId = randomBytes(4).toString('hex')
    const { content } = req.body

    const comments = commentsByPostId[req.params.id] || []
    //comments.push({ id: commentId, content })
    comments.push({ id: commentId, content, status: 'pending' })

    await axios.post('http://event-bus-srv:4005/events', {
        type: 'CommentCreated',
        //data: { id: commentId, content, postId: req.params.id }
        data: { id: commentId, content, postId: req.params.id, status: 'pending' }
        }
    )

    commentsByPostId[req.params.id] = comments
    res.status(201).send(comments)
})

app.post('/events', async (req, res) => {
    console.log('Received Event:', req.body.type)

    // Add for moderation
    const { type, data } = req.body
    if (type === 'CommentModerated') {
        const { postId, id, status, content } = data
        const comments = commentsByPostId[postId]
        const comment = comments.find(comment => comment.id === id)
        comment.status = status
        await axios.post('http://event-bus-srv:4005/events', {
            type: 'CommentUpdated',
            data: { id, status, content, postId }
        })
    }


    res.send({})
})

app.listen(4001, () => {
    console.log('Comments server listening on 4001')
})