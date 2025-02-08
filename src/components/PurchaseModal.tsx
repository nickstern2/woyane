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
  Box,
  Stack,
  TextField,
  FormLabel,
  Input,
  Tooltip,
  IconButton,
} from "@mui/material";
import { Formik, Field, Form, useFormik, FormikConfig } from "formik";
import { auth } from "../firebase"; // Import Firebase
import { PurchaseModalValidationSchema } from "../utils/validations";
import {
  AuthStateDisabledMessage,
  signIn,
  signUp,
  UserAuthState,
} from "../utils/auth-utils";
import {
  getAuth,
  onAuthStateChanged,
  sendEmailVerification,
  User,
} from "firebase/auth";
import { ConfirmationDialog } from "./ConfirmationDialog";
import RegisterOrLoginForm from "../forms/RegisterOrLoginForm/RegisterOrLoginForm";
import { LoginFormInitialValuesType } from "../utils/types";
import ReusableModal from "./ReusableModal";
import { LoginFormInitialValues } from "../utils/consts";
import { handleLoginRegisterFormSubmit } from "../forms/RegisterOrLoginForm/registe-or-login-utils";
import LockIcon from "@mui/icons-material/Lock";
import { summaryStyles } from "../utils/styles";

const InputStyles = {
  // width: "50%",
  height: "40px",
  fontSize: "18px",
  padding: "10px",
  // margin: "16px 15px 8px 0px",
};
const LabelStyles = {
  margin: "16px 0 8px 0",
};
const AccordionStyles = {
  width: "60%",
  margin: "16px auto", // Center the accordion with automatic margin
  borderRadius: "8px", // Rounded corners
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Soft shadow for depth
  backgroundColor: "#f9f9f9", // Light background color
  transition: "all 0.3s ease", // Smooth transition on hover
  "&:hover": {
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)", // Darker shadow on hover
    backgroundColor: "#f1f1f1", // Slightly darker on hover
  },
};
const AccordionDetailsStyles = {
  // display: "flex",
  // justifyContent: "center",
};

interface PurchaseModalProps {
  open: boolean;
  loginErrors: boolean;
  user: User | null;
  handleClose: (reason?: "backdropClick" | "escapeKeyDown") => void;
  handlePurchase: (type: "rent" | "buy") => void;
  refetchUserData: (user: User) => Promise<void>;
  setLoginErrors: React.Dispatch<React.SetStateAction<boolean>>;
  authState: UserAuthState;
}

const handleAccordionToggle = (
  setter: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setter((prev) => !prev);
};

