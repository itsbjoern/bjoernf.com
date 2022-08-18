import DeleteIcon from '@mui/icons-material/Delete';
import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  Suspense,
} from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toast';

import {
  updatePost as updatePostAPI,
  publishPost as publishPostAPI,
  unpublishPost as unpublishPostAPI,
  deletePost as deletePostAPI,
  deleteDraft as deleteDraftAPI,
} from 'app/api/admin';
import { getPost } from 'app/api/blog';
import NotFound from 'app/pages/404';
import { useRequest } from 'app/providers/RequestProvider';
import { useSSR } from 'app/providers/SSRProvider';
import { isSSR } from 'app/util';

import { Row, Column } from 'app/components/Flex';
import FloatAside from 'app/components/FloatAside';
import Alert from 'app/components/ui/Alert';
import Button from 'app/components/ui/Button';
import { useDialog } from 'app/components/ui/Dialog';
import Switch from 'app/components/ui/Switch';

const PostEditor = React.lazy(() => import('./PostEditor'));

import PostView from './PostView';

const filterEmpty = (dict) =>
  !dict
    ? {}
    : Object.entries(dict)
        // eslint-disable-next-line no-unused-vars
        .filter(([_, v]) => !!v)
        .reduce((p, [k, v]) => {
          p[k] = v;
          return p;
        }, {});

const Post = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { token, sendRequest } = useRequest();

  const postId = params.id;
  const [loading, setLoading] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const editing = location.pathname.endsWith('/edit') && !!token;
  const updateTimeout = useRef();
  const queuedUpdate = useRef();

  const [post, setPost] = useSSR(() => sendRequest(getPost(postId)), {
    chainSuccess: (data) => {
      if (!isSSR) {
        const title = (data.post.published ?? data.post.draft).title;
        document.title = `${title} - Björn Friedrichs`;
      }
      return data.post;
    },
    chainFinally: () => setLoading(false),
    dataId: 'post',
  });
  const update = post?.draft;

  const updatePost = useCallback(
    (update) => {
      setPost((prevPost) => ({
        ...prevPost,
        draft: {
          ...filterEmpty(prevPost.published),
          ...filterEmpty(prevPost.draft),
          ...update,
        },
      }));
    },
    [postId]
  );

  useEffect(() => {
    if (!update) {
      return;
    }

    if (updateTimeout.current) {
      clearTimeout(updateTimeout.current);
      updateTimeout.current = null;
    }

    const { title, tags, html, text, image } = update;
    queuedUpdate.current = (then) => {
      sendRequest(
        updatePostAPI(postId, { title, tags, html, text, image })
      ).success(() => {
        toast.success('Post saved');
        if (then) {
          then();
        }
      });
    };

    updateTimeout.current = setTimeout(() => {
      if (queuedUpdate.current) {
        queuedUpdate.current();
      }
    }, 700);
  }, [update]);

  const publishPost = useCallback(() => {
    const doPublish = () => {
      sendRequest(publishPostAPI(postId))
        .success(({ post: updatedPost }) => {
          setPost(updatedPost);
          navigate('#');
          toast.success('Post published');
        })
        .failure(() => {
          toast.error('Publish failed');
        });
    };

    if (queuedUpdate.current) {
      queuedUpdate.current(doPublish);
    } else {
      doPublish();
    }
  }, [postId]);

  const unpublishPost = useCallback(() => {
    sendRequest(unpublishPostAPI(postId))
      .success(({ post: updatedPost }) => {
        setPost(updatedPost);
        toast.success('Post published');
      })
      .failure(() => {
        toast.error('Publish failed');
      });
  }, [postId]);

  const deletePost = useCallback(() => {
    sendRequest(deletePostAPI(postId))
      .success(() => {
        toast.success('Post deleted');
        navigate('/admin#tab-1');
      })
      .failure((e) => {
        toast.error(e.message);
      });
  }, [postId]);

  const deleteDraft = useCallback(() => {
    sendRequest(deleteDraftAPI(postId))
      .success(({ post }) => {
        toast.success('Draft deleted');
        setPost(post);
      })
      .failure((e) => {
        toast.error(e.message);
      });
  }, [postId]);

  const [PublishDialog, openPublishDialog] = useDialog(
    'Are you sure you want to publish this post? This will make it available to the public.',
    publishPost
  );
  const [UnPublishDialog, openUnPublishDialog] = useDialog(
    'Are you sure you want to unpublish this post? Readers will be unable to access it.',
    unpublishPost
  );
  const [DeleteDialog, openDeleteDialog] = useDialog(
    'Are you sure you want to delete this post? This will remove it permanently.',
    deletePost
  );
  const [DeleteDraftDialog, openDeleteDraftDialog] = useDialog(
    'Are you sure you want to delete the draft for this post? This will remove it permanently.',
    deleteDraft
  );

  if (loading) {
    return null;
  }

  if (!loading && !post) {
    return <NotFound />;
  }

  const draftEqualsLive =
    !post.draft ||
    (post.draft?.html === post.published?.html &&
      post.draft?.title === post.draft?.title &&
      post.draft?.tags?.length === post.published?.tags?.length);

  return (
    <FloatAside
      menu={
        token ? (
          <Column gap={20}>
            <PublishDialog />
            <UnPublishDialog />
            <DeleteDraftDialog />
            <DeleteDialog />
            <Alert severity={post.draft ? 'warning' : 'success'}>
              Status:{' '}
              {!post.published ? 'Draft' : `Version ${post.published.version}`}
              {post.published && post.draft ? ' (Changes)' : ''}
            </Alert>
            <Row justify="center">
              <Switch
                checked={editing}
                onChange={() => {
                  navigate(`/blog/${post._id}/` + (!editing ? 'edit' : ''));
                }}
                label="Edit Mode"
              />
            </Row>
            <Row justify="center">
              <Switch
                disabled={!post.draft || !post.published}
                checked={isComparing}
                onChange={() => {
                  setIsComparing(!isComparing);
                }}
                label="Compare"
              />
            </Row>
            <Button
              variant="contained"
              onClick={openPublishDialog}
              disabled={draftEqualsLive}
            >
              Publish
            </Button>
            {post.published ? (
              <>
                <Button
                  disabled={draftEqualsLive}
                  variant="contained"
                  color="secondary"
                  onClick={openDeleteDraftDialog}
                >
                  Discard changes
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={openUnPublishDialog}
                >
                  Un-publish
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                onClick={openDeleteDialog}
              >
                <DeleteIcon />
              </Button>
            )}
          </Column>
        ) : null
      }
    >
      <Column>
        <Row gap={20}>
          <Column flexed style={{ maxWidth: '100%' }}>
            {token && editing ? (
              <Suspense fallback={<div>Loading...</div>}>
                <PostEditor post={post} updatePost={updatePost} />
              </Suspense>
            ) : (
              <PostView
                postData={
                  isComparing || !post.published
                    ? { ...post.published, ...post.draft }
                    : { ...post.published }
                }
                createdAt={post.createdAt}
                hideShare={isComparing}
              />
            )}
          </Column>
          {isComparing ? (
            <Column flexed>
              <PostView
                postData={post.published}
                createdAt={post.createdAt}
                hideShare
              />
            </Column>
          ) : null}
        </Row>
      </Column>
    </FloatAside>
  );
};

export default Post;
