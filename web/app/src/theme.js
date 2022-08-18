/*
  https://coolors.co/9e829c-381d2a-ff570a-eef1f3-3f403f
*/
import styled from 'styled-components';

export const hexToRgba = (hex, alpha = 1) => {
  var c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(
      ','
    )},${alpha})`;
  }
  throw new Error('Bad Hex');
};

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
  hexToRgba,
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
