import React, { useState, useEffect } from 'react'
import { ResponsiveChord } from '@nivo/chord'

import { Column } from 'app/components/Flex'
import { H2 } from 'app/components/Text'

const endMarker = '/endSession'

const Journey = ({ views }) => {
  const [keys, setKeys] = useState()
  const [matrixData, setMatrixData] = useState()

  useEffect(() => {
    const currLinks = {}

    views.forEach((v) => {
      v.paths.forEach((path, i) => {
        const sourceUrl = path.url
        const destUrl = i < v.paths.length - 1 ? v.paths[i + 1].url : endMarker

        const sourceMarker = sourceUrl
        const destMarker = destUrl

        currLinks[sourceMarker] = currLinks[sourceMarker] || {}
        currLinks[sourceMarker][destMarker] =
          currLinks[sourceMarker][destMarker] || 0
        currLinks[sourceMarker][destMarker] += 1
      })
    })

    const currKeys = Object.keys(currLinks)
    currKeys.push(endMarker)
    const currMatrix = currKeys.map((source) => {
      const row = new Array(currKeys.length).fill(0)
      currKeys.forEach((dest, j) => {
        const sourceLink = currLinks[source] || {}
        row[j] += sourceLink[dest] || 0
      })
      return row
    })

    setKeys(currKeys)
    setMatrixData(currMatrix)
  }, [views])

  return (
    <Column style={{ height: 350 }} flexed>
      <H2>Journey</H2>
      <ResponsiveChord matrix={matrixData} keys={keys} padAngle={0.1} />
    </Column>
  )
}

export default Journey
