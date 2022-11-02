import { useRemirrorContext } from '@remirror/react';
import React, { useState } from 'react';

import { editorStyle } from './style.module.scss';

const View = () => {
  const { getRootProps } = useRemirrorContext();
  const [rootProps] = useState(() => getRootProps());
  return <div className={editorStyle} {...rootProps} />;
};

export default View;
