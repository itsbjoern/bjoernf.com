import React, { useState, useEffect } from 'react'
import { ResponsiveLine } from '@nivo/line'

import { reduceData } from './utils'
import { Column } from 'app/components/Flex'
import { H2 } from 'app/components/Text'

const UniqueViews = ({ views }) => {
  const [viewData, setViewData] = useState()
  useEffect(() => {
    const getDate = (v) => new Date(v.createdAt * 1000)
    const reducedUnqiue = reduceData(views, {
      key: (v) => getDate(v).toDateString().split(' ').slice(1, 3).join(' '),
      reduce: (p) => p + 1,
      init: 0,
      toAxes: true,
    })
    const reducedTotal = reduceData(views, {
      key: (v) => getDate(v).toDateString().split(' ').slice(1, 3).join(' '),
      reduce: (p, c) => p + c.paths.length,
      init: 0,
      toAxes: true,
    })
    setViewData([
      {
        id: 'unique',
        data: reducedUnqiue,
      },
      {
        id: 'total',
        data: reducedTotal,
      },
    ])
  }, [views])

  return (
    <Column style={{ height: 250, width: 500 }}>
      <H2>Unique Views</H2>
      <ResponsiveLine
        data={viewData}
        margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
      />
    </Column>
  )
}

export default UniqueViews
