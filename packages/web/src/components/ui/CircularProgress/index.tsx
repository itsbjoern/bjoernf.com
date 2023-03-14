
import classes from './style.module.scss';

type CircularProgressProps = {
  size: number;
  className?: string;
};

const CircularProgress: FunctionComponent<CircularProgressProps> = ({
  size = 40,
  className,
  ...props
}) => {
  return (
    <div
      className={`text-primary ${classes.wrapper}`}
      style={{ width: size, height: size }}
    >
      <svg
        style={{
          display: 'block',
          overflow: 'hidden',
          width: size,
          height: size,
        }}
        viewBox="22 22 44 44"
      >
        <circle
          className={`${classes.circle} ${className}`}
          cx="44"
          cy="44"
          r="20.2"
          fill="none"
          strokeWidth="3.6"
          {...props}
        />
      </svg>
    </div>
  );
};

export default CircularProgress;
