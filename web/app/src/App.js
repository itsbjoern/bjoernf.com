import React, { useState } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import {
  Container,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material'

import themeTemplate from 'app/theme'
import { Column } from 'app/components/Flex'

import NotificationProvider from 'app/providers/NotificationProvider'
import RequestProvider from 'app/providers/RequestProvider'
import Nav from 'app/components/Nav'
import Home from 'app/pages/home/Home'
import Blog from 'app/pages/blog/Blog'
import Admin from 'app/pages/admin/Admin'

const App = () => {
  const [theme] = useState(() => createTheme(themeTemplate))

  return (
    <NotificationProvider>
      <RequestProvider>
        <Router>
          <ThemeProvider theme={theme}>
            <Container as={Column} maxWidth="md">
              <Nav />
              <Column style={{ padding: 15 }} flexed>
                <Typography component={Column} flexed>
                  <Switch>
                    <Route exact path="/">
                      <Home />
                    </Route>
                    <Route exact path="/blog">
                      <Blog />
                    </Route>
                    <Route exact path="/admin">
                      <Admin />
                    </Route>
                  </Switch>
                </Typography>
              </Column>
            </Container>
          </ThemeProvider>
        </Router>
      </RequestProvider>
    </NotificationProvider>
  )
}

export default App
