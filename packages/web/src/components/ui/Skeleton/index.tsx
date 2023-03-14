import { FunctionComponent, HTMLAttributes } from 'react';

import classes from './style.module.scss';

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  width: number;
  height: number;
};

const Skeleton: FunctionComponent<SkeletonProps> = ({
  width,
  height,
  ...props
}) => <div style={{ width, height }} className={classes.shimmer} {...props} />;

export default Skeleton;
