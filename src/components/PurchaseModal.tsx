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
} from "@mui/material";
import { Formik, Field, Form, useFormik } from "formik";
import { auth } from "../firebase"; // Import Firebase
import { PurchaseModalValidationSchema } from "../utils/validations";
import { signIn, signUp } from "../utils/auth-utils";
import {
  getAuth,
  onAuthStateChanged,
  sendEmailVerification,
  User,
} from "firebase/auth";
import { ConfirmationDialog } from "./ConfirmationDialog";

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
  handleClose: (reason?: "backdropClick" | "escapeKeyDown") => void;
  handlePurchase: (type: "rent" | "buy") => void;
  userNeedsVerification: boolean;
  isUserVerified: boolean;
  isUserSignedIn: boolean;
  user: User | null;
  refetchUserData: (user: User) => Promise<void>;
}

type InitialValuesType = {
  email: string;
  password: string;
  billingAddress: string;
  cardDetails: string;
};

const handleAccordionToggle = (
  setter: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setter((prev) => !prev);
};
const InitialValues: InitialValuesType = {
  email: "",
  password: "",
  billingAddress: "",
  cardDetails: "",
};
const BillingInitialValues = {
  billingAddress: "",
  cardDetails: "",
};

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  open,
  isUserSignedIn,
  isUserVerified,
  user,
  userNeedsVerification,
  refetchUserData,
  handleClose,
  handlePurchase,
}) => {
  // const { user: userDataTest, emailVerified: emailVerifiedTest } =
  // useUserStatus();

  // TODO: rename prob to this maybe

  const [emailVerified, setEmailVerified] = useState(false);
  const [isSignUpSectionExpanded, setIsSignUpSectionExpanded] = useState(true);
  const [isPaymentSectionExpanded, setIsPaymentSectionExpanded] =
    useState(false);
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

  console.log("!userNeedsVerification", userNeedsVerification);
  console.log("!userDataTest", userData);

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

  // const handleSubmit = async (values: any, { setSubmitting }: any) => {
  //   console.log("!!Submit", values);
  //   setSubmitting(true);
  //   try {
  //     // Create a new user
  //     // TODO: If fail try to signIn instead, depending on failure message maybe
  //     const userCredential = await signUp(values.email, values.password);
  //     const user = userCredential.user;

  //     // Send verification email
  //     await sendEmailVerification(user);

  //     //
  //     console.log("!*Call startPollingForEmailVerification");
  //     startPollingForEmailVerification(user);
  //     // TODO: Toast notification
  //     console.log("Verification email sent to", values.email);
  //   } catch (error: any) {
  //     console.error("Error signing up:", error?.message);
  //   }
  // };
  const handleSubmit = async (
    values: { email: string; password: string },
    { setSubmitting }: any
  ) => {
    console.log("!!Submit", values);
    setSubmitting(true);
    try {
      // Attempt to sign up
      const userCredential = await signUp(values.email, values.password);
      const user = userCredential.user;

      // Send verification email
      await sendEmailVerification(user);
      console.log("!*Call startPollingForEmailVerification");
      // startPollingForEmailVerification(user);

      // TODO: Toast notification
      console.log("Verification email sent to", values.email);
    } catch (error: any) {
      console.error("Error signing up:", error?.message);

      // If email is already in use, try signing in instead
      if (error.code === "auth/email-already-in-use") {
        console.log("User already exists. Attempting to sign in...");
        try {
          console.log("!Attempting to sign in");
          const signInCredential = await signIn(values.email, values.password);
          console.log("Successfully signed in:", signInCredential.user);
        } catch (signInError: any) {
          console.error("Error signing in:", signInError?.message);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };
  const formik = useFormik({
    initialValues: InitialValues,
    validationSchema: PurchaseModalValidationSchema,
    // TODO: Isolate logic to reuse on both forms
    onSubmit: handleSubmit,
  });
  const paymentInfoFormik = useFormik({
    initialValues: BillingInitialValues,
    // validationSchema: PurchaseModalValidationSchema,
    // TODO: Isolate logic to reuse on both forms
    onSubmit: async (values, { setSubmitting }) => {
      console.log("!!Submit", values);
      // setSubmitting(true);
      // try {
      //   // Create a new user
      //   // TODO: If fail try to signIn instead. depending on failure message maybe
      //   const userCredential = await signUp(values.email, values.password);
      //   const user = userCredential.user;

      //   // Send verification email
      //   await sendEmailVerification(user);

      //   //
      //   console.log("!*Call startPollingForEmailVerification");
      //   startPollingForEmailVerification(user);
      //   // TODO: Toast notification
      //   console.log("Verification email sent to", values.email);
      // } catch (error: any) {
      //   console.error("Error signing up:", error?.message);
      // }
    },
  });

  console.log("!!isUserVerified", isUserVerified);
  useEffect(() => {
    // Cleanup polling interval when the modal is closed or component unmounts
    return () => {
      if (intervalId) {
        clearInterval(intervalId); // Clear interval on unmount or modal close
      }
    };
  }, [intervalId]); // Only run cleanup when intervalId changes

  return (
    <>
      <Dialog
        open={open}
        // onClose={handleClose}
        maxWidth='md'
        fullWidth
        onClose={(event, reason) => handleClose(reason)}>
        <DialogTitle>Modal Title</DialogTitle>

        <form onSubmit={formik.handleSubmit} id='woyane-ud'>
          {!isUserVerified && (
            <Accordion
              expanded={isSignUpSectionExpanded}
              onChange={() => handleAccordionToggle(setIsSignUpSectionExpanded)}
              style={AccordionStyles}>
              {/* If user is not signed in, show them signup */}
              {/* //TODO: Figure out a way to rework this if i cant signin and signup in the same attempt*/}
              {/* Sign up form */}
              {!isUserSignedIn ? (
                <>
                  <AccordionSummary>
                    <Typography>Register</Typography>
                  </AccordionSummary>

                  <AccordionDetails style={AccordionDetailsStyles}>
                    <Stack
                      display='flex'
                      flexDirection='column'
                      justifyContent='center'
                      spacing={2}
                      sx={{ padding: 2, boxShadow: 3 }}>
                      <TextField
                        required
                        name='email'
                        label='Email'
                        fullWidth
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.email && Boolean(formik.errors.email)
                        }
                        helperText={formik.touched.email && formik.errors.email}
                      />
                      <TextField
                        required
                        name='password'
                        id='password'
                        type='password'
                        label='Password'
                        fullWidth
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.password &&
                          Boolean(formik.errors.password)
                        }
                        helperText={
                          formik.touched.password && formik.errors.password
                        }
                      />
                      <Button type='submit' variant='contained' sx={{ mt: 2 }}>
                        Register
                      </Button>
                    </Stack>
                  </AccordionDetails>
                </>
              ) : (
                <AccordionDetails style={AccordionDetailsStyles}>
                  {/* //TODO: style and add success picture maybe  */}
                  <div>
                    Please accept email verification
                    <br />
                    If you are seeing this and already have accepted email
                    verification, please refresh your browser
                  </div>
                </AccordionDetails>
              )}
            </Accordion>
          )}
        </form>

        <form id='woyane-bd' onSubmit={paymentInfoFormik.handleSubmit}>
          {/* //TODO: change this to && after testing */}
          <Accordion
            expanded={userNeedsVerification || isPaymentSectionExpanded}
            onChange={() => handleAccordionToggle(setIsPaymentSectionExpanded)}
            style={AccordionStyles}>
            <AccordionSummary>
              <Typography>Payment Information</Typography>
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

        <DialogActions>
          <Stack direction='row' padding='16px' spacing={2}>
            <Button
              type='submit'
              onClick={() => paymentInfoFormik.submitForm()}
              // onClick={() => handlePurchase("buy")}
              variant='contained'
              color='primary'>
              Confirm
            </Button>
            {/* //TODO:  Add confirmation dialog */}
            <Button
              onClick={() => setShowConfirmDialog(true)}
              // onClick={() => handleClose()}
              color='inherit'>
              Cancel
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
      <ConfirmationDialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleClose}
      />
    </>
  );
};

export default PurchaseModal;
