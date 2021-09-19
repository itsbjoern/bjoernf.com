import React, { useContext, useState, useEffect } from 'react'
import { RequestContext } from 'app/providers/RequestProvider'
import { NotificationContext } from 'app/providers/NotificationProvider'

import { getPosts } from 'app/api/admin'

const BlogPostList = () => {
  const [posts, setPosts] = useState([])
  const { sendRequest } = useContext(RequestContext)
  const { createNotification } = useContext(NotificationContext)

  useEffect(() => {
    sendRequest(getPosts())
      .then(({ posts }) => setPosts(posts))
      .catch((err) => createNotification(`Fetch failed: ${err}`, 'error'))
  }, [])

  return <div></div>
}

export default BlogPostList
