import React from 'react'

import { Link, withRouter } from 'react-router-dom'
import { Button } from '@mui/material'
import styled from 'styled-components'

const NavLink = styled(Link)`
  text-decoration: none;
`

const Nav = () => {
  return (
    <nav>
      <NavLink to="/">
        <Button variant="text">Home</Button>
      </NavLink>
      <NavLink to="/blog">
        <Button variant="text">Blog</Button>
      </NavLink>
      <NavLink to="/projects">
        <Button variant="text">Projects</Button>
      </NavLink>
    </nav>
  )
}

export default withRouter(Nav)
