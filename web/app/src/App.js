import React, { useState } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import {
  Container,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material'
import styled from 'styled-components'

import themeTemplate from 'app/theme'
import { Column } from 'app/components/Flex'

import NotificationProvider from 'app/providers/NotificationProvider'
import RequestProvider from 'app/providers/RequestProvider'
import Header from 'app/components/Header'
import Footer from 'app/components/Footer'
import Home from 'app/pages/home/Home'
import Blog from 'app/pages/blog/Blog'
import Projects from 'app/pages/projects/Projects'
import Post from 'app/pages/blog/Post'
import Admin from 'app/pages/admin/Admin'

import NavigationButtons from 'app/components/NavigationButtons'

const AppStyle = styled.div`
  display: flex;
  flex: 1;
  background-color: ${({ theme }) => theme.palette.background.default};
`

const AdaptiveContainer = styled(Container)`
  && {
    display: flex;
    flex: 1;
    flex-direction: column;

    @media only screen and (max-width: 425px) {
      padding-left: 0;
      padding-right: 0;
    }
  }
`

const App = () => {
  const [theme] = useState(() => createTheme(themeTemplate))
  return (
    <ThemeProvider theme={theme}>
      <AppStyle theme={theme}>
        <NotificationProvider>
          <RequestProvider>
            <Router>
              <AdaptiveContainer maxWidth="md">
                <Header />
                <Column
                  style={{
                    paddingTop: 45,
                    paddingBottom: 45,
                    paddingLeft: 5,
                    paddingRight: 5,
                  }}
                  flexed
                >
                  <Typography component={Column} flexed>
                    <Switch>
                      <Route exact path="/">
                        <Home />
                      </Route>
                      <Route exact path="/blog">
                        <Blog />
                      </Route>
                      <Route exact path="/blog/:id">
                        <Post />
                      </Route>
                      <Route exact path="/projects">
                        <Projects />
                      </Route>
                      <Route exact path="/admin">
                        <Admin />
                      </Route>
                    </Switch>
                  </Typography>
                </Column>
                <Footer />
                <NavigationButtons mobile />
              </AdaptiveContainer>
            </Router>
          </RequestProvider>
        </NotificationProvider>
      </AppStyle>
    </ThemeProvider>
  )
}

export default App
