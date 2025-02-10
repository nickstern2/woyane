import React, { useState, useCallback } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { FormikConfig, FormikProps, FormikValues, useFormik } from "formik";
import { AccordionStyles, linkStyles, summaryStyles } from "../../utils/styles";
import { LoginFormInitialValuesType } from "../../utils/types";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { sendEmailVerification } from "firebase/auth";
import { signIn, signUp, UserAuthState } from "../../utils/auth-utils";
import LockIcon from "@mui/icons-material/Lock";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

interface PaymentFormProps {
  formikInitializerValues: FormikConfig<LoginFormInitialValuesType>;
  isAccordion?: boolean;
  expanded?: boolean;
  formId: string;
  onToggle?: () => void;
  authState: UserAuthState;
}

const RegisterOrLoginForm: React.FC<PaymentFormProps> = ({
  formId,
  formikInitializerValues,
  isAccordion = false,
  expanded,
  authState,
  onToggle,
}) => {
  console.log("!authState", authState);
  const formik = useFormik(formikInitializerValues);
  const [isLogin, setIsLogin] = useState(true);

  // Toggle Login/Register Mode
  const toggleAuthMode = useCallback(
    (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
      event.stopPropagation();
      setIsLogin((prev) => !prev);
    },
    []
  );

  return authState === UserAuthState.VERIFIED ? null : (
    <ContainerWrapper
      isAccordion={isAccordion}
      expanded={authState !== UserAuthState.NOT_SIGNED_IN ? false : expanded}
      onToggle={onToggle}
      isLogin={isLogin}
      toggleAuthMode={toggleAuthMode}
      authState={authState}>
      <RegisterOrLoginFields
        formik={formik}
        formId={formId}
        isLogin={isLogin}
        isAccordion={isAccordion}
      />
    </ContainerWrapper>
  );
};

export default RegisterOrLoginForm;

const ContainerWrapper: React.FC<{
  isAccordion: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  isLogin: boolean;
  toggleAuthMode: (
    event: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => void;
  authState: UserAuthState;
  children: React.ReactNode;
}> = ({
  isAccordion,
  expanded,
  onToggle,
  isLogin,
  toggleAuthMode,
  authState,
  children,
}) => {
  const headerContent = !isAccordion ? (
    <AuthToggle isLogin={isLogin} toggleAuthMode={toggleAuthMode} />
  ) : expanded ? (
    <AuthToggle isLogin={isLogin} toggleAuthMode={toggleAuthMode} />
  ) : (
    <SubmissionStatus authState={authState} />
  );

  return isAccordion ? (
    <Accordion style={AccordionStyles} expanded={expanded} onChange={onToggle}>
      <AccordionSummary sx={summaryStyles}>{headerContent}</AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  ) : (
    <>
      {headerContent}
      {children}
    </>
  );
};

const AuthToggle: React.FC<{
  isLogin: boolean;
  toggleAuthMode: (
    event: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => void;
}> = ({ isLogin, toggleAuthMode }) => (
  <Typography textAlign='center'>
    {isLogin ? "Don't have an account? " : "Already have an account? "}
    <Typography component='span' onClick={toggleAuthMode} sx={linkStyles}>
      {isLogin ? "Sign up" : "Sign in"}
    </Typography>
  </Typography>
);

const SubmissionStatus: React.FC<{ authState: UserAuthState }> = ({
  authState,
}) => {
  return (
    <Stack direction='row' spacing={1} alignItems='center'>
      {authState === UserAuthState.NOT_SIGNED_IN && (
        <>
          <ArrowRightAltIcon color='warning' />
          <Typography>You must sign in to continue</Typography>
        </>
      )}

      {authState === UserAuthState.SIGNED_IN_NOT_VERIFIED && (
        <>
          <CheckCircleIcon color='success' />
          <Typography>
            Sign up successful. Check email for confirmation.
          </Typography>
        </>
      )}
    </Stack>
  );
};

const RegisterOrLoginFields: React.FC<{
  formik: FormikProps<LoginFormInitialValuesType>;
  formId: string;
  isLogin: boolean;
  isAccordion: boolean;
}> = ({ formik, formId, isLogin, isAccordion }) => (
  <form onSubmit={formik.handleSubmit} id={formId}>
    <Stack
      display='flex'
      flexDirection='column'
      justifyContent='center'
      spacing={2}
      sx={{ padding: 2, ...(isAccordion ? { boxShadow: 3 } : {}) }}>
      <TextField
        required
        name='email'
        label='Email'
        fullWidth
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
      />
      <TextField
        required
        name='password'
        type='password'
        label='Password'
        fullWidth
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
      />
      <Button type='submit' variant='contained' sx={{ mt: 2 }}>
        {isLogin ? "Sign In" : "Sign Up"}
      </Button>
    </Stack>
  </form>
);
