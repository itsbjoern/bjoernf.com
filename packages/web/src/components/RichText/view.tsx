import { useRemirrorContext } from '@remirror/react';
import React, { useState } from 'react';

import classes from './style.module.scss';

const View: FunctionComponent = () => {
  const { getRootProps } = useRemirrorContext();
  const [rootProps] = useState(() => getRootProps());
  return <div className={classes.editorStyle} {...rootProps} />;
};

export default View;
