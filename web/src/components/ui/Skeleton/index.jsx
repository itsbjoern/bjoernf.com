const Skeleton = ({ width, height, props }) => (
  <div
    style={{ backgroundColor: 'rgba(0,0,0,0.3)', width, height }}
    {...props}
  />
);

export default Skeleton;
