import { FunctionalComponent, VNode } from 'preact';
import { CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import Ripples from 'src/lib/Ripples';

import { ReactComponent as DeleteIcon } from 'src/components/icons/Delete.svg';

import classes from './style.module.scss';

type ChipProps = {
  onClick?: (evt: MouseEvent) => void;
  onDelete?: (evt: MouseEvent) => void;
  label?: string;
  icon?: VNode;
  clickable?: boolean;
  variant?: 'outlined' | 'contained';
  className?: string;
  style?: CSSProperties;
} & (
  | {
      as?: 'div';
    }
  | {
      as: 'a';
      href: string;
      target: '_blank';
    }
  | {
      as: typeof Link;
      to: string;
    }
);

const Chip: FunctionalComponent<ChipProps> = ({
  as = 'div',
  onClick,
  onDelete,
  label,
  icon,
  clickable,
  variant,
  className,
  ...rest
}) => {
  const isClickable = onClick || clickable;
  const As = as;
  return (
    <div
      className={`${classes.rippleContainer} ${
        variant === 'outlined' ? classes.outlined : ''
      } ${variant === 'contained' ? classes.contained : ''} ${
        className && className
      }`}
    >
      <Ripples disabled={!isClickable}>
        <As
          onClick={onClick}
          {...rest}
          className={`${classes.container} ${
            isClickable ? classes.clickable : ''
          }`}
          {...rest}
        >
          {icon ? icon : null}
          <span>{label}</span>
          {onDelete ? (
            <DeleteIcon
              className={classes.deleteIcon}
              onMouseDown={(ev) => {
                ev.preventDefault();
                ev.stopPropagation();
              }}
              onClick={onDelete}
            />
          ) : null}
        </As>
      </Ripples>
    </div>
  );
};

export default Chip;
