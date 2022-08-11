import React, { useEffect, useState } from 'react';
import {
  BrowserRouter,
  StaticRouter,
  Switch,
  Route,
  useHistory,
} from 'react-router-dom';
import {
  Container,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import styled from '@emotion/styled';
import * as ackeeTracker from 'ackee-tracker';

import NotFound from 'app/pages/404';
import themeTemplate from 'app/theme';
import { isSSR } from 'app/util';
import { Column } from 'app/components/Flex';
import NotificationProvider from 'app/providers/NotificationProvider';
import RequestProvider from 'app/providers/RequestProvider';
import Header from 'app/components/Header';
import Footer from 'app/components/Footer';
import Home from 'app/pages/home/Home';
import Blog from 'app/pages/blog/Blog';
import Projects from 'app/pages/projects/Projects';
import Post from 'app/pages/blog/Post';
import Admin from 'app/pages/admin/Admin';
import About from 'app/pages/about/About';
import NavigationButtons from 'app/components/NavigationButtons';

const AppStyle = styled.div`
  display: flex;
  flex: 1;
  background-color: ${({ theme }) => theme.palette.background.default};
`;

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
`;

const SSRSupport = ({ ssr, children }) => {
  return (
    <StaticRouter location={ssr.url} context={ssr}>
      {children}
    </StaticRouter>
  );
};

const RouterLayer = isSSR ? SSRSupport : BrowserRouter;

const HistoryLayer = ({ children }) => {
  const history = useHistory();

  useEffect(() => {
    let ackee = null;
    if (!isSSR) {
      ackee = ackeeTracker.create('https://dashboard.bjornf.dev', {
        ignoreLocalhost: true,
        detailed: true,
      });
      ackee.record('2a5590d3-ef8c-45ab-9b29-7f14459e092f');
    }

    const unsub = history.listen((location) => {
      if (ackee) {
        ackee.record('2a5590d3-ef8c-45ab-9b29-7f14459e092f');
      }

      const path = location.pathname;
      let title = '';
      if (path === '/') {
        title = 'Home';
      } else {
        const firstItem = path.split('/')[1];
        title = firstItem.charAt(0).toUpperCase() + firstItem.slice(1);
      }

      document.title = `${title} - Björn Friedrichs`;
    });
    return unsub;
  }, []);

  return children;
};

const App = (props) => {
  const [theme] = useState(() => createTheme(themeTemplate));

  return (
    <ThemeProvider theme={theme}>
      <AppStyle theme={theme}>
        <NotificationProvider>
          <RequestProvider>
            <RouterLayer ssr={props.ssr}>
              <HistoryLayer>
                <Column flexed>
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
                          <Route path="/blog/:id">
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
                          <Route>
                            <NotFound />
                          </Route>
                        </Switch>
                      </Column>
                      <Footer />
                      <NavigationButtons mobile />
                    </Typography>
                  </AdaptiveContainer>
                </Column>
              </HistoryLayer>
            </RouterLayer>
          </RequestProvider>
        </NotificationProvider>
      </AppStyle>
    </ThemeProvider>
  );
};

export default App;
