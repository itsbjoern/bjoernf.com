import React, { useState, useEffect } from 'react'
import { List, Pagination, TextField, InputAdornment } from '@mui/material'
import { Search } from '@mui/icons-material'

import { withRouter } from 'react-router-dom'

import { getPosts } from 'app/api/blog'
import { withRequest } from 'app/providers/RequestProvider'
import { withNotification } from 'app/providers/NotificationProvider'

import { Row, Column } from 'app/components/Flex'
import { H2 } from 'app/components/Text'
import PostItem from 'app/components/PostItem'

const makeQuery = (page, search) => {
  const params = {}
  if (page) {
    params.page = page
  }
  if (search) {
    params.search = search
  }

  return (
    '?' +
    Object.entries(params)
      .map(([key, val]) => `${key}=${val}`)
      .join('&')
  )
}

const Blog = ({ history, location, sendRequest, createNotification }) => {
  const [posts, setPosts] = useState([])
  const [pageCount, setPageCount] = useState(1)

  const query = new URLSearchParams(location.search)
  const currentPage = parseInt(query.get('page')) || 1
  const currentSearch = query.get('search') || ''

  useEffect(() => {
    sendRequest(getPosts({ page: currentPage, search: currentSearch }))
      .then(({ posts, numPages }) => {
        setPosts(posts)
        setPageCount(numPages)
      })
      .catch((err) => createNotification(`Fetch failed: ${err}`, 'error'))
  }, [currentPage, currentSearch])

  return (
    <Column>
      <Row justify="between">
        <H2>Recent posts</H2>

        <Row justify="end">
          <TextField
            size="small"
            value={currentSearch}
            onChange={(event) =>
              history.push(makeQuery(currentPage, event.target.value))
            }
            label="Search"
            placeholder="Title, tag or content"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '0.85em',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Row>
      </Row>
      <Column>
        <List>
          {posts.map((p) => (
            <PostItem key={p._id} post={p} />
          ))}
        </List>
      </Column>
      <Pagination
        onChange={(event, value) => makeQuery(value, currentSearch)}
        page={currentPage}
        count={pageCount}
        color="primary"
      />
    </Column>
  )
}

export default withRouter(withRequest(withNotification(Blog)))
