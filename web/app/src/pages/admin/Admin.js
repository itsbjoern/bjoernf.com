import React, { useContext } from 'react'

import { withRouter } from 'react-router-dom'
import { Tabs, Tab } from '@mui/material'

import { RequestContext } from 'app/providers/RequestProvider'
import { Row, Column } from 'app/components/Flex'
import Login from './Login'
import BlogPostList from './tabs/BlogPostList'

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

const Admin = ({ location, history }) => {
  const { token } = useContext(RequestContext)
  const hashSplit = location.hash?.split('-')
  const currentTab =
    hashSplit && hashSplit.length > 1 ? parseInt(hashSplit[1]) : 0

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
          <LinkedTab label="Blog" index={1} />
        </Tabs>
      </Row>
      <Panel value={currentTab} index={0}>
        Item One
      </Panel>
      <Panel value={currentTab} index={1}>
        <BlogPostList />
      </Panel>
    </Column>
  )
}

export default withRouter(Admin)
