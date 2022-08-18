import TransitEnterexitIcon from '@mui/icons-material/TransitEnterexit';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const RouterLink = styled(Link)`
  color: ${({ theme }) => theme.palette.primary.main};
  text-decoration-color: rgba(255, 87, 10, 0.4);

  &:hover {
    text-decoration-color: rgba(255, 87, 10, 1);
  }
`;

const ExternalLink = styled.a`
  color: ${({ theme }) => theme.palette.primary.main};
  text-decoration-color: rgba(255, 87, 10, 0.4);

  &:hover {
    text-decoration-color: rgba(255, 87, 10, 1);
  }
`;

const LinkRender = ({ external, href, ...props }) =>
  external ? (
    <ExternalLink href={href} target="_blank" {...props} />
  ) : (
    <RouterLink to={href} {...props} />
  );

const Ref = ({ text, href }) => {
  const isExternal = href.slice(0, 1) !== '/';
  return (
    <React.Fragment>
      {' '}
      <LinkRender external={isExternal} href={href}>
        {text || href}
        {isExternal ? (
          <TransitEnterexitIcon
            color="primary"
            style={{
              marginLeft: 0,
              fontSize: '1rem',
              transform: 'rotate(180deg)',
            }}
          />
        ) : null}
      </LinkRender>
    </React.Fragment>
  );
};

export default Ref;
