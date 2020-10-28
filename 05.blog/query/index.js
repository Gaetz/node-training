const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')

const app = express()
app.use(bodyParser.json())
app.use(cors())

// Careful, you have to restart 3 servers when restarting this one
const posts = {}

app.get('/posts', (req, res) => {
  res.send(posts)
})
/*
app.post('/events', (req, res) => {
  const { type, data } = req.body

  if (type === 'PostCreated') {
    const { id, title } = data
    posts[id] = { id, title, comments: [] }
  }
  else if (type === 'CommentCreated') {
    //const { id, content, postId } = data
    const { id, content, postId, status } = data
    const post = posts[postId]
    //post.comments.push({ id, content })
    post.comments.push({ id, content, status })
  }
  else if (type === 'CommentUpdated') {
    const { id, content, postId, status } = data
    const post = posts[postId]
    const comment = post.comments.find(comment => comment.id === id)
    comment.status = status
    comment.content = content
  }
  console.log(posts)
  res.send({})
})
*/

const handleEvent = (type, data) => {
  if (type === 'PostCreated') {
    const { id, title } = data
    posts[id] = { id, title, comments: [] }
  }
  else if (type === 'CommentCreated') {
    //const { id, content, postId } = data
    const { id, content, postId, status } = data
    const post = posts[postId]
    //post.comments.push({ id, content })
    post.comments.push({ id, content, status })
  }
  else if (type === 'CommentUpdated') {
    const { id, content, postId, status } = data
    const post = posts[postId]
    const comment = post.comments.find(comment => comment.id === id)
    comment.status = status
    comment.content = content
  }
}

app.post('/events', (req, res) => {
  const { type, data } = req.body
  
  handleEvent(type, data)

  res.send({})
})

/*
app.listen(4002, () => {
  console.log('Query server listening on 4002')
})
*/

app.listen(4002, async () => {
  console.log('Query server listening on 4002')
  const res = await axios.get('http://localhost:4005/events')
  for(let event of res.data) {
    handleEvent(event.type, event.data)
  }
})