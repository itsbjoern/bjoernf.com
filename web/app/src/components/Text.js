import styled from 'styled-components';

const wrap = (elem) => {
  return styled(elem`
    @media only screen and (max-width: 425px) {
      ${({ mobileSize }) => mobileSize && `font-size: 1.2rem;`}
    }
  `);
};

const fontMixin = `
  font-family: 'Comfortaa';
`;

export const H1 = wrap(styled.h1)`
  ${fontMixin}
  margin: 0;
`;
export const H2 = wrap(styled.h2)`
  ${fontMixin}
  margin: 0;
`;
export const H3 = wrap(styled.h3)`
  ${fontMixin}
  margin: 0;
`;
export const H4 = wrap(styled.h4)`
  ${fontMixin}
  margin: 0;
`;
export const H5 = wrap(styled.h5)`
  ${fontMixin}
  margin: 0;
`;
