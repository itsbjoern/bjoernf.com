import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import SearchIcon from '@mui/icons-material/Search';
import React, { useState } from 'react';
import { Leat } from 'react-leat';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toast';

import { apiUrl } from 'app/api';
import { getPosts } from 'app/api/blog';
import { useRequest } from 'app/providers/RequestProvider';
import { useSSR } from 'app/providers/SSRProvider';

import { Row, Column } from 'app/components/Flex';
import PostItem from 'app/components/PostItem';
import { H2 } from 'app/components/Text';
import Button, { IconButton } from 'app/components/ui/Button';
import CircularProgress from 'app/components/ui/CircularProgress';
import { List } from 'app/components/ui/List';
import Pagination from 'app/components/ui/Pagination';
import TextField from 'app/components/ui/TextField';

const makeQuery = (page, search) => {
  const params = {};
  if (page) {
    params.page = page;
  }
  if (search) {
    params.search = search;
  }

  return '?' + new URLSearchParams(params).toString();
};

const updateSearch = ({ getRef }) => {
  getRef('element').addEventListener('change', (e) => {
    if (window.appIsHydrated) return;

    window.location.search = `search=${e.target.value}`;
  });
};

const Blog = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sendRequest } = useRequest();

  const query = new URLSearchParams(location.search);
  const currentPage = parseInt(query.get('page')) || 1;
  const currentSearch = query.get('search') || '';
  const [isLoading, setIsLoading] = useState(false);

  const [data] = useSSR(
    () => sendRequest(getPosts({ page: currentPage, search: currentSearch })),
    {
      deps: [currentPage, currentSearch],
      init: { posts: new Array(5).fill({ _id: '?' }), numPages: 1 },
      delay: 200,
      chainFirst: () => setIsLoading(true),
      chainFailure: (err) => toast.error(`Fetch failed: ${err.message}`),
      chainFinally: () => setIsLoading(false),
    }
  );

  const { posts = [], numPages } = data;

  return (
    <Column>
      <Row justify="between">
        <Row align="center" gap={10}>
          <H2>Recent posts</H2>
          <Leat
            script={({ rssFeed, getRef }) => {
              const copyClipboard = () => {
                const text = getRef('textField');
                text.focus();
                window.navigator.clipboard.writeText(text.value);
              };
              const row = getRef('row');

              let isOpen = false;
              getRef('button').addEventListener('click', () => {
                if (!isOpen) {
                  row.appendChild(rssFeed);
                  getRef('innerButton').addEventListener(
                    'click',
                    copyClipboard
                  );
                } else {
                  row.removeChild(rssFeed);
                }
                isOpen = !isOpen;
              });
            }}
            props={{
              rssFeed: ({ addRef }) => (
                <Row align="center" gap={10}>
                  <TextField
                    inputProps={addRef('textField')}
                    disabled
                    inputStyle={{ padding: 5 }}
                    value={apiUrl + '/rss'}
                    onClick={(e) => e.target.select()}
                  />
                  <IconButton
                    size="small"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(apiUrl + '/rss');
                        toast.success('Copied to clipboard');
                      } catch (err) {
                        toast.error('Copy to clipboard failed');
                      }
                    }}
                    {...addRef('innerButton')}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Row>
              ),
            }}
          >
            {({ addRef }) => (
              <Row align="center" gap={10} {...addRef('row')}>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<RssFeedIcon fontSize="7px" />}
                  {...addRef('button')}
                >
                  Feed
                </Button>
              </Row>
            )}
          </Leat>
          {isLoading ? <CircularProgress size={35} /> : null}
        </Row>
        <Row justify="end" hide="mobile">
          <Leat script={updateSearch}>
            {({ addRef }) => (
              <TextField
                value={currentSearch}
                onChange={(event) =>
                  navigate(makeQuery(currentPage, event.target.value))
                }
                label="Search"
                icon={<SearchIcon />}
                inputProps={addRef('element')}
              />
            )}
          </Leat>
        </Row>
      </Row>
      <Row justify="center"></Row>
      <Column>
        <List>
          {posts.map((p, i) => (
            <PostItem key={p._id === '?' ? i : p._id} post={p} />
          ))}
        </List>
      </Column>
      <Pagination
        onChange={(event, value) => navigate(makeQuery(value, currentSearch))}
        page={currentPage}
        count={numPages}
      />
    </Column>
  );
};

export default Blog;
