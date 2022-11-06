import { FunctionalComponent } from 'preact';
import React, { useState } from 'react';

import { components } from 'src/api/schema';
import { useSSRProps } from 'src/providers/SSRProvider';
import { emailLink, linkedinLink, whatsappLink, twitterLink } from 'src/share';
import { formatDate } from 'src/util';

import FloatAside from 'src/components/FloatAside';
import { ReactComponent as EmailIcon } from 'src/components/icons/share/EmailIcon.svg';
import { ReactComponent as LinkedinIcon } from 'src/components/icons/share/LinkedinIcon.svg';
import { ReactComponent as TwitterIcon } from 'src/components/icons/share/TwitterIcon.svg';
import { ReactComponent as WhatsappIcon } from 'src/components/icons/share/WhatsappIcon.svg';
import PostImage from 'src/components/PostImage';
import classes from 'src/components/RichText/style.module.scss';
import Tag from 'src/components/Tag';
import { IconButton } from 'src/components/ui/Button';

type ShareIconProps = {
  href: string;
  size: number;
  Icon: typeof EmailIcon;
};

const ShareIcon: FunctionalComponent<ShareIconProps> = ({
  href,
  size,
  Icon,
}) => (
  <a href={href} target="_blank" rel="noreferrer">
    <IconButton>
      <Icon style={{ height: size - 16, width: size - 16 }} />
    </IconButton>
  </a>
);

type PostViewProps = {
  postData: components['schemas']['PostContent'];
  createdAt: number;
  hideShare?: boolean;
};

const PostView: FunctionalComponent<PostViewProps> = ({
  postData,
  createdAt,
  hideShare,
}) => {
  const { title, html, tags, image } = postData;
  const ssrProps = useSSRProps();
  const [url] = useState(
    ssrProps ? ssrProps.host + ssrProps.url : globalThis.window?.location?.href
  );
  const [userAgent] = useState(globalThis.navigator?.userAgent || '');

  const iconSize = 45;

  const isMobile = /(android|iphone|ipad|mobile)/i.test(userAgent);

  return (
    <FloatAside
      hideMenu={hideShare}
      menu={
        <div className="flex flex-col justify-center lgo:flex-row">
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
                    <Tag key={t} name={t} />
                  ))}
                </div>
              ) : null}
              <span style={{ fontSize: '0.75rem' }}>
                Published {formatDate(createdAt)}
              </span>
            </div>
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
        </div>
        <div className={classes.editorStyle}>
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