const BillingInitialValues = {
  billingAddress: "",
  cardDetails: "",
};
const PurchaseModal: React.FC<PurchaseModalProps> = ({
  open,
  authState,
  user,
  loginErrors,
  setLoginErrors,
  refetchUserData,
  handleClose,
  handlePurchase,
}) => {
  const [emailVerified, setEmailVerified] = useState(false);
  const [isSignUpSectionExpanded, setIsSignUpSectionExpanded] = useState(true);
  const [isPaymentSectionExpanded, setIsPaymentSectionExpanded] = useState(
    authState === UserAuthState.VERIFIED
  );
  const [userData, setUserData] = useState<User | null>(null);
  const [emailVerifiedTest, setEmailVerifiedTest] = useState(false);

  const [pollingStarted, setPollingStarted] = useState(false); // State to control polling
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null); // Track interval for cleanup
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Trigger polling immediately after successful signup
  // TODO:This works for polling while modal ios open
  const startPollingForEmailVerification = (user: User) => {
    const auth = getAuth();

    // Poll every 5 seconds to check if the email is verified
    const interval = setInterval(async () => {
      await user.reload();
      const updatedUser = auth.currentUser;
      console.log("Checking email verification status...");
      console.log("!*loop", updatedUser);
      if (updatedUser?.emailVerified) {
        setEmailVerified(true); // Email is verified
        clearInterval(interval); // Stop polling once email is verified
      }
    }, 5000); // Poll every 5 seconds

    setIntervalId(interval); // Save the interval ID for cleanup
  };

  // TODO: this work after modal is closed
  // useEffect(() => {
  //   console.log("!* in useEffect");
  //   const auth = getAuth();
  //   const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
  //     if (firebaseUser) {
  //       // Start polling for email verification
  //       const interval = setInterval(async () => {
  //         await firebaseUser.reload();
  //         const updatedUser = auth.currentUser;
  //         console.log("!*firebaseUser loop", updatedUser);
  //         if (updatedUser?.emailVerified) {
  //           setUserData(updatedUser);
  //           setEmailVerifiedTest(true);
  //           clearInterval(interval); // Stop polling once email is verified
  //         }
  //       }, 5000); // Poll every 5 seconds

  //       return () => clearInterval(interval); // Cleanup interval on unmount
  //     } else {
  //       setUserData(null);
  //       setEmailVerifiedTest(false);
  //     }
  //   });

  //   return () => unsubscribe(); // Cleanup the listener on unmount
  // }, [open]);

  const getTooltipMessage = (authState: UserAuthState) => {
    let message = "";
    switch (authState) {
      case UserAuthState.NOT_SIGNED_IN:
        message = AuthStateDisabledMessage.NOT_SIGNED_IN;
        break;

      case UserAuthState.SIGNED_IN_NOT_VERIFIED:
        message = AuthStateDisabledMessage.SIGNED_IN_NOT_VERIFIED;
        break;

      default:
        message = "";
        break;
    }
    return message;
  };
  const tooltipDisabledMessage = getTooltipMessage(authState);

  const loginFormUseFormikValues: FormikConfig<LoginFormInitialValuesType> = {
    initialValues: LoginFormInitialValues,
    validationSchema: PurchaseModalValidationSchema,
    onSubmit: async (values, formikHelpers) => {
      await handleLoginRegisterFormSubmit(
        values,
        formikHelpers,
        setLoginErrors
        // handleClose
      );
    },
  };

  const paymentInfoFormik = useFormik({
    initialValues: BillingInitialValues,
    // validationSchema: PurchaseModalValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      console.log("!!Submit", values);
    },
  });

  console.log("!!authState", authState);

  useEffect(() => {
    // Cleanup polling interval when the modal is closed or component unmounts
    return () => {
      if (intervalId) {
        clearInterval(intervalId); // Clear interval on unmount or modal close
      }
    };
  }, [intervalId]); // Only run cleanup when intervalId changes
  const onSubmit = (formikOnSubmit: () => void) => {
    formikOnSubmit();
  };
  return (
    <ReusableModal
      loginErrors={loginErrors}
      title='Purchase or Rent Woyane'
      open={open}
      handleClose={handleClose}
      customOnSubmit={() => paymentInfoFormik.submitForm()}
      tooltipDisabledMessage={tooltipDisabledMessage}
      authState={authState}
      confirmationSuccessTitle='Purchase' //TODO: switch with rent. Or you better action word
    >
      <>
        <RegisterOrLoginForm
          formId='woyane-ud'
          isAccordion
          authState={authState}
          formikInitializerValues={loginFormUseFormikValues}
          expanded={isSignUpSectionExpanded}
          onToggle={() => handleAccordionToggle(setIsSignUpSectionExpanded)}
        />

        <form id='woyane-bd' onSubmit={paymentInfoFormik.handleSubmit}>
          <Accordion
            expanded={
              authState !== UserAuthState.VERIFIED
                ? false
                : isPaymentSectionExpanded
            }
            onChange={() => handleAccordionToggle(setIsPaymentSectionExpanded)}
            style={AccordionStyles}>
            <AccordionSummary sx={summaryStyles}>
              {authState !== UserAuthState.VERIFIED ? (
                <Tooltip title={tooltipDisabledMessage}>
                  <span>
                    <IconButton
                      size='small'
                      disableRipple
                      sx={{
                        pointerEvents: "none", // Prevents clicking or interaction
                        cursor: "default", // Ensures no hand cursor on hover
                        backgroundColor: "transparent", // Optional: Removes background hover effect
                        "&:hover": { backgroundColor: "transparent" }, // Prevents hover styling
                      }}>
                      <LockIcon color='disabled' />
                    </IconButton>
                  </span>
                </Tooltip>
              ) : null}
              <Typography alignSelf='center'>Payment Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack
                display='flex'
                flexDirection='column'
                justifyContent='center'
                spacing={2}
                sx={{ padding: 2, boxShadow: 3 }}>
                <TextField
                  name='billingAddress'
                  label='Billing Address'
                  fullWidth
                  value={paymentInfoFormik.values.billingAddress}
                  onChange={paymentInfoFormik.handleChange}
                  onBlur={paymentInfoFormik.handleBlur}
                />
                <TextField
                  name='cardDetails'
                  label='Card Details'
                  fullWidth
                  value={paymentInfoFormik.values.cardDetails}
                  onChange={paymentInfoFormik.handleChange}
                  onBlur={paymentInfoFormik.handleBlur}
                />

                {/* <Button type='submit' variant='contained' sx={{ mt: 2 }}>
                Complete Purchase
              </Button> */}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </form>
      </>
    </ReusableModal>
  );
};

export default PurchaseModal;
