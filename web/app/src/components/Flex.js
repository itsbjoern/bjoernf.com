import styled from '@emotion/styled';

import { mobileMixin, mobileMixins } from 'app/theme';

const translate = {
  start: 'flex-start',
  end: 'flex-end',
  stretch: 'stretch',
  normal: 'normal',
  center: 'center',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

export const Flex = styled.div`
  display: flex;
  ${mobileMixin('display', 'hide', 'none')};

  align-items: ${({ align }) => translate[align || 'normal']};
  justify-content: ${({ justify }) => translate[justify || 'normal']};
  ${({ flexed }) => (flexed ? `flex: 1;` : '')}
  ${({ wrapping }) => (wrapping ? `flex-wrap: wrap;` : '')}
  ${({ grow }) => (grow ? `flex-grow: ${grow};` : '')}
  ${({ shrink }) => (shrink ? `flex-shrink: ${shrink};` : '')}
  ${({ alignSelf }) => (alignSelf ? `align-self: ${alignSelf};` : '')}
  ${({ gap }) => (gap ? `gap: ${gap || 0}px;` : '')}
`;

export const Row = styled(Flex)`
  flex-direction: row;
  ${mobileMixins([
    ['flex-direction', 'flip', 'column'],
    ['flex-direction', 'reverse', 'row-reverse'],
  ])};
`;

export const Column = styled(Flex)`
  flex-direction: column;
  ${mobileMixins([
    ['flex-direction', 'flip', 'row'],
    ['flex-direction', 'reverse', 'column-reverse'],
  ])};
`;
