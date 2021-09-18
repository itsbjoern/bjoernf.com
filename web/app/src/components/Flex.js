import React from 'react'
import styled from 'styled-components'

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
  align-items: ${({ align }) => translate[align || 'normal']};
  justify-content: ${({ justify }) => translate[justify || 'normal']};
  gap: ${({ gap }) => gap || 0}px;
`

export const Row = styled(Flex)`
  flex-direction: row;
`

export const Column = styled(Flex)`
  flex-direction: column;
`

export const Flexed = styled.div`
  flex: 1;
`
