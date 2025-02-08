import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

export const ConfirmationDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ open, onClose, onConfirm }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Cancel Purchase?</DialogTitle>
    <DialogContent>
      <Typography>
        Are you sure you want to cancel? Your progress will be lost.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color='inherit'>
        No
      </Button>
      <Button onClick={onConfirm} color='error'>
        Yes, Cancel
      </Button>
    </DialogActions>
  </Dialog>
);
