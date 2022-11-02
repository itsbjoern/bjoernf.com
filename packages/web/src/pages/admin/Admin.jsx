import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { getDrafts, createPost } from 'src/api/admin';
import { useRequest } from 'src/providers/RequestProvider';

import AddCircleIcon from 'src/components/icons/AddCircle.svg';
import PostItem from 'src/components/PostItem';
import Button from 'src/components/ui/Button';
import { List } from 'src/components/ui/List';

import Dashboard from './Dashboard';
import Login from './Login';

const Admin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, sendRequest } = useRequest();
  const [draftPosts, setDraftPosts] = useState([]);

  const hashSplit = location.hash?.split('-');
  const currentTab =
    hashSplit && hashSplit.length > 1 ? parseInt(hashSplit[1]) : 0;

  useEffect(() => {
    if (token) {
      sendRequest(getDrafts()).success(({ posts }) => {
        setDraftPosts(posts);
      });
    }
  }, [token]);

  if (!token) {
    return <Login />;
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-row gap-4">
        <Button
          variant={currentTab === 0 ? 'contained' : 'text'}
          onClick={() => {
            navigate('#tab-0');
          }}
        >
          Dashboard
        </Button>
        <Button
          variant={currentTab === 1 ? 'contained' : 'text'}
          onClick={() => {
            navigate('#tab-1');
          }}
        >
          Drafts
        </Button>
      </div>
      {currentTab === 0 ? <Dashboard /> : null}
      {currentTab === 1 ? (
        <div className="mt-8 flex flex-col">
          <Button
            startIcon={<AddCircleIcon />}
            variant="contained"
            onClick={() => {
              sendRequest(createPost()).success(({ post }) => {
                navigate(`/blog/${post._id}/edit`);
              });
            }}
          >
            New post
          </Button>
          <List>
            {draftPosts.map((p) => (
              <PostItem key={p._id} post={p} showDraft={true} />
            ))}
          </List>
        </div>
      ) : null}
    </div>
  );
};

export default Admin;
