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

import { Column, Row } from 'app/components/Flex';
import FloatAside from 'app/components/FloatAside';
import PostImage from 'app/components/PostImage';
import StyledEditor from 'app/components/RichText/StyledEditor';
import Tag from 'app/components/Tag';
import { H2 } from 'app/components/Text';
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
        <Column gap={0} flip="mobile">
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
        </Column>
      }
      left={false}
    >
      <Column gap={20}>
        <Row gap={20} align="center" flip="mobile">
          {image ? <PostImage src={image} /> : null}
          <Column gap={20} justify="center">
            <Row justify="between" wrapping gap={10}>
              <Row gap={10}>
                {tags
                  ? tags.map((t) => <Tag size="small" key={t} name={t} />)
                  : null}
              </Row>
              <div>Published {formatDate(createdAt)}</div>
            </Row>
            <H2 mobileSize="1.2rem">{title}</H2>
          </Column>
        </Row>
        <StyledEditor>
          <div
            className="remirror-editor"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </StyledEditor>
      </Column>
    </FloatAside>
  );
};

export default PostView;
