import React, { useState, useEffect, useCallback } from 'react'

import {
  IconButton,
  TextField,
  Autocomplete,
  InputAdornment,
} from '@mui/material'
import { Subtitles, Loyalty, ControlPoint } from '@mui/icons-material'

import { withRequest } from 'app/providers/RequestProvider'
import { getTags } from 'app/api/blog'
import { upload } from 'app/api/admin'

import { isDev } from 'app/util'

import { Row, Column } from 'app/components/Flex'
import RichText from 'app/components/RichText'
import Tag from 'app/components/Tag'

const PostEditor = ({ post, updatePost, sendRequest }) => {
  const [newTag, setNewTag] = useState('')

  const [availableTags, setAvailableTags] = useState([])

  useEffect(() => {
    sendRequest(getTags()).then(({ tags }) => {
      setAvailableTags(tags)
    })
  }, [])

  const uploadHandler = useCallback(
    (file) =>
      sendRequest(upload(post._id, file)).then(({ src, fileName }) => {
        if (isDev) {
          src = 'http://127.0.0.1:8000' + src
        }

        return Promise.resolve({ src, fileName })
      }),
    [post._id]
  )

  return (
    <Column gap={30}>
      <Row gap={15} align="center" wrapping>
        <Autocomplete
          style={{ flex: 1 }}
          size="small"
          freeSolo={true}
          value={newTag}
          options={availableTags}
          disablePortal={true}
          onChange={(event, name) => setNewTag(name)}
          renderInput={({ InputProps, ...rest }) => (
            <TextField
              size="small"
              onChange={(event) => setNewTag(event.target.value)}
              label="Add Tag"
              onKeyDown={(e) => {
                if (newTag === '' || post.tags?.includes(newTag)) {
                  return
                }
                if (e.key === 'Enter') {
                  updatePost({ tags: [...(post.tags || []), newTag] })
                  setNewTag('')
                }
              }}
              InputProps={{
                ...InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <Loyalty />
                  </InputAdornment>
                ),
              }}
              {...rest}
            />
          )}
        />
        <IconButton
          size="small"
          disabled={newTag === '' || post.tags?.includes(newTag)}
          onClick={() => {
            updatePost({ tags: [...(post.tags || []), newTag] })
            setNewTag('')
          }}
        >
          <ControlPoint />
        </IconButton>
        <Row gap={5} flexed wrapping>
          {post.tags?.map((t, i) => {
            return (
              <Tag
                key={t}
                name={t}
                onDelete={() => {
                  post.tags.splice(i, 1)
                  const newTags = [...post.tags]
                  updatePost({ tags: newTags })
                }}
              />
            )
          })}
        </Row>
      </Row>
      <TextField
        value={post.title}
        onChange={(event) => updatePost({ title: event.target.value })}
        label="Title"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Subtitles />
            </InputAdornment>
          ),
        }}
      />
      <RichText
        content={post.html}
        onChange={updatePost}
        upload={uploadHandler}
      />
    </Column>
  )
}

export default withRequest(PostEditor)
