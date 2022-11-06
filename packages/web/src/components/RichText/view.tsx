import { useRemirrorContext } from '@remirror/react';
import { FunctionalComponent } from 'preact';
import React, { useState } from 'react';

import classes from './style.module.scss';

const View: FunctionalComponent = () => {
  const { getRootProps } = useRemirrorContext();
  const [rootProps] = useState(() => getRootProps());
  return <div className={classes.editorStyle} {...rootProps} />;
};

export default View;
