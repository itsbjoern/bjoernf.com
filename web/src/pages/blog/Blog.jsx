import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toast';

import { apiUrl } from 'src/api';
import { getPosts } from 'src/api/blog';
import { useRequest } from 'src/providers/RequestProvider';
import { useSSR } from 'src/providers/SSRProvider';

import ContentCopyIcon from 'src/components/icons/ContentCopy.svg';
import RssFeedIcon from 'src/components/icons/RssFeed.svg';
import SearchIcon from 'src/components/icons/Search.svg';
import PostItem from 'src/components/PostItem';
import Button, { IconButton } from 'src/components/ui/Button';
import CircularProgress from 'src/components/ui/CircularProgress';
import { List } from 'src/components/ui/List';
import Pagination from 'src/components/ui/Pagination';
import TextField from 'src/components/ui/TextField';

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

  const query = new URLSearchParams(location.search);
  const currentPage = parseInt(query.get('page')) || 1;
  const currentSearch = query.get('search') || '';
  const [isLoading, setIsLoading] = useState(false);

  const [rssVisible, setRssVisible] = useState(false);

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
    <div className="flex flex-col">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row items-center gap-3">
          <h3 className="text-xl font-bold">Recent posts</h3>

          <div className="flex flex-row items-center gap-3">
            <Button
              variant="text"
              startIcon={<RssFeedIcon />}
              onClick={() => setRssVisible((p) => !p)}
            >
              Feed
            </Button>
          </div>

          {rssVisible ? (
            <div className="flex items-center gap-3">
              <TextField
                disabled
                inputStyle={{ padding: 5, fontSize: 11 }}
                value={apiUrl + '/rss'}
                onClick={(e) => {
                  e.target.select();
                }}
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
            </div>
          ) : null}
          {isLoading ? <CircularProgress size={35} /> : null}
        </div>
        <div className="flex flex-row justify-end smo:hidden">
          <TextField
            value={currentSearch}
            onChange={(event) =>
              navigate(makeQuery(currentPage, event.target.value))
            }
            label="Search"
            icon={<SearchIcon />}
          />
        </div>
      </div>
      <div className="flex flex-col">
        <List>
          {posts.map((p, i) => (
            <PostItem key={p._id === '?' ? i : p._id} post={p} />
          ))}
        </List>
      </div>
      <Pagination
        onChange={(event, value) => navigate(makeQuery(value, currentSearch))}
        page={currentPage}
        count={numPages}
      />
    </div>
  );
};

export default Blog;
