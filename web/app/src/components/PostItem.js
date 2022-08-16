import React from 'react';
import { ListItem, ListItemButton, Skeleton } from '@mui/material';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import format from 'date-fns/format';
import styled from '@emotion/styled';

import { morphMixin } from 'app/theme';
import { Row, Column } from 'app/components/Flex';
import { H4 } from 'app/components/Text';
import Tag from 'app/components/Tag';
import UnstyledLink from 'app/components/UnstyledLink';
import PostImage from 'app/components/PostImage';

const Title = styled(H4)`
  color: ${({ theme }) => theme.palette.primary.main};
`;

const ShadowButton = styled(ListItemButton)`
  &&& {
    padding-bottom: 10px;
    padding-left: 10px;
    padding-top: 10px;
    padding-right: 10%;

    @media only screen and (max-width: 425px) {
      padding-right: 10px;
    }

    min-height: 77px;
    background-color: ${({ theme }) => theme.palette.background.paper};
    position: relative;

    ${morphMixin()}

    .MuiTouchRipple-root > span > span {
      background-color: ${({ theme }) => theme.palette.secondary.main};
    }
  }
`;

const Outer = styled(Row)`
  z-index: 5;
  overflow: hidden;

  @media only screen and (max-width: 425px) {
    overflow: visible;
    width: 100%;
    align-self: center;
  }
`;

const Inner = styled(Row)`
  z-index: 5;
  padding: 15px 20px 0 25px;

  @media only screen and (max-width: 425px) {
    padding: 0;
    width: 100%;
  }
`;

const PaperClip = styled(Row)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  z-index: 5;
  ${morphMixin()}
  padding: 8px 8px 0px 12px;
  border-radius: 10px 10px 0 0;
  gap: 15px;

  @media only screen and (max-width: 425px) {
    padding: 5px 0 0 5px;
    flex: 1;
    box-shadow: none;
    align-items: center;
  }
`;

const Control = styled(Row)`
  @media only screen and (max-width: 425px) {
    flex-direction: column-reverse;
    padding-bottom: 8px;
    margin-top: 20px;
  }
`;

const Summary = styled.span`
  font-size: 0.9rem;
`;

const ClipOn = ({ children }) => (
  <Outer>
    <Inner>
      <PaperClip>{children}</PaperClip>
    </Inner>
  </Outer>
);

const PostItem = ({ post }) => {
  const isSkeleton = post._id === '?';
  if (isSkeleton) {
    return (
      <Column>
        <Control justify="start">
          <ClipOn>
            <Row gap={10} align="center">
              <Skeleton animation="wave" height={15} width={100} />
              <Skeleton animation="wave" height={15} width={50} />
            </Row>
          </ClipOn>
        </Control>
        <ListItem sx={{ padding: `0 0 10px 0` }}>
          <ShadowButton>
            <Row justify="start" flexed gap={10} grow={10}>
              <Column gap={10}>
                <Title>
                  <Skeleton animation="wave" height={30} width={120} />
                </Title>
                <Skeleton animation="wave" height={10} width={240} />
                <Skeleton animation="wave" height={10} width={220} />
              </Column>
            </Row>
          </ShadowButton>
        </ListItem>
      </Column>
    );
  }

  const { draft, published, createdAt } = post;
  const { title, tags, image } = draft ?? published;
  const summary = draft ? draft.text?.slice(0, 100) : published.summary;

  return (
    <Column>
      <Control justify="start">
        <ClipOn>
          <Row gap={10}>
            <Row>
              <span style={{ fontSize: '0.9rem' }}>
                {format(createdAt * 1000, 'MMMM do, yyyy')}
              </span>
            </Row>
          </Row>
          <Row gap={8} align="end">
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
          </Row>
        </ClipOn>
      </Control>
      <UnstyledLink delay={300} to={`/blog/${post._id}`}>
        <ListItem sx={{ padding: `0 0 10px 0` }}>
          <ShadowButton>
            <Row gap={10}>
              {!published ? <PendingActionsIcon /> : null}
              {image ? <PostImage size={100} src={image} /> : null}
              <Column wrapping="mobile">
                <Title>{title || 'No title'}</Title>
                <Summary>{summary}</Summary>
              </Column>
            </Row>
          </ShadowButton>
        </ListItem>
      </UnstyledLink>
    </Column>
  );
};

export default PostItem;
