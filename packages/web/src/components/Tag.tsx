import { FunctionalComponent } from 'preact';
import React, { CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import Chip from 'src/components/ui/Chip';

type TagProps = {
  name: string;
  onDelete?: (evt: MouseEvent) => void;
  style?: CSSProperties;
};

const Tag: FunctionalComponent<TagProps> = ({ name, onDelete, style }) => (
  <Chip
    variant="contained"
    as={onDelete ? 'div' : Link}
    to={onDelete ? undefined : `/blog?search=${name}`}
    clickable
    className="-mt-1"
    style={style}
    label={name}
    onDelete={onDelete}
  />
);

export default Tag;
