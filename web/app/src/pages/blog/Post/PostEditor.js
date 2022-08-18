import ControlPointIcon from '@mui/icons-material/ControlPoint';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import React, { useState, useEffect, useCallback } from 'react';

import { upload } from 'app/api/admin';
import { getTags } from 'app/api/blog';
import { useRequest } from 'app/providers/RequestProvider';

import { Row, Column } from 'app/components/Flex';
import PostImage from 'app/components/PostImage';
import RichText from 'app/components/RichText';
import Tag from 'app/components/Tag';
import { IconButton } from 'app/components/ui/Button';
import TextField, { Autocomplete } from 'app/components/ui/TextField';

const PostEditor = ({ post, updatePost }) => {
  const { sendRequest } = useRequest();
  const [newTag, setNewTag] = useState('');
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    sendRequest(getTags()).success(({ tags }) => {
      setAvailableTags(tags ?? []);
    });
  }, []);

  const {
    title = '',
    tags = [],
    html = '',
    image = '',
  } = { ...(post.published || {}), ...(post.draft || {}) };
  const [initialHtml] = useState(html);

  const uploadHandler = useCallback(
    (file, options) =>
      sendRequest(upload(post._id, file, options)).success(
        ({ src, fileName }) => {
          return Promise.resolve({ src, fileName });
        }
      ),
    [post._id]
  );

  return (
    <Column gap={30}>
      <Row gap={15} align="center">
        <PostImage
          src={image}
          onImageChosen={(file, options) =>
            uploadHandler(file, options).then(({ src }) => {
              updatePost({ image: src });
            })
          }
          onImageCleared={() => {
            updatePost({ image: null });
          }}
          editable
        />
        <Column flexed gap={30}>
          <Row gap={15} align="center" wrapping>
            <Autocomplete
              value={newTag}
              options={availableTags || []}
              onChange={(event) => setNewTag(event.target.value)}
              label="Add Tag"
              onKeyDown={(e) => {
                if (newTag === '' || tags?.includes(newTag)) {
                  return;
                }
                if (e.key === 'Enter') {
                  updatePost({ tags: [...(tags || []), newTag] });
                  setNewTag('');
                }
              }}
              icon={<LoyaltyIcon />}
            />
            <IconButton
              size="small"
              disabled={newTag === '' || tags?.includes(newTag)}
              onClick={() => {
                updatePost({ tags: [...(tags || []), newTag] });
                setNewTag('');
              }}
            >
              <ControlPointIcon />
            </IconButton>
            <Row gap={5} flexed wrapping>
              {tags?.map((t, i) => {
                return (
                  <Tag
                    key={t}
                    name={t}
                    onDelete={() => {
                      tags.splice(i, 1);
                      const newTags = [...tags];
                      updatePost({ tags: newTags });
                    }}
                  />
                );
              })}
            </Row>
          </Row>
          <TextField
            value={title}
            onChange={(event) => updatePost({ title: event.target.value })}
            label="Title"
            icon={<SubtitlesIcon />}
          />
        </Column>
      </Row>
      <RichText
        content={initialHtml}
        onChange={updatePost}
        upload={uploadHandler}
      />
    </Column>
  );
};

export default PostEditor;
