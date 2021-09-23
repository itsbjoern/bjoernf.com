/*
  https://coolors.co/9e829c-381d2a-ff570a-eef1f3-3f403f
*/
import styled from 'styled-components'

export default {
  typography: {
    fontSize: 16,
  },
  palette: {
    background: {
      default: '#f2f2f2',
      paper: '#eef1f3',
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
}

export const morphMixin = `
  border-radius: 10px;
  box-shadow:  7px 7px 14px #e1e1e1,
  -7px -7px 14px #ffffff;
`

export const Morph = styled.div`
  padding: 10px;
  ${morphMixin}
`
