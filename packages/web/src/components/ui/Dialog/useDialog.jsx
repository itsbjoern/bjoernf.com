import React, { useState, useCallback } from 'react';

import Dialog from './index';

const useDialog = (content, onConfirm) => {
  const [open, setOpen] = useState(false);

  const wrappedConfirm = useCallback(() => {
    onConfirm && onConfirm();
    setOpen(false);
  }, [onConfirm]);

  const Component = () => (
    <Dialog
      content={content}
      onConfirm={wrappedConfirm}
      onClose={() => setOpen(false)}
      open={open}
    />
  );

  return [Component, () => setOpen(true)];
};

export default useDialog;
