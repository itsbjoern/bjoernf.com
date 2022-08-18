import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import SearchIcon from '@mui/icons-material/Search';
import React, { useState } from 'react';
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

const Blog = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sendRequest } = useRequest();

  const [showsRss, setShowsRss] = useState(false);

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
          <Row gap={10} align="center">
            {isLoading ? <CircularProgress size={35} /> : null}
            <H2>Recent posts</H2>
          </Row>
          <Row align="center">
            <Button
              size="small"
              variant="text"
              startIcon={<RssFeedIcon fontSize="7px" />}
              onClick={() => {
                setShowsRss((prev) => !prev);
              }}
            >
              Feed
            </Button>
            {showsRss ? (
              <Row align="center" style={{ padding: 10 }} gap={10}>
                <TextField
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
                >
                  <ContentCopyIcon />
                </IconButton>
              </Row>
            ) : null}
          </Row>
        </Row>
        <Row justify="end" hide="mobile">
          <TextField
            value={currentSearch}
            onChange={(event) =>
              navigate(makeQuery(currentPage, event.target.value))
            }
            label="Search"
            icon={<SearchIcon />}
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
        onChange={(event, value) => navigate(makeQuery(value, currentSearch))}
        page={currentPage}
        count={numPages}
      />
    </Column>
  );
};

export default Blog;
