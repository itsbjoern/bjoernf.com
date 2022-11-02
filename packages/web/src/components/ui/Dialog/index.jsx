import React from 'react';
import { createPortal } from 'react-dom';

import { isSSR } from 'src/util';

import Button from 'src/components/ui/Button';

import * as classes from './style.module.scss';

const Dialog = ({ open, onConfirm, onClose, content }) => {
  if (isSSR) {
    return null;
  }

  let dialogContainer = document.getElementById('dialogs');
  if (!dialogContainer) {
    dialogContainer = document.createElement('div');
    dialogContainer.id = 'dialogs';
    dialogContainer.role = 'presentation';
    dialogContainer.style.position = 'fixed';
    dialogContainer.style.zIndex = 1300;
    dialogContainer.style.width = '100%';
    dialogContainer.style.height = '100%';
    dialogContainer.style.display = 'flex';
    dialogContainer.style.pointerEvents = 'none';
    document.body.appendChild(dialogContainer);
  }

  if (!open || !dialogContainer) {
    return;
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
