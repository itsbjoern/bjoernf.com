import React, { useEffect, useState } from 'react'
import { FormControlLabel, Switch } from '@mui/material'

import { getViews } from 'app/api/admin'
import { withRequest } from 'app/providers/RequestProvider'

import { Column, Row } from 'app/components/Flex'
import ViewCount from './Charts/ViewCount'
import Journey from './Charts/Journey'
import Funnel from './Charts/Funnel'

const Analytics = ({ sendRequest }) => {
  const [fetchedViews, setFetchedViews] = useState([])
  const [views, setViews] = useState()
  const [includeAdmin, setIncludeAdmin] = useState(false)

  useEffect(() => {
    sendRequest(getViews()).success((data) => {
      setFetchedViews(data.views)
    })
  }, [])

  useEffect(() => {
    setViews(fetchedViews.filter((v) => (includeAdmin || !v.isAdmin) && !v.isProbablyBot && v.jsEnabled))
  }, [fetchedViews, includeAdmin])

  if (!views) {
    return <div>Loading...</div>
  }

  return (
    <Column style={{ marginTop: 50 }} gap={50}>
      <Row>
        <FormControlLabel
          control={
            <Switch
              checked={includeAdmin}
              onChange={() => setIncludeAdmin((prev) => !prev)}
            />
          }
          label="Include admin views"
        />
      </Row>
      <Row>
        <ViewCount views={views} />
        <Journey views={views} />
      </Row>
      <Row>
        <Funnel views={views} />
      </Row>
    </Column>
  )
}

export default withRequest(Analytics)
