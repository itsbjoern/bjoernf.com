import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

import { isSSR } from 'app/util';

import Button from 'app/components/ui/Button';

const DialogBackground = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: all;
`;

const DialogWindow = styled.div`
  background-color: rgb(255, 255, 255);
  color: rgba(0, 0, 0, 0.87);
  transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  border-radius: 4px;
  box-shadow: rgb(0 0 0 / 20%) 0px 11px 15px -7px,
    rgb(0 0 0 / 14%) 0px 24px 38px 3px, rgb(0 0 0 / 12%) 0px 9px 46px 8px;
  margin: 32px;
  position: relative;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  max-height: calc(100% - 64px);
  max-width: 600px;
`;

const DialogTitle = styled.h2`
  margin: 0px;
  font-family: Roboto, Helvetica, Arial, sans-serif;
  font-weight: 500;
  font-size: 1.25rem;
  line-height: 1.6;
  letter-spacing: 0.0075em;
  padding: 16px 24px;
  flex: 0 0 auto;
`;

const DialogBody = styled.div`
  padding-top: 0px;
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 20px 24px;

  & p {
    margin: 0px;
    font-family: Roboto, Helvetica, Arial, sans-serif;
    font-weight: 400;
    font-size: 1rem;
    line-height: 1.5;
    letter-spacing: 0.00938em;
    color: rgba(0, 0, 0, 0.6);
  }
`;

const DialogActions = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  justify-content: flex-end;
  flex: 0 0 auto;
`;

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
    <DialogBackground>
      <DialogWindow>
        <DialogTitle>Confirmation required!</DialogTitle>
        <DialogBody>
          <p>{content}</p>
        </DialogBody>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={onConfirm}>
            Accept
          </Button>
        </DialogActions>
      </DialogWindow>
    </DialogBackground>,
    dialogContainer
  );
};

export const useDialog = (content, onConfirm) => {
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

export default Dialog;
