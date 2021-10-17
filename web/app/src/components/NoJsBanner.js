import React from 'react'
import { withRouter } from 'react-router-dom'
import styled from '@emotion/styled'
import { isSSR } from 'app/util'

const Banner = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  background-color: antiquewhite;
  z-index: 999;
  padding: 10px;
`

const NoJsBanner = ({ location }) => {
  if (!isSSR) {
    return null
  }
  return (
    <Banner>
      You landed on the no-js version of this website!&nbsp;
      <a href={`${location.pathname.replace('/node', '')}`}>Click here</a>
      &nbsp;to go back to the dynamic version.
    </Banner>
  )
}

export default withRouter(NoJsBanner)
