/*
import React, {useState, useEffect} from 'react'
import axios from 'axios'
*/
import React from 'react'

const CommentList = (props) => {
  const { comments } = props

  /*  // First way to get comments
  const { postId } = props
  const [comments, setComments] = useState([])

  const fetchData = async () => {
    const res = await axios.get(`http://localhost:4001/posts/${postId}/comments`)
    setComments(res.data)
  }

  // Trigger fetchPosts only once when the PostList is loaded
  useEffect( () => {
    fetchData(); // eslint-disable-next-line
  }, [])
  */

  // Now comments are passed by props
  const renderedComments = comments.map(comment => {
    return <li key={comment.id}>{comment.content}</li>
  })

  return <ul>{renderedComments}</ul>
}

export default CommentList
