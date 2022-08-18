import styled from 'styled-components';

const CircularProgressWrapper = styled.span`
  @keyframes animation-rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  display: inline-block;
  color: ${({ theme }) => theme.palette.primary.main};
  animation: 1.4s linear 0s infinite normal none running animation-rotate;
  ${({ size }) => `
    width: ${size}px;
    height: ${size}px;
  `}
`;

const Circle = ({ ...props }) => <circle {...props}></circle>;
const SvgCircle = styled(Circle)`
  @keyframes animation-dash {
    0% {
      stroke-dasharray: 1px, 200px;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 100px, 200px;
      stroke-dashoffset: -15px;
    }
    100% {
      stroke-dasharray: 100px, 200px;
      stroke-dashoffset: -125px;
    }
  }

  stroke: currentcolor;
  stroke-dasharray: 80px, 200px;
  stroke-dashoffset: 0;
  animation: 1.4s ease-in-out 0s infinite normal none running animation-dash;
  transform-origin: 0px 0px;
`;

const CircularProgress = ({ size = 40, ...props }) => {
  return (
    <CircularProgressWrapper size={size} {...props}>
      <svg
        style={{
          display: 'block',
          overflow: 'hidden',
          width: size,
          height: size,
        }}
        viewBox="22 22 44 44"
      >
        <SvgCircle cx="44" cy="44" r="20.2" fill="none" stroke-width="3.6" />
      </svg>
    </CircularProgressWrapper>
  );
};

export default CircularProgress;
