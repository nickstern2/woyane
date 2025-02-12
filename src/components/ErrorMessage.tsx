import React from "react";
import { Stack, Typography } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error"; // MUI Error Icon

const ErrorMessageComponent = ({
  showError,
  isAccordion,
}: {
  showError: boolean;
  isAccordion: boolean;
}) => {
  if (!showError) return null;

  return (
    <Stack
      direction='row'
      spacing={1}
      alignItems='center'
      justifyContent='center'
      paddingBottom={isAccordion ? 2 : 4}
      sx={{ color: "error.main" }}>
      <ErrorIcon fontSize='large' />
      <Typography fontWeight='bold'>
        You have entered an invalid username or password.
      </Typography>
    </Stack>
  );
};

export default ErrorMessageComponent;
