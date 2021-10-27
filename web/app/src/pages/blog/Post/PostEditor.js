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
    sendRequest(getTags()).success(({ tags }) => {
      setAvailableTags(tags)
    })
  }, [])

  const {
    title = '',
    tags = [],
    html = '',
  } = { ...post.published, ...post.draft }
  const uploadHandler = useCallback(
    (file) =>
      sendRequest(upload(post._id, file)).success(({ src, fileName }) => {
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
          options={availableTags || []}
          disablePortal={true}
          onChange={(event, name) => setNewTag(name)}
          renderInput={({ InputProps, ...rest }) => (
            <TextField
              size="small"
              onChange={(event) => setNewTag(event.target.value)}
              label="Add Tag"
              onKeyDown={(e) => {
                if (newTag === '' || tags?.includes(newTag)) {
                  return
                }
                if (e.key === 'Enter') {
                  updatePost({ tags: [...(tags || []), newTag] })
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
          disabled={newTag === '' || tags?.includes(newTag)}
          onClick={() => {
            updatePost({ tags: [...(tags || []), newTag] })
            setNewTag('')
          }}
        >
          <ControlPoint />
        </IconButton>
        <Row gap={5} flexed wrapping>
          {tags?.map((t, i) => {
            return (
              <Tag
                key={t}
                name={t}
                onDelete={() => {
                  tags.splice(i, 1)
                  const newTags = [...tags]
                  updatePost({ tags: newTags })
                }}
              />
            )
          })}
        </Row>
      </Row>
      <TextField
        value={title}
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
      <RichText content={html} onChange={updatePost} upload={uploadHandler} />
    </Column>
  )
}

export default withRequest(PostEditor)
