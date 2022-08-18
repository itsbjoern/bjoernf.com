import React from 'react';
import styled from 'styled-components';

const Sticky = styled.div`
  ${(props) => `
    ${props.hideMenu ? 'display: none;' : ''}
    @media only screen and (max-width: 425px) {
      margin-bottom: 10px;
    }

    @media only screen and (min-width: 426px) {
      position: sticky;
      height: 0;
      top: 20px;
      width: ${props.width}px;

      ${
        props.left
          ? `
        left: 0;
        transform: translateX(-${props.width + props.gap}px);
        `
          : `
        align-self: flex-end;
        transform: translateX(${props.width + props.gap}px);
        `
      }
    }
  `}
`;

const Wrapper = styled.div`
  display: flex;
  height: auto;
  flex-direction: column;
`;

const FloatAside = ({
  children,
  menu,
  hideMenu,
  width = 200,
  left = true,
  gap = 50,
}) => {
  return (
    <Wrapper>
      <Sticky hideMenu={hideMenu} width={width} gap={gap} left={left}>
        {menu}
      </Sticky>
      {children}
    </Wrapper>
  );
};

export default FloatAside;
