import React from 'react'

import { Chip, Button } from '@mui/material'
import styled from '@emotion/styled'
import UnstyledLink from 'app/components/UnstyledLink'

const StyledChip = styled(Chip)`
  padding: 4px;
  text-transform: none;
  cursor: pointer;
`

const Tag = ({ name, onDelete, size, style }) => (
  <UnstyledLink style={style} to={onDelete ? null : `/blog?search=${name}`}>
    <StyledChip as={Button} size={size} label={name} onDelete={onDelete} />
  </UnstyledLink>
)

export default Tag
