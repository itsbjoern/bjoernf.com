import styled from '@emotion/styled'

const translate = {
  start: 'flex-start',
  end: 'flex-end',
  stretch: 'stretch',
  normal: 'normal',
  center: 'center',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
}

export const Flex = styled.div`
  display: flex;
  flex: ${({ flexed }) => (flexed ? 1 : 'initial')};
  align-items: ${({ align }) => translate[align || 'normal']};
  justify-content: ${({ justify }) => translate[justify || 'normal']};
  ${({ wrapping }) => (wrapping ? `flex-wrap: wrap;` : '')}
  ${({ grow }) => (grow ? `flex-grow: ${grow};` : '')}
  ${({ shrink }) => (shrink ? `flex-shrink: ${shrink};` : '')}
  gap: ${({ gap }) => gap || 0}px;

  @media only screen and (max-width: 425px) {
    ${({ mobileWrapping }) => (mobileWrapping ? 'flex-wrap: wrap;' : '')}
  }
`

export const Row = styled(Flex)`
  flex-direction: row;
`

export const Column = styled(Flex)`
  flex-direction: column;
`
