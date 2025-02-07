import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Stack,
  DialogContent,
  Typography,
  Tooltip,
} from "@mui/material";
import { ConfirmationDialog } from "./ConfirmationDialog";
import ErrorIcon from "@mui/icons-material/Error";
import ErrorMessageComponent from "./ErrorMessage";
import { UserAuthState } from "../utils/auth-utils";
import LockIcon from "@mui/icons-material/Lock";

interface ReusableModalProps {
  open: boolean;
  handleClose: (reason?: "backdropClick" | "escapeKeyDown") => void;
  customOnSubmit?: () => Promise<any>;
  children?: React.ReactElement;
  title?: string;
  confirmationSuccessTitle?: string;
  hideActionButtons?: boolean;
  hideConfirmationDialog?: boolean;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  loginErrors: boolean;
  tooltipDisabledMessage?: string;
  authState: UserAuthState;
}

const ReusableModal: React.FC<ReusableModalProps> = ({
  open,
  title,
  children,
  confirmationSuccessTitle,
  hideActionButtons,
  hideConfirmationDialog,
  maxWidth,
  loginErrors,
  authState,
  tooltipDisabledMessage,
  handleClose,
  customOnSubmit,
}) => {
  // const [loginError, setLoginError] = useState(false);
  console.log("!!loginErrors", loginErrors);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleCloseConfirmationDialog = () => {
    handleClose();
    setShowConfirmDialog(false);
  };

  return (
    <>
      <Dialog
        open={open}
        maxWidth={maxWidth ?? "md"}
        fullWidth
        onClose={(_, reason) => handleClose(reason)}>
        {/* Title */}
        {title ? <DialogTitle>{title}</DialogTitle> : null}
        {/* Body */}
        <DialogContent>{children}</DialogContent>
        <ErrorMessageComponent showError={loginErrors} />
        {/* Action Buttons */}
        {hideActionButtons ? null : (
          <DialogActions>
            <Stack direction='row' padding='16px' spacing={2}>
              {authState !== UserAuthState.VERIFIED ? (
                <Tooltip title={tooltipDisabledMessage} disableInteractive>
                  <span>
                    <Button
                      disabled
                      type='submit'
                      onClick={
                        customOnSubmit ? customOnSubmit : () => undefined
                      }
                      variant='contained'
                      color='primary'>
                      {confirmationSuccessTitle ?? "Confirm"}
                    </Button>
                  </span>
                </Tooltip>
              ) : (
                <Button
                  type='submit'
                  onClick={customOnSubmit ? customOnSubmit : () => undefined}
                  variant='contained'
                  color='primary'
                  startIcon={<LockIcon />}>
                  {confirmationSuccessTitle ?? "Confirm"}
                </Button>
              )}

              <Button
                onClick={() => setShowConfirmDialog(true)}
                color='inherit'>
                Cancel
              </Button>
            </Stack>
          </DialogActions>
        )}
      </Dialog>

      {hideConfirmationDialog ? null : (
        <ConfirmationDialog
          open={showConfirmDialog}
          onClose={() => handleClose()}
          onConfirm={handleCloseConfirmationDialog}
        />
      )}
    </>
  );
};

export default ReusableModal;

// {React.isValidElement<{ loginError?: string }>(children) &&
// React.cloneElement(
//   children as React.ReactElement<{
//     loginError?: boolean;
//     setLoginError?: React.Dispatch<React.SetStateAction<boolean>>;
//   }>,
//   { loginError, setLoginError }
// )}
