import AccountTreeIcon from '@mui/icons-material/AccountTree';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/Receipt';
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import styled from 'styled-components';

import Ripples from 'app/lib/Ripples';

const BottomNavigationAction = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  background-color: transparent;
  outline: 0;
  border: 0;
  margin: 0;
  border-radius: 0;
  padding: 0;
  cursor: pointer;
  user-select: none;
  vertical-align: middle;
  text-decoration: none;
  color: inherit;
  transition: none;
  padding: 0px 12px;
  min-width: 80px;
  max-width: 168px;
  color: ${({ theme, selected }) =>
    selected ? theme.palette.primary.main : '#9E829C'};
  flex-direction: column;
  flex: 1;

  & span {
    font-size: 1rem;
  }

  & svg {
    user-select: none;
    width: 1em;
    height: 1em;
    display: inline-block;
    fill: currentColor;
    flex-shrink: 0;
    transition: none;
    font-size: 1.7142857142857142rem;
  }
`;

const FullButton = ({ label, icon, to, ...props }) => (
  <Ripples>
    <BottomNavigationAction
      as={Link}
      style={{ minWidth: 85, flex: 1 }}
      to={to}
      {...props}
    >
      {icon}
      <span>{label}</span>
    </BottomNavigationAction>
  </Ripples>
);

const StyledNav = styled.div`
  z-index: 100;
  display: flex;
  justify-content: center;
  height: 56px;
  justify-content: space-evenly;

  @media only screen and (max-width: 425px) {
    ${({ mobile }) => (!mobile ? 'display: none;' : '')}
    position: sticky;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: ${({ theme }) => theme.palette.background.paper};
    box-shadow: 0 1px 10px 4px rgb(0 0 0 / 20%);
  }

  @media only screen and (min-width: 426px) {
    ${({ mobile }) => (mobile ? 'display: none;' : '')}
  }
`;

const paths = ['/', '/blog', '/projects'];
const NavigationButtons = ({ mobile }) => {
  const location = useLocation();
  const split = location.pathname.split('/');
  const menuIndex = split.length === 1 ? 0 : paths.indexOf('/' + split[1]);

  return (
    <StyledNav mobile={mobile ? 'true' : null}>
      <FullButton
        label="Home"
        icon={<HomeIcon />}
        selected={menuIndex === 0}
        to={paths[0]}
      />
      <FullButton
        label="Blog"
        icon={<ReceiptIcon />}
        selected={menuIndex === 1}
        to={paths[1]}
      />
      <FullButton
        label="Projects"
        icon={<AccountTreeIcon />}
        selected={menuIndex === 2}
        to={paths[2]}
      />
    </StyledNav>
  );
};

export default NavigationButtons;
