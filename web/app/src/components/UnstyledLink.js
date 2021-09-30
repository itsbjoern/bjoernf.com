import React from 'react'
import { Link } from 'react-router-dom'
import styled from '@emotion/styled'

import { isSSR } from 'app/util'

const UnstyledLink = styled(Link)`
  &&& {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: initial;
  }
`

const ConsiderSSR = ({ to, ...props }) =>
  typeof to !== 'string' ? (
    <div {...props} />
  ) : (
    <UnstyledLink to={(isSSR ? '/node' : '') + to} {...props} />
  )

export default ConsiderSSR
