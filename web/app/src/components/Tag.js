import React from 'react';
import { Link } from 'react-router-dom';

import Chip from 'app/components/ui/Chip';

const Tag = ({ name, onDelete, style }) => (
  <Chip
    variant="contained"
    as={onDelete ? 'div' : Link}
    to={onDelete ? null : `/blog?search=${name}`}
    clickable
    className="-mt-1"
    style={style}
    label={name}
    onDelete={onDelete}
  />
);

export default Tag;
