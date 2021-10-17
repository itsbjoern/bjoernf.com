import React, { useRef, useCallback, useState } from 'react'

import { withRouter } from 'react-router-dom'
import { getPost } from 'app/api/blog'
import {
  updatePost as updatePostAPI,
  publishPost as publishPostAPI,
  unpublishPost as unpublishPostAPI,
  deletePost as deletePostAPI,
} from 'app/api/admin'

import { Alert, Button, FormControlLabel, Switch } from '@mui/material'
import { Delete } from '@mui/icons-material'

import { useSSR } from 'app/providers/SSRProvider'
import { withRequest } from 'app/providers/RequestProvider'
import { withNotification } from 'app/providers/NotificationProvider'
import NotFound from 'app/pages/404'

import { Row, Column } from 'app/components/Flex'
import FloatAside from 'app/components/FloatAside'
import { useDialog } from 'app/components/Dialog'

import PostEditor from './PostEditor'
import PostView from './PostView'

const filterEmpty = (dict) =>
  !dict
    ? {}
    : Object.entries(dict)
        .filter(([_, v]) => !!v)
        .reduce((p, [k, v]) => {
          p[k] = v
          return p
        }, {})

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
  const [isComparing, setIsComparing] = useState(false)
  const editing = location.hash === '#edit' && !!token
  const updateTimeout = useRef()

  const [post, setPost] = useSSR(() => sendRequest(getPost(postId)), {
    chainThen: (data) => {
      const title = (data.post.published ?? data.post.draft).title
      document.title = `${title} - Björn F`
      return data.post
    },
    chainFinally: () => setLoading(false),
  })

  const updatePost = useCallback(
    (update) => {
      setPost({
        ...post,
        draft: {
          ...filterEmpty(post.published),
          ...filterEmpty(post.draft),
          ...update,
        },
      })
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current)
        updateTimeout.current = null
      }
      updateTimeout.current = setTimeout(() => {
        sendRequest(updatePostAPI(post._id, update)).then(({ post: _ }) => {
          createNotification('Post saved', 'success', 1000)
        })
      }, 700)
    },
    [post]
  )

  const publishPost = useCallback(() => {
    sendRequest(publishPostAPI(post._id))
      .then(({ post: updatedPost }) => {
        setPost(updatedPost)
        history.push('#')
        createNotification('Post published', 'success')
      })
      .catch(() => {
        createNotification('Publish failed', 'error')
      })
  }, [post])

  const unpublishPost = useCallback(() => {
    sendRequest(unpublishPostAPI(post._id))
      .then(({ post: updatedPost }) => {
        setPost(updatedPost)
        createNotification('Post published', 'success')
      })
      .catch(() => {
        createNotification('Publish failed', 'error')
      })
  }, [post])

  const deletePost = useCallback(() => {
    sendRequest(deletePostAPI(post._id))
      .then(() => {
        createNotification('Post deleted', 'success')
        history.push('/admin#tab-1')
      })
      .catch((e) => {
        createNotification(e.message, 'error')
      })
  }, [post])

  const [PublishDialog, openPublishDialog] = useDialog(
    'Are you sure you want to publish this post? This will make it available to the public.',
    publishPost
  )
  const [UnPublishDialog, openUnPublishDialog] = useDialog(
    'Are you sure you want to unpublish this post? Readers will be unable to access it.',
    unpublishPost
  )
  const [DeleteDialog, openDeleteDialog] = useDialog(
    'Are you sure you want to delete this post? This will remove it permanently.',
    deletePost
  )

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
            <PublishDialog />
            <UnPublishDialog />
            <DeleteDialog />
            <Alert severity={post.draft ? 'warning' : 'success'}>
              Status:{' '}
              {!post.published ? 'Draft' : `Version ${post.published.version}`}
              {post.published && post.draft ? ' (Changes)' : ''}
            </Alert>
            <Row justify="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={editing}
                    onChange={() => {
                      history.push(!editing ? '#edit' : '#')
                    }}
                  />
                }
                label="Edit Mode"
              />
            </Row>
            <Row justify="center">
              <FormControlLabel
                control={
                  <Switch
                    disabled={!post.draft || !post.published}
                    checked={isComparing}
                    onChange={() => {
                      setIsComparing(!isComparing)
                    }}
                  />
                }
                label="Compare"
              />
            </Row>
            <Button
              variant="contained"
              onClick={openPublishDialog}
              disabled={!post.draft?.text || !post.draft?.title}
            >
              Publish
            </Button>
            {post.published ? (
              <Button
                variant="contained"
                color="secondary"
                onClick={openUnPublishDialog}
              >
                Un-publish
              </Button>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                onClick={openDeleteDialog}
              >
                <Delete />
              </Button>
            )}
          </Column>
        ) : null
      }
    >
      <Column>
        <Row gap={20}>
          <Column flexed>
            {token && editing ? (
              <PostEditor post={post} updatePost={updatePost} />
            ) : (
              <PostView
                postData={
                  isComparing || !post.published
                    ? { ...post.published, ...post.draft }
                    : { ...post.published }
                }
                createdAt={post.createdAt}
                hideShare={isComparing}
              />
            )}
          </Column>
          {isComparing ? (
            <Column flexed>
              <PostView
                postData={post.published}
                createdAt={post.createdAt}
                hideShare
              />
            </Column>
          ) : null}
        </Row>
      </Column>
    </FloatAside>
  )
}

export default withRouter(withRequest(withNotification(Post)))
