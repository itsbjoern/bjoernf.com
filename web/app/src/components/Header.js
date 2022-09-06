import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LogoutIcon from '@mui/icons-material/Logout';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { useRequest } from 'app/providers/RequestProvider';
import { morphMixin } from 'app/theme';
import { getFileUrl } from 'app/util';

import { Row, Column } from 'app/components/Flex';
import { H2 } from 'app/components/Text';
import Chip from 'app/components/ui/Chip';
import Divider from 'app/components/ui/Divider';

import NavigationButtons from './NavigationButtons';

const BG = styled(Column)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding: 15px;
  ${morphMixin()}
  border-radius: 0 0 10px 10px;
`;

const Avatar = styled.img`
  width: 70px;
  height: 70px;
  border-radius: 35px;
  object-fit: cover;
`;

const Header = () => {
  const navigate = useNavigate();
  const { token, setToken } = useRequest();

  return (
    <BG gap={15}>
      <Row justify="between" align="center">
        <Row align="center">
          <Avatar src={getFileUrl('images/me.jpg')} />
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
                variant="outlined"
                onClick={() => navigate('/admin')}
              />
              <Chip
                icon={<LogoutIcon fontSize="small" />}
                label="Sign out"
                variant="outlined"
                onClick={() => setToken(null)}
              />
            </Row>
          ) : null}
        </Row>
        <Row justify="end" gap={15}>
          <Chip
            component="a"
            clickable
            icon={<GitHubIcon />}
            href="https://github.com/BFriedrichs"
            label="BFriedrichs"
            variant="outlined"
            target="_blank"
          />
          <Chip
            component="a"
            clickable
            icon={<LinkedInIcon />}
            href="https://linkedin.com/in/bjoern-friedrichs"
            label="bjoern-friedrichs"
            variant="outlined"
            target="_blank"
          />
        </Row>
      </Row>
    </BG>
  );
};

export default Header;
