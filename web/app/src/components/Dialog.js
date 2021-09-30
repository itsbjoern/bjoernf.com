import React, { useState, useCallback } from 'react'
import Button from '@mui/material/Button'
import MUIDialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

const Dialog = ({ onConfirm, onClose, content, open }) => {
  return (
    <MUIDialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Confirmation required!</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onConfirm} autoFocus>
          Accept
        </Button>
      </DialogActions>
    </MUIDialog>
  )
}

export const useDialog = (content, onConfirm) => {
  const [open, setOpen] = useState(false)

  const wrappedConfirm = useCallback(() => {
    onConfirm && onConfirm()
    setOpen(false)
  }, [onConfirm])

  const Component = () => (
    <Dialog
      content={content}
      onConfirm={wrappedConfirm}
      onClose={() => setOpen(false)}
      open={open}
    />
  )

  return [Component, () => setOpen(true)]
}

export default Dialog
