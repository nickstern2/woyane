import React, { useState, useCallback } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Typography,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { FormikConfig, FormikProps, FormikValues, useFormik } from "formik";
import { AccordionStyles, linkStyles, summaryStyles } from "../../utils/styles";
import { LoginFormInitialValuesType } from "../../utils/types";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { sendEmailVerification } from "firebase/auth";
import {
  forgotPassword,
  PurchaseType,
  resendEmailVerification,
  signIn,
  signUp,
  UserAuthState,
} from "../../utils/auth-utils";
import LockIcon from "@mui/icons-material/Lock";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { ForgotPasswordValidationSchema } from "../../utils/validations";

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
  const formik = useFormik(formikInitializerValues);
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const handleForgotPassword = () => setIsForgotPassword((prev) => !prev);

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
      {isForgotPassword ? (
        <ForgotPasswordFields isAccordion={isAccordion} />
      ) : (
        <RegisterOrLoginFields
          formik={formik}
          formId={formId}
          isLogin={isLogin}
          isAccordion={isAccordion}
          handleForgotPassword={handleForgotPassword}
        />
      )}
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
  // TODO: These are the same just render <AuthToggle isLogin={isLogin} toggleAuthMode={toggleAuthMode} />
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
        <Stack direction='column' spacing={1}>
          <Stack direction='row' spacing={1}>
            <CheckCircleIcon color='success' />
            <Typography>
              Sign up successful. Check email for confirmation.
            </Typography>
          </Stack>
          <Typography
            alignSelf='center'
            onClick={() => resendEmailVerification()}
            sx={linkStyles}>
            Resend verification email
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};

const RegisterOrLoginFields: React.FC<{
  formik: FormikProps<LoginFormInitialValuesType>;
  formId: string;
  isLogin: boolean;
  isAccordion: boolean;
  handleForgotPassword: () => void;
}> = ({ formik, formId, isLogin, isAccordion, handleForgotPassword }) => {
  return (
    <form onSubmit={formik.handleSubmit} id={formId} noValidate>
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
          size='small'
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
          size='small'
          fullWidth
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
        />

        <Typography
          onClick={handleForgotPassword}
          component='span'
          sx={linkStyles}>
          {"Forgot your password?"}
        </Typography>

        {/* {isForgotPassword ? <ForgotPasswordFields /> : null} */}

        <Button
          disabled={formik.isSubmitting}
          type='submit'
          variant='contained'
          sx={{ mt: 2 }}>
          {isLogin ? "Sign In" : "Sign Up"}
        </Button>
      </Stack>
    </form>
  );
};

const ForgotPasswordFields: React.FC<{ isAccordion: boolean }> = ({
  isAccordion,
}) => {
  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: ForgotPasswordValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      console.log("!submit forgot password values", values);
      // TODO: IF SUCCESSFUL, CLOSE MODAL
      forgotPassword(values.email);
    },
  });
  return (
    <>
      <form id='forgot-password-form' onSubmit={formik.handleSubmit} noValidate>
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
            size='small'
            fullWidth
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <Button
            disabled={formik.isSubmitting}
            type='submit'
            variant='contained'
            sx={{ mt: 2 }}>
            {"Send Password Reset Link"}
          </Button>
        </Stack>
      </form>
    </>
  );
};

const forgotPasswordText =
  "Enter your user account's verified email address and we will send you a password reset link.";

// const RegisterOrLoginFields2: React.FC<{
//   formik: FormikProps<LoginFormInitialValuesType>;
//   formId: string;
//   isLogin: boolean;
//   isAccordion: boolean;
// }> = ({ formik, formId, isLogin, isAccordion }) => {
//   const [isForgotPassword, setIsForgotPassword] = useState(false);
//   const handleForgotPassword = () => setIsForgotPassword((prev) => !prev);

//   return (
//     <form onSubmit={formik.handleSubmit} id={formId} noValidate>
//       <Stack
//         display='flex'
//         flexDirection='column'
//         justifyContent='center'
//         spacing={2}
//         sx={{ padding: 2, ...(isAccordion ? { boxShadow: 3 } : {}) }}>
//         {!isForgotPassword ? (
//           <>
//             <TextField
//               required
//               name='email'
//               label='Email'
//               size='small'
//               fullWidth
//               value={formik.values.email}
//               onChange={formik.handleChange}
//               onBlur={formik.handleBlur}
//               error={formik.touched.email && Boolean(formik.errors.email)}
//               helperText={formik.touched.email && formik.errors.email}
//             />
//             <TextField
//               required
//               name='password'
//               type='password'
//               label='Password'
//               size='small'
//               fullWidth
//               value={formik.values.password}
//               onChange={formik.handleChange}
//               onBlur={formik.handleBlur}
//               error={formik.touched.password && Boolean(formik.errors.password)}
//               helperText={formik.touched.password && formik.errors.password}
//             />
//           </>
//         ) : null}
//         {isForgotPassword ? null : (
//           <Typography
//             onClick={handleForgotPassword}
//             component='span'
//             sx={linkStyles}>
//             {"Forgot your password?"}
//           </Typography>
//         )}
//         {isForgotPassword ? <ForgotPasswordFields /> : null}
//         {isForgotPassword ? null : (
//           <Button
//             disabled={formik.isSubmitting}
//             type='submit'
//             variant='contained'
//             sx={{ mt: 2 }}>
//             {isLogin ? "Sign In" : "Sign Up"}
//           </Button>
//         )}
//       </Stack>
//     </form>
//   );
// };
