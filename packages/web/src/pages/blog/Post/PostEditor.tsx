import { FunctionalComponent } from 'preact';
import React, { useState, useEffect, useCallback } from 'react';

import { upload } from 'src/api/admin';
import { getTags } from 'src/api/blog';
import { components } from 'src/api/schema';
import { useRequest } from 'src/providers/RequestProvider';

import { ReactComponent as ControlPointIcon } from 'src/components/icons/ControlPoint.svg';
import { ReactComponent as LoyaltyIcon } from 'src/components/icons/Loyalty.svg';
import { ReactComponent as SubtitlesIcon } from 'src/components/icons/Subtitles.svg';
import PostImage from 'src/components/PostImage';
import RichText from 'src/components/RichText';
import Tag from 'src/components/Tag';
import { IconButton } from 'src/components/ui/Button';
import TextField, { Autocomplete } from 'src/components/ui/TextField';

import './remirror.css';

type PostEditorProps = {
  post: components['schemas']['Post'];
  updatePost: (update: Partial<components['schemas']['PostContent']>) => void;
};

const PostEditor: FunctionalComponent<PostEditorProps> = ({
  post,
  updatePost,
}) => {
  const { sendRequest } = useRequest();
  const [newTag, setNewTag] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);

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
    (
      file: File,
      options?: {
        ext?: string;
        max_size?: number;
        quality?: number;
      }
    ) => sendRequest(upload(post._id, file, options), { rawBody: true }),
    [post._id]
  );

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-row items-center gap-4">
        <PostImage
          src={image}
          onImageChosen={(file, options) =>
            uploadHandler(file, options).success(({ src }) => {
              updatePost({ image: src });
            })
          }
          onImageCleared={() => {
            updatePost({ image: undefined });
          }}
          editable
        />
        <div className="flex flex-1 flex-col gap-7">
          <div className="flex flex-row flex-wrap items-center gap-4">
            <Autocomplete
              value={newTag}
              options={availableTags || []}
              onChange={(event) => setNewTag(event.currentTarget.value)}
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
              disabled={newTag === '' || tags?.includes(newTag)}
              onClick={() => {
                updatePost({ tags: [...(tags || []), newTag] });
                setNewTag('');
              }}
            >
              <ControlPointIcon />
            </IconButton>
            <div className="flex flex-1 flex-row flex-wrap gap-1">
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
            </div>
          </div>
          <TextField
            value={title}
            onChange={(event) =>
              updatePost({ title: event.currentTarget.value })
            }
            label="Title"
            icon={<SubtitlesIcon />}
          />
        </div>
      </div>
      <RichText
        content={initialHtml}
        onChange={updatePost}
        upload={uploadHandler}
      />
    </div>
  );
};

export default PostEditor;
