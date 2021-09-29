import React from 'react'

import { ListItem, ListItemButton } from '@mui/material'
import { withTheme } from '@mui/styles'
import { PendingActions } from '@mui/icons-material'
import moment from 'moment'
import styled from '@emotion/styled'

import { morphMixin } from 'app/theme'
import { Row, Column } from 'app/components/Flex'
import { H4 } from 'app/components/Text'
import Tag from 'app/components/Tag'
import UnstyledLink from 'app/components/UnstyledLink'

const ShadowButton = withTheme(styled(ListItemButton)`
  &&& {
    padding-bottom: 10px;
    padding-right: 10%;
    min-height: 77px;
    background-color: ${({ theme }) => theme.palette.background.default};

    ${morphMixin()}
  }
`)

const Outer = styled(Row)`
  z-index: 5;
  overflow: hidden;

  @media only screen and (max-width: 425px) {
    overflow: visible;
    width: 100%;
    align-self: center;
  }
`

const Inner = styled(Row)`
  z-index: 5;
  padding: 15px 20px 0 25px;

  @media only screen and (max-width: 425px) {
    padding: 10px 0;
    width: 100%;
  }
`

const PaperClip = withTheme(styled(Row)`
  background-color: ${({ theme }) => theme.palette.background.default};
  z-index: 5;
  padding: 5px 10px;
  ${morphMixin()}
  border-radius: 10px 10px 0 0;

  @media only screen and (max-width: 425px) {
    flex: 1;
    box-shadow: none;
    > div {
      flex-direction: column-reverse;
    }
  }
`)

const ClipOn = ({ children }) => (
  <Outer alignSelf="end">
    <Inner>
      <PaperClip>{children}</PaperClip>
    </Inner>
  </Outer>
)

const PostItem = ({ post }) => {
  const { draft, published, createdAt } = post
  const { title, tags } = draft ?? published
  const summary = draft ? draft.text?.slice(0, 100) : published.summary

  return (
    <Column>
      <ClipOn>
        <Row gap={10}>
          <Row gap={10}>
            {tags
              ? tags.map((t) => <Tag size="small" key={t} name={t} />)
              : null}
          </Row>
          <Row>
            <span style={{ fontSize: '1rem' }}>
              {moment(createdAt * 1000).format('MMMM Do, YYYY')}
            </span>
          </Row>
        </Row>
      </ClipOn>
      <UnstyledLink to={`/blog/${post._id}` + (draft ? '#edit' : '')}>
        <ListItem sx={{ padding: `0 0 15px 0` }}>
          <ShadowButton>
            <Row justify="start" flexed gap={10} grow={10} mobileWrapping>
              {draft ? <PendingActions /> : null}
              <Column gap={10}>
                <H4>{title || 'No title'}</H4>

                <span style={{ fontSize: '0.9em' }}>{summary}</span>
              </Column>
            </Row>
          </ShadowButton>
        </ListItem>
      </UnstyledLink>
    </Column>
  )
}

export default PostItem
