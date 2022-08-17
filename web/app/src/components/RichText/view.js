import React, { useState } from 'react';
import { useRemirrorContext } from '@remirror/react';

import StyledEditor from './StyledEditor';

const View = () => {
  const { getRootProps } = useRemirrorContext();
  const [rootProps] = useState(() => getRootProps());
  return <StyledEditor {...rootProps} />;
};

export default View;
