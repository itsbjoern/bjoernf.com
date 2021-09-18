import React from 'react'

import { Link, withRouter } from 'react-router-dom'
import styled from 'styled-components'
import { Button, Avatar, Divider, Chip } from '@mui/material'
import { withTheme } from '@mui/styles'
import { ArrowCircleUp, LinkedIn, GitHub } from '@mui/icons-material'

import { Row, Column } from 'app/components/Flex'
import { H3 } from 'app/components/Text'

const NavLink = styled(Link)`
  text-decoration: none;
`

const Header = withTheme(styled(Column)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding: 15px;
`)

const Nav = () => {
  return (
    <Header gap={15}>
      <Row justify="between" align="center">
        <Row align="center">
          <Avatar sx={{ width: 70, height: 70 }} src="/public/images/me.png" />
          <Column justify="evenly" style={{ marginLeft: 10 }} gap={5}>
            <H3>Björn Friedrichs</H3>
            <Row gap={5}>
              <ArrowCircleUp sx={{ fontSize: '1.1em' }} />
              <span>That's me</span>
            </Row>
          </Column>
        </Row>
        <Row as="nav" gap={15}>
          <NavLink to="/">
            <Button variant="text">Home</Button>
          </NavLink>
          <NavLink to="/blog">
            <Button variant="text">Blog</Button>
          </NavLink>
          <NavLink to="/projects">
            <Button variant="text">Projects</Button>
          </NavLink>
        </Row>
      </Row>

      <Divider />
      <Row justify="end" gap={15}>
        <Chip
          component="a"
          icon={<GitHub />}
          href="https://github.com/BFriedrichs"
          label="BFriedrichs"
          variant="outlined"
          clickable
          target="_blank"
        />
        <Chip
          component="a"
          icon={<LinkedIn />}
          href="https://linkedin.com/in/bjoern-friedrichs"
          label="bjoern-friedrichs"
          variant="outlined"
          clickable
          target="_blank"
        />
      </Row>
    </Header>
  )
}

export default withRouter(Nav)
