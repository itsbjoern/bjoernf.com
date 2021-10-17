import React, { useEffect, useState } from 'react'
import {
  BrowserRouter,
  StaticRouter,
  Switch,
  Route,
  withRouter,
} from 'react-router-dom'

import {
  Container,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material'
import styled from '@emotion/styled'

import themeTemplate from 'app/theme'
import { isSSR } from 'app/util'
import { Column } from 'app/components/Flex'
import Analytics from 'app/components/Analytics'

import NotificationProvider from 'app/providers/NotificationProvider'
import RequestProvider from 'app/providers/RequestProvider'
import NoJsBanner from 'app/components/NoJsBanner'
import Header from 'app/components/Header'
import Footer from 'app/components/Footer'
import Home from 'app/pages/home/Home'
import Blog from 'app/pages/blog/Blog'
import Projects from 'app/pages/projects/Projects'
import Post from 'app/pages/blog/Post'
import Admin from 'app/pages/admin/Admin'
import About from 'app/pages/about/About'

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

const SSRSupport = ({ ssr, children }) => {
  return (
    <StaticRouter location={ssr.rel_url} staticContext={ssr}>
      {children}
    </StaticRouter>
  )
}

const RouterLayer = isSSR ? SSRSupport : BrowserRouter

const HistoryLayer = withRouter(({ children, history }) => {
  useEffect(() => {
    const unsub = history.listen((location) => {
      const path = location.pathname
      let title = ''
      if (path === '/') {
        title = 'Home'
      } else {
        const firstItem = path.split('/')[1]
        title = firstItem.charAt(0).toUpperCase() + firstItem.slice(1)
      }

      document.title = `${title} - Björn F`
    })
    return unsub
  }, [])

  return children
})

const App = (props) => {
  const [theme] = useState(() => createTheme(themeTemplate))

  return (
    <ThemeProvider theme={theme}>
      <AppStyle theme={theme}>
        <NotificationProvider>
          <RequestProvider>
            <RouterLayer ssr={props.ssr}>
              <HistoryLayer>
                <Analytics>
                  <Column flexed>
                    <NoJsBanner />
                    <AdaptiveContainer maxWidth="md">
                      <Typography component={Column} flexed>
                        <Header />
                        <Column
                          style={{
                            paddingTop: 45,
                            paddingBottom: 45,
                            paddingLeft: 5,
                            paddingRight: 5,
                            maxWidth: '100vw',
                          }}
                          flexed
                        >
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
                            <Route exact path="/about">
                              <About />
                            </Route>
                          </Switch>
                        </Column>
                        <Footer />
                        <NavigationButtons mobile />
                      </Typography>
                    </AdaptiveContainer>
                  </Column>
                </Analytics>
              </HistoryLayer>
            </RouterLayer>
          </RequestProvider>
        </NotificationProvider>
      </AppStyle>
    </ThemeProvider>
  )
}

export default App
