import React from 'react'

import { Divider } from '@mui/material'

import { Column } from 'app/components/Flex'
import { H2, H4 } from 'app/components/Text'
import Ref from 'app/components/Ref'

const Projects = () => {
  return (
    <Column gap={30}>
      <span>
        <H2>Projects</H2>
      </span>
      <span>
        <H4>Research</H4>
      </span>
      <Column>
        <Ref
          text="Discovering Types of Smartphone Usage Sessions from User-App Interactions"
          href="https://ieeexplore.ieee.org/abstract/document/9431034"
        />
        In this paper, we examine how embedding physical user-app activity
        (e.g., taps and scrolls) can provide a rich basis for summarising device
        usage. Using a large dataset of 82,758,449 interaction events from 86
        users over an 8-week period we combine feature embedding and
        unsupervised learning to extract prominent interactions within clusters
        of smartphone usage sessions.
      </Column>
      <span>
        <Divider />
      </span>
      <span>
        <H4>Code</H4>
      </span>
      <span></span>
    </Column>
  )
}

export default Projects
