import AddCircleIcon from '@mui/icons-material/AddCircle';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { getDrafts, createPost } from 'app/api/admin';
import { useRequest } from 'app/providers/RequestProvider';

import { Row, Column } from 'app/components/Flex';
import FloatAside from 'app/components/FloatAside';
import PostItem from 'app/components/PostItem';
import Button from 'app/components/ui/Button';
import { List } from 'app/components/ui/List';

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
    <Column>
      <Row>
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
      </Row>
      {currentTab === 0 ? <Dashboard /> : null}
      {currentTab === 1 ? (
        <FloatAside
          menu={
            token ? (
              <Column>
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
              </Column>
            ) : null
          }
        >
          <List>
            {draftPosts.map((p) => (
              <PostItem key={p._id} post={p} />
            ))}
          </List>
        </FloatAside>
      ) : null}
    </Column>
  );
};

export default Admin;
