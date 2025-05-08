import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Reusable confirmation dialog component
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to call when dialog is closed
 * @param {Function} props.onConfirm - Function to call when action is confirmed
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Dialog message
 * @param {string} props.confirmText - Text for confirm button
 * @param {string} props.cancelText - Text for cancel button
 * @param {string} props.confirmButtonColor - Color for confirm button
 * @param {React.ReactNode} props.content - Custom content to override the message
 */
const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonColor = 'primary',
  content = null
}) => {
  const handleCancel = () => {
    if (onClose) {
      onClose(false);
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    if (onClose) {
      onClose(true);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="confirm-dialog-title" sx={{ pr: 8 }}>
        {title}
        <IconButton
          aria-label="close"
          onClick={handleCancel}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        {content || (
          <DialogContentText id="confirm-dialog-description">
            {message}
          </DialogContentText>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleCancel} color="inherit">
          {cancelText}
        </Button>
        <Button onClick={handleConfirm} color={confirmButtonColor} variant="contained" autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;