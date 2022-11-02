import { shimmer } from './style.module.scss';

const Skeleton = ({ width, height, props }) => (
  <div style={{ width, height }} className={shimmer} {...props} />
);

export default Skeleton;
