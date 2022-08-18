import styled from 'styled-components';

const severities = {
  warning: ['rgb(255, 244, 229)', 'rgb(102, 60, 0)'],
  success: ['rgb(237, 247, 237)', 'rgb(30, 70, 32)'],
};

const Alert = styled.div`
  border-radius: 4px;
  box-shadow: none;
  font-family: Raleway, -apple-system, BlinkMacSystemFont, 'Helvetica Neue',
    Arial, 'sans-serif';
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.43;
  background-color: ${({ severity }) => severities[severity][0]};
    severity === 'warning' ?  : ''};
  display: flex;
  padding: 6px 16px;
  color: ${({ severity }) => severities[severity][1]};
`;

export default Alert;
