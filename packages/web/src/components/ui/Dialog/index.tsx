import React, { FunctionComponent } from 'react';
import { createPortal } from 'react-dom';

import { isSSR } from 'src/util';

import Button from 'src/components/ui/Button';

import classes from './style.module.scss';

type DialogProps = {
  open: boolean;
  onConfirm?: () => void;
  onClose: () => void;
  content: string | JSX.Element;
};

const Dialog: FunctionComponent<DialogProps> = ({
  open,
  onConfirm,
  onClose,
  content,
}) => {
  if (isSSR) {
    return null;
  }

  let dialogContainer = document.getElementById(
    'dialogs'
  ) as HTMLDivElement | null;
  if (!dialogContainer) {
    dialogContainer = document.createElement('div');
    dialogContainer.id = 'dialogs';
    // dialogContainer.role = 'presentation';
    dialogContainer.style.position = 'fixed';
    dialogContainer.style.zIndex = '1300';
    dialogContainer.style.width = '100%';
    dialogContainer.style.height = '100%';
    dialogContainer.style.display = 'flex';
    dialogContainer.style.pointerEvents = 'none';
    document.body.appendChild(dialogContainer);
  }

  if (!open || !dialogContainer) {
    return null;
  }

  return createPortal(
    <div className={classes.background}>
      <div className={classes.window}>
        <div className={classes.title}>Confirmation required!</div>
        <div className={classes.body}>
          <p>{content}</p>
        </div>
        <div className={classes.actions}>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={onConfirm}>
            Accept
          </Button>
        </div>
      </div>
    </div>,
    dialogContainer
  );
};

export default Dialog;
