import React from 'react'
import moment from 'moment'
import {
  EmailShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  TwitterShareButton,
  EmailIcon,
  LinkedinIcon,
  WhatsappIcon,
  TwitterIcon,
} from 'react-share'

import { template } from 'app/share'

import { Column, Row } from 'app/components/Flex'
import { H2 } from 'app/components/Text'
import RichText from 'app/components/RichText'
import Tag from 'app/components/Tag'
import FloatAside from 'app/components/FloatAside'

const PostView = ({ post }) => {
  const { draft, publishedVersion, createdAt } = post
  const { title, html, tags } = draft ? post : publishedVersion
  const url = window.location.href
  const iconSize = 35

  return (
    <FloatAside
      width={30}
      gap={30}
      menu={
        <Column>
          <EmailShareButton subject={title} body={template({ url, title })}>
            <EmailIcon size={iconSize} round />
          </EmailShareButton>
          <LinkedinShareButton
            url={url}
            title={title}
            summary={template({ url, title, tags })}
          >
            <LinkedinIcon size={iconSize} round />
          </LinkedinShareButton>
          <TwitterShareButton url={template({ url, title })} hashtags={tags}>
            <TwitterIcon size={iconSize} round />
          </TwitterShareButton>
          <WhatsappShareButton url={template({ url, title, tags })}>
            <WhatsappIcon size={iconSize} round />
          </WhatsappShareButton>
        </Column>
      }
      left={false}
    >
      <Column gap={20}>
        <Row justify="between" wrapping gap={10}>
          <Row gap={10}>
            {tags
              ? tags.map((t) => <Tag size="small" key={t} name={t} />)
              : null}
          </Row>
          <div>Published {moment(createdAt * 1000).format('MMMM Do YYYY')}</div>
        </Row>
        <H2>{title}</H2>
        <RichText content={html} editable={false} />
      </Column>
    </FloatAside>
  )
}

export default PostView
