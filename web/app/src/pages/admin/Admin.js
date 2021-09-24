import React, { useState, useEffect } from 'react'

import { withRouter } from 'react-router-dom'
import { Button, Tabs, Tab, List } from '@mui/material'
import { AddCircle } from '@mui/icons-material'
import { getDrafts, createPost } from 'app/api/admin'

import { withRequest } from 'app/providers/RequestProvider'
import { Row, Column } from 'app/components/Flex'
import PostItem from 'app/components/PostItem'
import FloatAside from 'app/components/FloatAside'
import Login from './Login'

const LinkedTab = withRouter(({ label, index, history, ...props }) => (
  <Tab
    label={label}
    onClick={() => history.push(`#tab-${index}`)}
    id={`simple-tab-${index}`}
    {...{
      'aria-controls': `simple-tabpanel-${index}`,
      'aria-selected': props['aria-selected'],
    }}
  />
))

const Panel = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index ? children : null}
    </div>
  )
}

const Admin = ({ location, history, token, sendRequest }) => {
  const [draftPosts, setDraftPosts] = useState([])

  const hashSplit = location.hash?.split('-')
  const currentTab =
    hashSplit && hashSplit.length > 1 ? parseInt(hashSplit[1]) : 0

  useEffect(() => {
    if (token) {
      sendRequest(getDrafts()).then(({ posts }) => {
        setDraftPosts(posts)
      })
    }
  }, [token])

  if (!token) {
    return <Login />
  }

  return (
    <Column>
      <Row>
        <Tabs
          value={currentTab}
          onChange={(evt, newTab) => history.push(`#tab-${newTab}`)}
          aria-label="basic tabs"
        >
          <LinkedTab label="Main" index={0} />
          <LinkedTab label="Drafts" index={1} />
        </Tabs>
      </Row>
      <Panel value={currentTab} index={0}></Panel>
      <Panel value={currentTab} index={1}>
        <FloatAside
          menu={
            token ? (
              <Column>
                <Button
                  startIcon={<AddCircle />}
                  variant="contained"
                  onClick={() => {
                    sendRequest(createPost()).then(({ post }) => {
                      history.push(`/blog/${post._id}#edit`)
                    })
                  }}
                >
                  New post
                </Button>
              </Column>
            ) : null
          }
        >
          <List>
            {draftPosts.map((p) => (
              <PostItem key={p._id} post={p} />
            ))}
          </List>
        </FloatAside>
      </Panel>
    </Column>
  )
}

export default withRouter(withRequest(Admin))
