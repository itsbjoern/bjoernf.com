import React from 'react';
import { useHistory } from 'react-router-dom';
import styled from '@emotion/styled';
import { Avatar, Divider, Chip } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';

import { getPublicFileUrl } from 'app/util';
import { useRequest } from 'app/providers/RequestProvider';
import { Row, Column } from 'app/components/Flex';
import { H2 } from 'app/components/Text';
import { morphMixin } from 'app/theme';

import NavigationButtons from './NavigationButtons';

const BG = styled(Column)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding: 15px;
  ${morphMixin()}
  border-radius: 0 0 10px 10px;
`;

const Header = () => {
  const history = useHistory();
  const { token, setToken } = useRequest();

  return (
    <BG gap={15}>
      <Row justify="between" align="center">
        <Row align="center">
          <Avatar
            sx={{ width: 70, height: 70 }}
            src={getPublicFileUrl('me.png', 'images')}
          />
          <Column justify="evenly" style={{ marginLeft: 10 }}>
            <H2>Björn Friedrichs</H2>
            <Row gap={5}>
              <ArrowCircleUpIcon sx={{ fontSize: '1.2em' }} />
              <span>That&apos;s me</span>
            </Row>
          </Column>
        </Row>
        <NavigationButtons />
      </Row>

      <Divider />
      <Row wrapping gap={10}>
        <Row justify="start" flexed>
          {token ? (
            <Row gap={10}>
              <Chip
                icon={<AdminPanelSettingsIcon fontSize="small" />}
                label="Admin"
                clickable
                variant="outlined"
                onClick={() => history.push('/admin')}
              />
              <Chip
                icon={<LogoutIcon fontSize="small" />}
                label="Sign out"
                clickable
                variant="outlined"
                onClick={() => setToken(null)}
              />
            </Row>
          ) : null}
        </Row>
        <Row justify="end" gap={15}>
          <Chip
            component="a"
            icon={<GitHubIcon />}
            href="https://github.com/BFriedrichs"
            label="BFriedrichs"
            variant="outlined"
            clickable
            target="_blank"
          />
          <Chip
            component="a"
            icon={<LinkedInIcon />}
            href="https://linkedin.com/in/bjoern-friedrichs"
            label="bjoern-friedrichs"
            variant="outlined"
            clickable
            target="_blank"
          />
        </Row>
      </Row>
    </BG>
  );
};

export default Header;
