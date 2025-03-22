import { Button, ButtonProps, CircularProgress } from "@mui/material";
import React from "react";

interface LoadingButtonProps extends ButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
}

export const ModalSaveLoadingButton = ({
  isLoading,
  ...props
}: LoadingButtonProps): React.ReactElement => {
  return (
    <Button
      {...props}
      variant='contained'
      color='primary'
      type='submit'
      disabled={isLoading || props.disabled}>
      <>
        {isLoading && <CircularProgress size={26} />}
        {!isLoading && <span>{props.children}</span>}
      </>
    </Button>
  );
};
