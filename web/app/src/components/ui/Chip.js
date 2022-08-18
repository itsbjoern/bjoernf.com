import DeleteIcon from '@mui/icons-material/Delete';
import styled from 'styled-components';

import Ripples from 'app/lib/Ripples';

import { IconButton } from 'app/components/ui/Button';

const RippleContainer = styled.div`
  display: inline-flex;
  max-width: 100%;
  height: 25px;
  border-radius: 16px;
  overflow: hidden;

  ${({ variant }) =>
    variant === 'outlined'
      ? `
      border: 1px solid rgb(189, 189, 189);
      background-color: transparent;`
      : `
      background-color: rgba(0, 0, 0, 0.08);
`}
`;

const Container = styled.div`
  max-width: 100%;
  font-family: Roboto, Helvetica, Arial, sans-serif;
  font-size: 0.8125rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #3f403f;
  white-space: nowrap;
  transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  outline: 0px;
  cursor: default;
  text-decoration: none;
  padding: 0px;
  vertical-align: middle;
  box-sizing: border-box;

  ${({ clickable }) =>
    clickable &&
    `
    &:hover {
      cursor: pointer;
      background-color: rgba(0, 0, 0, 0.04);
    }`}

  & span {
    overflow: hidden;
    text-overflow: ellipsis;
    padding-left: 12px;
    padding-right: 12px;
    white-space: nowrap;
  }

  & svg:not(.delete-icon) {
    color: #616161;
    margin-left: 4px;
    margin-right: -6px;
  }
`;

const Chip = ({
  component,
  onClick,
  onDelete,
  label,
  icon,
  clickable,
  variant,
  ...rest
}) => {
  const isClickable = onClick || clickable;
  return (
    <RippleContainer variant={variant}>
      <Ripples disabled={!isClickable}>
        <Container
          as={component}
          onClick={onClick}
          clickable={isClickable}
          {...rest}
        >
          {icon ? icon : null}
          <span>{label}</span>
          {onDelete ? (
            <IconButton
              onMouseDown={(ev) => {
                ev.preventDefault();
                ev.stopPropagation();
              }}
              onClick={onDelete}
            >
              <DeleteIcon className="delete-icon" size="small" />
            </IconButton>
          ) : null}
        </Container>
      </Ripples>
    </RippleContainer>
  );
};

export default Chip;
