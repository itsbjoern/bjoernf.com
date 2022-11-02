import Ripples from 'src/lib/Ripples';

import * as classes from './style.module.scss';

const IconButton = (props) => (
  <button className={classes.iconButton} {...props} />
);

export { IconButton };

const ButtonGroup = (props) => <div className="flex flex-row" {...props} />;

export { ButtonGroup };

const Button = ({
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
