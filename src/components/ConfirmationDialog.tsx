import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  TextField,
} from "@mui/material";
import { useFormik } from "formik";
import { getAuth, sendEmailVerification, User } from "firebase/auth";
import { PurchaseModalValidationSchema } from "../utils/validations";
import { signIn, signUp } from "../utils/auth-utils";

// Reusable confirmation dialog
// TODO: Maybe make the same size as purchase modal
/**
 * TODO: add props here to determine text.
 * a) user is signed up but not verified, say "are you sure cancel purchase.. account is still there if you change your mind"
 * etc...
 */
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
