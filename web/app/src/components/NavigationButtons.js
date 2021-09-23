import React from 'react'

import { withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { BottomNavigation, BottomNavigationAction } from '@mui/material'
import { Home, Receipt, AccountTree } from '@mui/icons-material'

const StyledNav = styled(BottomNavigation)`
  &&& {
    @media only screen and (max-width: 425px) {
      ${({ mobile }) => (!mobile ? 'display: none;' : '')}
      position: sticky;
      bottom: 0;
      left: 0;
      width: 100%;
    }

    @media only screen and (min-width: 426px) {
      ${({ mobile }) => (mobile ? 'display: none;' : '')}
    }
  }
`

const paths = ['/', '/blog', '/projects']
const NavigationButtons = ({ location, history, mobile }) => {
  const split = location.pathname.split('/')
  const menuIndex = split.length === 1 ? 0 : paths.indexOf('/' + split[1])

  return (
    <StyledNav
      showLabels
      value={menuIndex}
      onChange={(event, newValue) => {
        history.push(paths[newValue])
      }}
      mobile={mobile ? 'true' : null}
    >
      <BottomNavigationAction label="Home" icon={<Home />} />
      <BottomNavigationAction label="Blog" icon={<Receipt />} />
      <BottomNavigationAction label="Projects" icon={<AccountTree />} />
    </StyledNav>
  )
}

export default withRouter(NavigationButtons)
