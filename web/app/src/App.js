import * as ackeeTracker from 'ackee-tracker';
import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { StaticRouter } from 'react-router-dom/server';
import { ToastContainer } from 'react-toast';
import styled, { ThemeProvider } from 'styled-components';

import NotFound from 'app/pages/404';
import About from 'app/pages/about/About';
import Blog from 'app/pages/blog/Blog';
import Post from 'app/pages/blog/Post';
import Home from 'app/pages/home/Home';
import Projects from 'app/pages/projects/Projects';
import RequestProvider from 'app/providers/RequestProvider';
import theme from 'app/theme';
import { isSSR } from 'app/util';

import { Column } from 'app/components/Flex';
import Footer from 'app/components/Footer';
import Header from 'app/components/Header';
import NavigationButtons from 'app/components/NavigationButtons';

const Admin = React.lazy(() => import('app/pages/admin/Admin'));

const AppStyle = styled.div`
  display: flex;
  flex: 1;
  background-color: ${({ theme }) => theme.palette.background.default};
`;

const AdaptiveContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  margin-left: auto;
  box-sizing: border-box;
  margin-right: auto;

  @media only screen and (max-width: 425px) {
    padding-left: 0;
    padding-right: 0;
  }

  @media (min-width: 900px) {
    max-width: 900px;
  }

  @media (min-width: 600px) {
    padding-left: 24px;
    padding-right: 24px;
  }
`;

const SSRSupport = ({ ssr, children }) => {
  return <StaticRouter location={ssr.url}>{children}</StaticRouter>;
};

const RouterLayer = isSSR ? SSRSupport : BrowserRouter;

const HistoryLayer = ({ children }) => {
  const location = useLocation();
  const [ackee] = useState(
    isSSR
      ? null
      : ackeeTracker.create('https://dashboard.bjornf.dev', {
          ignoreLocalhost: true,
          detailed: true,
        })
  );

  useEffect(() => {
    if (!isSSR) {
      ackee.record('2a5590d3-ef8c-45ab-9b29-7f14459e092f');

      const path = location.pathname;
      let title = '';
      if (path === '/') {
        title = 'Home';
      } else {
        const firstItem = path.split('/')[1];
        title = firstItem.charAt(0).toUpperCase() + firstItem.slice(1);
      }

      document.title = `${title} - Björn Friedrichs`;
    }
  }, [location]);

  return children;
};

const ContentColumn = styled(Column)`
  padding: 45px 5px;
  max-width: 100vw;
`;

const App = (props) => {
  return (
    <ThemeProvider theme={theme}>
      <AppStyle theme={theme}>
        <RequestProvider>
          <RouterLayer ssr={props.ssr}>
            <HistoryLayer>
              <Column flexed>
                <AdaptiveContainer maxWidth="md">
                  <Column flexed>
                    <Header />
                    <ContentColumn flexed>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/blog/:id" element={<Post />} />
                        <Route path="/blog/:id/edit" element={<Post />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route
                          path="/admin"
                          element={
                            <Suspense fallback={<div>Loading...</div>}>
                              <Admin />
                            </Suspense>
                          }
                        />
                        <Route path="/about" element={<About />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </ContentColumn>
                    <Footer />
                    <NavigationButtons mobile />
                  </Column>
                </AdaptiveContainer>
              </Column>
            </HistoryLayer>
          </RouterLayer>
        </RequestProvider>
        <ToastContainer position="top-center" delay={1000} />
      </AppStyle>
    </ThemeProvider>
  );
};

export default App;
