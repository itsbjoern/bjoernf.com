import { FunctionalComponent, VNode } from 'preact';
import { HTMLAttributes } from 'preact/compat';

import Ripples from 'src/lib/Ripples';

import classes from './style.module.scss';

const IconButton = (props: HTMLAttributes<HTMLButtonElement>) => (
  <button className={classes.iconButton} {...props} />
);

export { IconButton };

const ButtonGroup = (props: HTMLAttributes<HTMLDivElement>) => (
  <div className="flex flex-row" {...props} />
);

export { ButtonGroup };

type ButtonProps = {
  variant?: 'contained' | 'outlined' | 'text';
  onClick?: (e: MouseEvent) => void;
  startIcon?: VNode;
  disabled?: boolean;
} & HTMLAttributes<HTMLButtonElement>;

const Button: FunctionalComponent<ButtonProps> = ({
  variant,
  onClick,
  children,
  startIcon,
  disabled,
  ...props
}) => {
  return (
    <div>
      <Ripples>
        <button
          onClick={onClick}
          className={`${
            variant === 'contained'
              ? `${classes.contained} bg-primary`
              : `${classes.text} text-primary`
          } ${disabled ? 'bg-zinc-400' : ''}`}
          disabled={disabled}
          {...props}
        >
          {startIcon ? (
            <span className={classes.startIcon}>{startIcon}</span>
          ) : null}
          {children}
        </button>
      </Ripples>
    </div>
  );
};

export default Button;
