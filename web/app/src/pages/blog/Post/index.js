import React, { useRef, useCallback, useState, useEffect } from 'react'

import { withRouter } from 'react-router-dom'
import { getPost } from 'app/api/blog'
import {
  updatePost as updatePostAPI,
  publishPost as publishPostAPI,
} from 'app/api/admin'

import { Alert, Button, FormControlLabel, Switch } from '@mui/material'
import { Delete } from '@mui/icons-material'

import { withRequest } from 'app/providers/RequestProvider'
import { withNotification } from 'app/providers/NotificationProvider'
import NotFound from 'app/pages/404'

import { Row, Column } from 'app/components/Flex'
import FloatAside from 'app/components/FloatAside'

import PostEditor from './PostEditor'
import PostView from './PostView'

const Post = ({
  match,
  location,
  createNotification,
  history,
  sendRequest,
  token,
}) => {
  const postId = match.params.id

  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(location.hash === '#edit' && !!token)
  const [post, setPost] = useState(null)
  const updateTimeout = useRef()

  useEffect(() => {
    sendRequest(getPost(postId))
      .then(({ post }) => setPost(post))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const updatePost = useCallback(
    (update) => {
      setPost({ ...post, ...update })
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current)
        updateTimeout.current = null
      }
      updateTimeout.current = setTimeout(() => {
        sendRequest(updatePostAPI(post._id, update)).then(
          ({ post: updatedPost }) => {
            createNotification('Post saved', 'success', 1000)
            setPost({ ...post, ...updatedPost })
          }
        )
      }, 700)
    },
    [post]
  )

  const publishPost = useCallback(() => {
    sendRequest(publishPostAPI(post._id))
      .then(({ post: updatedPost }) => {
        setPost({ ...post, ...updatedPost })
        createNotification('Post published', 'success')
      })
      .catch(() => {
        createNotification('Publish failed', 'error')
      })
  }, [post])

  if (loading) {
    return null
  }

  if (!loading && !post) {
    return <NotFound />
  }

  return (
    <FloatAside
      menu={
        token ? (
          <Column gap={20}>
            <Alert
              severity={post.draft || post.draftChanges ? 'warning' : 'success'}
            >
              Status:{' '}
              {post.draft
                ? 'Draft'
                : `Version ${post.publishedVersion.version}`}
              {!post.draft && post.draftChanges ? ' (Changes)' : ''}
            </Alert>
            <Row justify="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={editing}
                    onChange={() => {
                      setEditing(!editing)
                      history.push(!editing ? '#edit' : '#')
                    }}
                  />
                }
                label="Edit Mode"
              />
            </Row>
            <Button variant="contained" onClick={() => publishPost()}>
              Publish
            </Button>

            <Button variant="contained" color="secondary">
              <Delete />
            </Button>
          </Column>
        ) : null
      }
    >
      <Column>
        {token && editing ? (
          <PostEditor post={post} updatePost={updatePost} />
        ) : (
          <PostView post={post} />
        )}
      </Column>
    </FloatAside>
  )
}

export default withRouter(withRequest(withNotification(Post)))
