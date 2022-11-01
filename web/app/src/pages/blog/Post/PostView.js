import React, { useState } from 'react';
import {
  EmailIcon,
  LinkedinIcon,
  TwitterIcon,
  WhatsappIcon,
} from 'react-share';

import { useSSRProps } from 'app/providers/SSRProvider';
import { emailLink, linkedinLink, whatsappLink, twitterLink } from 'app/share';
import { formatDate } from 'app/util';

import FloatAside from 'app/components/FloatAside';
import PostImage from 'app/components/PostImage';
import { editorStyle } from 'app/components/RichText/style.module.scss';
import Tag from 'app/components/Tag';
import { IconButton } from 'app/components/ui/Button';

const ShareIcon = ({ href, size, Icon }) => (
  <a href={href} target="_blank" rel="noreferrer">
    <IconButton>
      <Icon style={{ height: size - 16, width: size - 16 }} round />
    </IconButton>
  </a>
);

const PostView = ({ postData, createdAt, hideShare }) => {
  const { title, html, tags, image } = postData;
  const ssrProps = useSSRProps();
  const [url] = useState(
    ssrProps ? ssrProps.host + ssrProps.path : global.window?.location?.href
  );
  const [userAgent] = useState(global?.navigator?.userAgent || '');

  const iconSize = 45;

  const isMobile = /(android|iphone|ipad|mobile)/i.test(userAgent);

  return (
    <FloatAside
      hideMenu={hideShare}
      width={iconSize}
      gap={30}
      menu={
        <div className="flex flex-col justify-center smo:flex-row">
          <ShareIcon
            size={iconSize}
            Icon={EmailIcon}
            href={emailLink({ title, url, tags })}
          />
          <ShareIcon
            size={iconSize}
            Icon={LinkedinIcon}
            href={linkedinLink({ title, url, tags })}
          />
          <ShareIcon
            size={iconSize}
            Icon={WhatsappIcon}
            href={whatsappLink({ title, url, tags }, isMobile)}
          />
          <ShareIcon
            size={iconSize}
            Icon={TwitterIcon}
            href={twitterLink({ title, url, tags })}
          />
        </div>
      }
      left={false}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-row items-center gap-5 smo:flex-col">
          {image ? <PostImage src={image} /> : null}
          <div className="flex flex-col justify-center gap-2">
            <div className="flex flex-row flex-wrap justify-between gap-2">
              {tags && tags.length ? (
                <div className="flex flex-row gap-2">
                  {tags.map((t) => (
                    <Tag size="small" key={t} name={t} />
                  ))}
                </div>
              ) : null}
              <span style={{ fontSize: '0.9rem' }}>
                Published {formatDate(createdAt)}
              </span>
            </div>
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
        </div>
        <div className={editorStyle}>
          <div
            className="remirror-editor"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </FloatAside>
  );
};

export default PostView;
