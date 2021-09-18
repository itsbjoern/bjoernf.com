import React, { useState } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { Container, ThemeProvider, createTheme } from '@mui/material'

import themeTemplate from 'app/theme'

import Nav from 'app/components/Nav'
import Home from 'app/pages/home/Home'
import Blog from 'app/pages/blog/Blog'

const App = () => {
  const [theme] = useState(() => createTheme(themeTemplate))

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <Container>
          <Nav />
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route exact path="/blog">
              <Blog />
            </Route>
          </Switch>
        </Container>
      </ThemeProvider>
    </Router>
  )
}

export default App
