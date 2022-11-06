import { FunctionalComponent } from 'preact';
import { HTMLAttributes } from 'preact/compat';

import classes from './style.module.scss';

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  width: number;
  height: number;
};

const Skeleton: FunctionalComponent<SkeletonProps> = ({
  width,
  height,
  ...props
}) => <div style={{ width, height }} className={classes.shimmer} {...props} />;

export default Skeleton;
