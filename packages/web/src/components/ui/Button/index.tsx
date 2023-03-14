import { HTMLAttributes } from 'react';

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
  startIcon?: JSX.Element;
  disabled?: boolean;
} & HTMLAttributes<HTMLButtonElement>;

const Button: FunctionComponent<ButtonProps> = ({
  variant = 'text',
  onClick,
  children,
  startIcon,
  disabled,
  className,
  ...props
}) => {
  return (
    <div className="overflow-hidden rounded-md">
      <Ripples>
        <button
          onClick={onClick}
          className={`${className} ${classes[variant]} ${
            variant === 'text' ? 'text-primary' : 'bg-primary'
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
