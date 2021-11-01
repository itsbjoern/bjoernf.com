import React, { useEffect, useState } from 'react'

import { getViews } from 'app/api/admin'
import { withRequest } from 'app/providers/RequestProvider'

import { Column } from 'app/components/Flex'
import UniqueViews from './Charts/UniqueViews'

const Analytics = ({ sendRequest }) => {
  const [views, setViews] = useState()
  useEffect(() => {
    sendRequest(getViews()).success((data) => {
      setViews(data.views)
    })
  }, [])

  if (!views) {
    return <div>Loading...</div>
  }

  return (
    <Column>
      <UniqueViews views={views} />
    </Column>
  )
}

export default withRequest(Analytics)
