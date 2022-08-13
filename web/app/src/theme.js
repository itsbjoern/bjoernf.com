/*
  https://coolors.co/9e829c-381d2a-ff570a-eef1f3-3f403f
*/
import styled from '@emotion/styled';

export default {
  typography: {
    fontSize: 16,
    fontFamily:
      "'Raleway', '-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'Arial', 'sans-serif'",
  },
  palette: {
    background: {
      default: '#f1f1f1',
      paper: '#f5f5f5',
      offset: '#778DA9',
    },
    primary: {
      main: '#FF570A',
    },
    secondary: {
      main: '#381D2A',
    },
    text: {
      primary: '#3F403F',
      secondary: '#9E829C',
    },
  },
};

export const morphMixin = (size = 5) => `
  border-radius: 10px;
  box-shadow: ${size}px ${size}px ${size * 2}px #e3e3e3,
  -${size}px -${size}px ${size * 2}px #ffffff;
`;

export const Morph = styled.div`
  padding: 10px;
  ${morphMixin}
`;

export const mobileMixins = (mixins) => (props) =>
  `${mixins
    .filter((mixin) => props[mixin[1]] && props[mixin[1]] !== 'mobile')
    .map((mixin) => `${mixin[0]}: ${mixin[2]};`)
    .join('\n')}
  @media only screen and (max-width: 425px) {
    ${mixins
      .filter((mixin) => props[mixin[1]] && props[mixin[1]] === 'mobile')
      .map((mixin) => `${mixin[0]}: ${mixin[2]};`)
      .join('\n')}
  }`;

export const mobileMixin = (attr, prop, mobileValue) =>
  mobileMixins([[attr, prop, mobileValue]]);
