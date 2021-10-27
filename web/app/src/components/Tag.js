import React from 'react'

import { Chip, Button } from '@mui/material'
import styled from '@emotion/styled'
import UnstyledLink from 'app/components/UnstyledLink'

const StyledChip = styled(Chip)`
  padding: 4px;
  text-transform: none;
  cursor: pointer;
  border-radius: 10px;
`

const Tag = ({ name, onDelete, size, style, sx }) => (
  <UnstyledLink style={style} to={onDelete ? null : `/blog?search=${name}`}>
    <StyledChip
      as={Button}
      size={size}
      label={name}
      onDelete={onDelete}
      sx={sx}
    />
  </UnstyledLink>
)

export default Tag
