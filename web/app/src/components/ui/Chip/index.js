import Ripples from 'app/lib/Ripples';

import DeleteIcon from 'app/components/icons/Delete.svg';
import { IconButton } from 'app/components/ui/Button';

import * as classes from './style.module.scss';

const Chip = ({
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
