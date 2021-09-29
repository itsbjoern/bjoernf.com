import React from 'react'

import { withRouter } from 'react-router-dom'
import styled from '@emotion/styled'
import { withTheme } from '@mui/styles'

import { morphMixin } from 'app/theme'
import { Row, Column } from 'app/components/Flex'
import Ref from 'app/components/Ref'

const BG = withTheme(styled(Column)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding: 30px;
  ${morphMixin()}
  border-radius: 10px 10px 0 0;
`)

const Footer = () => {
  return (
    <BG gap={15}>
      <Row justify="between">
        <span>© Björn Friedrichs 2021</span>
        <Ref text={'privacy & more'} href="/about" />
      </Row>
    </BG>
  )
}

export default withRouter(Footer)
