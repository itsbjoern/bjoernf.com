import React from 'react';

import Ripples from 'app/lib/Ripples';
import { formatDate } from 'app/util';

import PendingActionsIcon from 'app/components/icons/PendingActions.svg';
import PostImage from 'app/components/PostImage';
import Tag from 'app/components/Tag';
import { ListItem } from 'app/components/ui/List';
import Skeleton from 'app/components/ui/Skeleton';
import UnstyledLink from 'app/components/UnstyledLink';

const ClipOn = ({ children }) => (
  <div className="z-[5] flex flex-row overflow-hidden">
    <div className="z-[5] flex flex-row pt-4 pr-5 pb-0 pl-6">
      <div className="neo z-[5] flex flex-row gap-4 rounded-t-xl bg-paper pt-2 pr-2 pb-0 pl-3">
        {children}
      </div>
    </div>
  </div>
);

const PostItem = ({ post }) => {
  const isSkeleton = post._id === '?';
  if (isSkeleton) {
    return (
      <div className="flex flex-col">
        <div
          className="flex flex-row justify-start smo:mt-5 smo:flex-col-reverse smo:pb-2"
          justify="start"
        >
          <ClipOn>
            <div className="flex flex-row items-center gap-2">
              <Skeleton animation="wave" height={15} width={100} />
              <Skeleton animation="wave" height={15} width={50} />
            </div>
          </ClipOn>
        </div>
        <ListItem>
          <div className="neo  relative flex min-h-[100px] flex-1 overflow-hidden bg-paper smo:pr-2">
            <Ripples flex>
              <div className="flex flex-grow flex-row justify-start gap-2 pr-3 pb-2 pl-2 pt-2">
                <div className="flex flex-col gap-2 py-1 px-2">
                  <h3 className="text-xl font-bold leading-6">
                    <Skeleton animation="wave" height={30} width={120} />
                  </h3>
                  <Skeleton animation="wave" height={10} width={240} />
                  <Skeleton animation="wave" height={10} width={220} />
                </div>
              </div>
            </Ripples>
          </div>
        </ListItem>
      </div>
    );
  }

  const { draft, published, createdAt } = post;
  const { title, tags, image } = draft ?? published;
  const summary = draft ? draft.text?.slice(0, 100) : published.summary;

  return (
    <div className="mb-2 flex flex-col">
      <div
        className="flex flex-row justify-start smo:mt-5 smo:flex-col-reverse smo:pb-2"
        justify="start"
      >
        <ClipOn>
          <div className="flex flex-row gap-2">
            <div className="flex flex-row">
              <span style={{ fontSize: '0.9rem' }}>
                {formatDate(createdAt)}
              </span>
            </div>
          </div>
          <div className="flex flex-row justify-end gap-2">
            {tags
              ? tags.map((t) => (
                  <Tag
                    style={{ zIndex: 10 }}
                    sx={{ fontSize: '0.6rem', minWidth: 0, minHeight: 0 }}
                    size="small"
                    key={t}
                    name={t}
                  />
                ))
              : null}
          </div>
        </ClipOn>
      </div>
      <UnstyledLink delay={300} to={`/blog/${post._id}`}>
        <ListItem>
          <div className="neo relative flex min-h-[100px] flex-1 overflow-hidden rounded-lg bg-paper smo:pr-2">
            <Ripples flex>
              <div className="flex flex-row gap-2 pr-3 pb-2 pl-2 pt-2">
                {!published ? <PendingActionsIcon /> : null}
                {image ? <PostImage size={100} src={image} /> : null}
                <div className="flex flex-col px-2 py-1 smo:flex-wrap">
                  <h3 className="text-xl font-bold leading-6 text-primary">
                    {title || 'No title'}
                  </h3>
                  <div
                    className="flex flex-row overflow-hidden text-ellipsis text-sm"
                    style={{
                      '-webkit-line-clamp': 3,
                      '-webkit-box-orient': 'vertical',
                      display: '-webkit-box',
                    }}
                  >
                    {summary}
                  </div>
                </div>
              </div>
            </Ripples>
          </div>
        </ListItem>
      </UnstyledLink>
    </div>
  );
};

export default PostItem;
