import { useMemo } from 'react';
import styled from 'styled-components';

import Ripples from 'app/lib/Ripples';

const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  background-color: transparent;
  outline: 0px;
  border: 0px;
  margin: 0px;
  cursor: pointer;
  user-select: none;
  vertical-align: middle;
  appearance: none;
  text-decoration: none;
  text-align: center;
  flex: 0 0 auto;
  font-size: 1.5rem;
  padding: 8px;
  border-radius: 50%;
  overflow: visible;
  color: rgba(0, 0, 0, 0.54);
  transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
`;

export { IconButton };

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
`;

export { ButtonGroup };

const ButtonBase = styled.button`
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
  font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.75;
  letter-spacing: 0.02857em;
  text-transform: uppercase;
  min-width: 64px;
  border-radius: 4px;

  && {
    ${({ disabled }) =>
      disabled &&
      `
    background-color: rgba(0,0,0,0.18)`}
  }
`;

const ContainedButton = styled(ButtonBase)`
  padding: 6px 16px;
  transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  color: rgb(255, 255, 255);
  background-color: ${({ theme }) => theme.palette.primary.main};
  box-shadow: rgb(0 0 0 / 20%) 0px 3px 1px -2px,
    rgb(0 0 0 / 14%) 0px 2px 2px 0px, rgb(0 0 0 / 12%) 0px 1px 5px 0px;

  &:hover {
    text-decoration: none;
    box-shadow: rgb(0 0 0 / 20%) 0px 2px 4px -1px,
      rgb(0 0 0 / 14%) 0px 4px 5px 0px, rgb(0 0 0 / 12%) 0px 1px 10px 0px;
  }
`;

const TextButton = styled(ButtonBase)`
  color: ${({ theme }) => theme.palette.primary.main};
  padding: 6px 8px;
  transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

  &:hover {
    text-decoration: none;
    background-color: ${({ theme }) =>
      theme.hexToRgba(theme.palette.primary.main, 0.04)};
  }
`;

const StartIconWrapper = styled.span`
  display: inherit;
  margin-right: 8px;
  margin-left: -4px;
  & > svg {
    font-size: 20px;
  }
`;

const Button = ({ variant, onClick, children, startIcon, ...props }) => {
  const ButtonClass = useMemo(() => {
    if (variant === 'contained') return ContainedButton;
    return TextButton;
  }, [variant]);

  return (
    <div>
      <Ripples>
        <ButtonClass onClick={onClick} {...props}>
          {startIcon ? <StartIconWrapper>{startIcon}</StartIconWrapper> : null}
          {children}
        </ButtonClass>
      </Ripples>
    </div>
  );
};

export default Button;
