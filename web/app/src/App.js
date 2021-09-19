import React, { useState } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import {
  Container,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material'

import themeTemplate from 'app/theme'

import Nav from 'app/components/Nav'
import Home from 'app/pages/home/Home'
import Blog from 'app/pages/blog/Blog'

const App = () => {
  const [theme] = useState(() => createTheme(themeTemplate))

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <Container maxWidth="md">
          <Nav />
          <div style={{ padding: 15 }}>
            <Typography>
              <Switch>
                <Route exact path="/">
                  <Home />
                </Route>
                <Route exact path="/blog">
                  <Blog />
                </Route>
              </Switch>
            </Typography>
          </div>
        </Container>
      </ThemeProvider>
    </Router>
  )
}

export default App
