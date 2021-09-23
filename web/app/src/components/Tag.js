import React from 'react'

import { Chip } from '@mui/material'
import { withRouter } from 'react-router-dom'

const Tag = ({ name, onDelete, size, history }) => (
  <Chip
    style={{ padding: '4px' }}
    size={size}
    label={name}
    onDelete={onDelete}
    onClick={() => history.push(`/blog?search=${name}`)}
  />
)

export default withRouter(Tag)
