import React, { useState } from 'react'
import moment from 'moment'

import { EmailIcon, LinkedinIcon, TwitterIcon, WhatsappIcon } from 'react-share'
import { IconButton } from '@mui/material'
import { withRouter } from 'react-router-dom'

import { emailLink, linkedinLink, whatsappLink, twitterLink } from 'app/share'

import { Column, Row } from 'app/components/Flex'
import { H2 } from 'app/components/Text'
import { StyledEditor } from 'app/components/RichText/view'
import Tag from 'app/components/Tag'
import FloatAside from 'app/components/FloatAside'

const ShareIcon = ({ href, size, Icon }) => (
  <a href={href} target="_blank" rel="noreferrer">
    <IconButton>
      <Icon style={{ height: size - 16, width: size - 16 }} round />
    </IconButton>
  </a>
)

const PostView = ({ postData, createdAt, hideShare, staticContext }) => {
  const { title, html, tags } = postData
  const [url] = useState(staticContext?.absUrl || global.window.location.href)
  const [userAgent] = useState(
    staticContext?.userAgent || global.navigator.userAgent
  )

  const iconSize = 45

  const isMobile = /(android|iphone|ipad|mobile)/i.test(userAgent)

  return (
    <FloatAside
      hideMenu={hideShare}
      width={iconSize}
      gap={30}
      menu={
        <Column gap={0} mobileDirection="row">
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
        <Row justify="between" wrapping gap={10}>
          <Row gap={10}>
            {tags
              ? tags.map((t) => <Tag size="small" key={t} name={t} />)
              : null}
          </Row>
          <div>
            Published {moment(createdAt * 1000).format('MMMM Do, YYYY')}
          </div>
        </Row>
        <H2>{title}</H2>
        <StyledEditor>
          <div
            className="remirror-editor"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </StyledEditor>
      </Column>
    </FloatAside>
  )
}

export default withRouter(PostView)
