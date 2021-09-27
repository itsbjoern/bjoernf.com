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
    min-height: 77px;
    background-color: ${({ theme }) => theme.palette.background.default};

    ${morphMixin}
  }
`)

const PostItem = ({ post }) => {
  const { draft, publishedVersion, createdAt } = post
  const { title, tags } = draft ? post : publishedVersion
  const summary = draft ? post.text?.slice(0, 100) : publishedVersion.summary

  return (
    <UnstyledLink to={`/blog/${post._id}` + (draft ? '#edit' : '')}>
      <ListItem sx={{ padding: `15px 0` }}>
        <ShadowButton>
          <Row justify="between" flexed gap={10} grow={10} mobileWrapping>
            {draft ? <PendingActions /> : null}
            <Column gap={10}>
              <H4>{title || 'No title'}</H4>

              <span style={{ fontSize: '0.9em' }}>{summary}</span>
            </Column>
            <Column gap={10} flexed align="end">
              <Row>{moment(createdAt * 1000).format('MMMM Do YYYY')}</Row>
              <Row gap={10}>
                {tags
                  ? tags.map((t) => <Tag size="small" key={t} name={t} />)
                  : null}
              </Row>
            </Column>
          </Row>
        </ShadowButton>
      </ListItem>
    </UnstyledLink>
  )
}

export default PostItem
