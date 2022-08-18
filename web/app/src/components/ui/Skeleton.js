import styled from 'styled-components';

const Skeleton = styled.div`
  ${({ width, height }) => `
    width: ${width}px;
    height: ${height}px;
    background-color: rgba(0,0,0,0.3);
  `}
`;

export default Skeleton;
