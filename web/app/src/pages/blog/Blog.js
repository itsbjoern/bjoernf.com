import React, { useEffect, useState, useRef } from 'react';
import {
  List,
  Pagination,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Button,
  Popover,
  Input,
} from '@mui/material';
import { useLocation, useHistory } from 'react-router-dom';
import { Search, Clear, RssFeed, ContentCopy } from '@mui/icons-material';

import { useSSR } from 'app/providers/SSRProvider';
import { getPosts } from 'app/api/blog';
import { useRequest } from 'app/providers/RequestProvider';
import { useNotification } from 'app/providers/NotificationProvider';
import { apiUrl } from 'app/api';
import { Row, Column } from 'app/components/Flex';
import { H2 } from 'app/components/Text';
import PostItem from 'app/components/PostItem';
import UnstyledLink from 'app/components/UnstyledLink';

const makeQuery = (page, search) => {
  const params = {};
  if (page) {
    params.page = page;
  }
  if (search) {
    params.search = search;
  }

  return (
    '?' +
    Object.entries(params)
      .map(([key, val]) => `${key}=${val}`)
      .join('&')
  );
};

const Blog = () => {
  const history = useHistory();
  const location = useLocation();
  const { sendRequest } = useRequest();
  const { createNotification } = useNotification();

  const query = new URLSearchParams(location.search);
  const currentPage = parseInt(query.get('page')) || 1;
  const currentSearch = query.get('search') || '';
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const rssRef = useRef();

  const [data] = useSSR(
    () => sendRequest(getPosts({ page: currentPage, search: currentSearch })),
    {
      deps: [currentPage, currentSearch],
      init: { posts: new Array(5).fill({ _id: '?' }), numPages: 1 },
      delay: 200,
      chainFirst: () => setIsLoading(true),
      chainFailure: (err) =>
        createNotification(`Fetch failed: ${err.message}`, 'error'),
      chainFinally: () => setIsLoading(false),
    }
  );
  console.log(data);

  useEffect(() => {
    if (anchorEl) {
      setTimeout(() => {
        rssRef?.current.select();
      }, 50);
    }
  }, [anchorEl, rssRef]);

  const { posts = [], numPages } = data;

  return (
    <Column>
      <Row justify="between">
        <Row align="center" gap={10}>
          <H2>Recent posts</H2>
          <Row>
            <Button
              size="small"
              variant="text"
              startIcon={<RssFeed fontSize="7px" />}
              onClick={(e) => {
                if (anchorEl) {
                  setAnchorEl(null);
                } else {
                  setAnchorEl(e.currentTarget);
                }
              }}
            >
              Feed
            </Button>
            <Popover
              open={!!anchorEl}
              anchorEl={anchorEl}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
            >
              <Row style={{ padding: 10 }} gap={10}>
                <Input
                  value={apiUrl + '/rss'}
                  disableUnderline
                  inputRef={rssRef}
                  onClick={(e) => e.target.select()}
                />
                <IconButton
                  size="small"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(apiUrl + '/rss');
                      createNotification('Copied to clipboard');
                    } catch (err) {
                      createNotification('Copy to clipboard failed', 'error');
                    }
                  }}
                >
                  <ContentCopy />
                </IconButton>
              </Row>
            </Popover>
          </Row>
        </Row>
        {isLoading ? <CircularProgress size={35} /> : null}
        <Row justify="end" hideMobile>
          <TextField
            size="small"
            value={currentSearch}
            onChange={(event) =>
              history.push(makeQuery(currentPage, event.target.value))
            }
            label="Search"
            placeholder="Title, tag or content"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '0.85em',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <UnstyledLink
                    to="/blog"
                    style={currentSearch ? {} : { visibility: 'hidden' }}
                  >
                    <IconButton edge="end" size="small">
                      <Clear />
                    </IconButton>
                  </UnstyledLink>
                </InputAdornment>
              ),
            }}
          />
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
        onChange={(event, value) => makeQuery(value, currentSearch)}
        page={currentPage}
        count={numPages}
        color="primary"
      />
    </Column>
  );
};

export default Blog;
