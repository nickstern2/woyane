import LockIcon from "@mui/icons-material/Lock";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { FormikHelpers, FormikProps, useFormik } from "formik";
import React, { forwardRef, useImperativeHandle } from "react";
import * as Yup from "yup";
import AppConfig from "../app-config";
import { getTooltipMessage, UserAuthState } from "../utils/auth-utils";
import { AccordionStyles, summaryStyles } from "../utils/styles";
import { handlePaymentSubmit } from "../utils/payment-handlers";
import { SubmitCheckoutFormRefCallback } from "./PurchaseModal";
import { useAuth } from "../providers/useAuth";

interface CheckoutFormValues {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

const CheckoutFormInitialValues = {
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  state: "",
  country: "",
  zipCode: "",
};

type CheckoutFormProps = {
  amount: number;
  setClientSecret: React.Dispatch<React.SetStateAction<string | null>>;
  clientSecret: string | null;
  isExpanded: boolean;
  authState: UserAuthState;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  isProcessing: boolean;
  handleClose: () => void;
};
const projectId = AppConfig.FirebaseProjectId;
const url = `https://us-central1-${projectId}.cloudfunctions.net/createPaymentIntent`;

export const StripeCheckoutWrapper = forwardRef<
  SubmitCheckoutFormRefCallback,
  CheckoutFormProps
>((props, ref) => {
  const stripePromise = loadStripe(AppConfig.StripePK);
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm ref={ref} {...props} />
    </Elements>
  );
});
const CheckoutForm = forwardRef<
  SubmitCheckoutFormRefCallback,
  CheckoutFormProps
>((props, ref) => {
  const {
    amount,
    authState,
    clientSecret,
    isExpanded,
    setClientSecret,
    isProcessing,
    setIsProcessing,
    handleClose,
  } = props;
  const { user } = useAuth(); // Access Firebase user
  const userId = user?.uid;

  console.log("!!userId in stripe", userId);

  const stripe = useStripe();
  const elements = useElements();
  // TODO: add spinner animation on success button
  // const [isProcessing, setIsProcessing] = useState(false);

  // Define Validation Schema//TODO: Add to and adjust these
  const validationSchema = Yup.object({
    name: Yup.string().required("Required"),
    address1: Yup.string().required("Required"),
    city: Yup.string().required("Required"),
    country: Yup.string().required("Required"),
    zipCode: Yup.string().required("Required"),
  });

  // TODO: Encapsulate and move up to parent to pass to modal

  const StripCheckoutFormik = useFormik({
    initialValues: CheckoutFormInitialValues,
    // validationSchema: validationSchema,
    // onSubmit: handleSubmit,
    onSubmit: async (values, formikHelpers) => {
      await handlePaymentSubmit(
        values,
        formikHelpers,
        stripe,
        elements,
        url,
        setIsProcessing,
        handleClose,
        userId
      );
    },
  });

  useImperativeHandle(ref, () => ({
    submitForm: async () => await StripCheckoutFormik.handleSubmit(),
  }));

  return (
    <ContainerWrapper expanded={isExpanded} authState={authState}>
      <CheckoutFields
        formik={StripCheckoutFormik}
        isProcessing={isProcessing}
      />
    </ContainerWrapper>
  );
});

export default CheckoutForm;

// **Container Wrapper Component**
const ContainerWrapper: React.FC<{
  expanded?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
  authState: UserAuthState;
}> = ({ expanded, authState, onToggle, children }) => {
  const tooltipDisabledMessage = getTooltipMessage(authState);
  const action =
    authState === UserAuthState.NOT_SIGNED_IN ? "sign in" : "sign up";
  const headerContent =
    authState !== UserAuthState.VERIFIED ? (
      <>
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
        <Tooltip title={tooltipDisabledMessage}>
          <span style={{ alignSelf: "center" }}>
            <Typography>You must {action} to continue</Typography>
          </span>
        </Tooltip>
      </>
    ) : (
      <AccordionSummary sx={summaryStyles}>
        <Typography variant='h5'>Payment Details</Typography>
      </AccordionSummary>
    );
  return (
    <Accordion style={AccordionStyles} expanded={expanded} onChange={onToggle}>
      <AccordionSummary sx={summaryStyles}>{headerContent}</AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};

// **Checkout Fields Component**
const CheckoutFields: React.FC<{
  formik: FormikProps<CheckoutFormValues>;
  isProcessing: boolean;
}> = ({ formik, isProcessing }) => (
  <form onSubmit={formik.handleSubmit}>
    <Stack
      spacing={2}
      sx={{
        mx: "auto",
        paddingBottom: 2,
      }}>
      <Stack direction='row' gap={2}>
        <TextField
          name='firstName'
          label='First Name'
          size='small'
          fullWidth
          value={formik.values.firstName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.firstName && Boolean(formik.errors.firstName)}
          helperText={formik.touched.firstName && formik.errors.firstName}
        />
        <TextField
          name='lastName'
          label='Last Name'
          size='small'
          fullWidth
          value={formik.values.lastName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.lastName && Boolean(formik.errors.lastName)}
          helperText={formik.touched.lastName && formik.errors.lastName}
        />
      </Stack>

      <TextField
        name='address'
        label='Address'
        size='small'
        fullWidth
        value={formik.values.address}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.address && Boolean(formik.errors.address)}
        helperText={formik.touched.address && formik.errors.address}
      />

      <Stack direction='row' gap={2}>
        <TextField
          name='city'
          label='City'
          size='small'
          fullWidth
          value={formik.values.city}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.city && Boolean(formik.errors.city)}
          helperText={formik.touched.city && formik.errors.city}
        />
        <TextField
          name='state'
          label='State'
          size='small'
          fullWidth
          value={formik.values.state}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.state && Boolean(formik.errors.state)}
          helperText={formik.touched.state && formik.errors.state}
        />
        <TextField
          name='zipCode'
          label='ZIP Code'
          size='small'
          fullWidth
          value={formik.values.zipCode}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.zipCode && Boolean(formik.errors.zipCode)}
          helperText={formik.touched.zipCode && formik.errors.zipCode}
        />
      </Stack>

      <Box
        sx={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}>
        <CardElement
          options={{
            hidePostalCode: true,
            style: { base: { fontSize: "16px" } },
          }}
        />
      </Box>

      <Button
        type='submit'
        variant='contained'
        fullWidth
        disabled={isProcessing}>
        {isProcessing ? "Processing..." : "Pay"}
      </Button>
    </Stack>
  </form>
);

// ******Old onSubmit before encapsulation*********
// // Handle Form Submission
// const handleSubmit = async (
//   values: CheckoutFormValues,
//   { setSubmitting, setErrors, resetForm }: FormikHelpers<CheckoutFormValues>
// ) => {
//   setIsProcessing(true);
//   console.log("!submit", values, url);
//   if (!stripe || !elements) return;

//   // TODO: Make this better
//   const name = values.firstName + values.lastName;

//   // TODO: create separate user object for firebase storage/ email campaigns
//   const userDetails = {
//     firstName: values.firstName,
//     lastName: values.lastName,
//     address: {
//       line1: values.address,
//       city: values.city,
//       state: values.state,
//       postal_code: values.zipCode,
//     },
//   };

//   try {
//     // Create PaymentMethod with Stripe
//     const { error, paymentMethod } = await stripe.createPaymentMethod({
//       type: "card",
//       card: elements.getElement(CardElement)!,
//       billing_details: {
//         name: name,
//         address: {
//           line1: values.address,
//           city: values.city,
//           state: values.state,
//           postal_code: values.zipCode,
//         },
//       },
//     });
//     console.log("!! (sub)paymentMethod", paymentMethod);
//     if (error) {
//       console.log("!!errors(sub)", error);
//       // setErrors({ name: error.message || "Payment error" });
//       setSubmitting(false);
//       setIsProcessing(false);
//       return;
//     }
//     // Send data to backend (create PaymentIntent)
//     const response = await fetch(url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         paymentMethodId: paymentMethod.id,
//         amount: 1000, // todo: replace with price
//         currency: "usd",
//       }),
//     });
//     console.log("!! (sub) response:", response);
//     const data = await response.json();
//     console.log("!! (sub) data:", data);
//     if (data.error) {
//       console.log("!! (sub) data error", data.error);
//       // setErrors({ name: data.error });
//       setSubmitting(false);
//       setIsProcessing(false);
//       return;
//     }
//     resetForm();
//     alert("Payment Successful!");
//   } catch (err) {
//     console.log("!(sub) bottom error", err);
//     // setErrors({ name: "Something went wrong." });
//   }

//   setSubmitting(false);
//   setIsProcessing(false);
// };
// ****** Compoennt before forward ref*********
// export const StripeCheckoutWrapper = (props: CheckoutFormProps) => {
//   const stripePromise = loadStripe(AppConfig.StripePK);
//   return (
//     <Elements stripe={stripePromise}>
//       <CheckoutForm {...props} />
//     </Elements>
//   );
// };

// const CheckoutForm: React.FC<CheckoutFormProps> = ({
//   amount,
//   authState,
//   clientSecret,
//   isExpanded,
//   setClientSecret,
//   isProcessing,
//   setIsProcessing,
// }) => {
//   const stripe = useStripe();
//   const elements = useElements();
//   // TODO: add spinner animation on success button
//   // const [isProcessing, setIsProcessing] = useState(false);

//   // Define Validation Schema//TODO: Add to and adjust these
//   const validationSchema = Yup.object({
//     name: Yup.string().required("Required"),
//     address1: Yup.string().required("Required"),
//     city: Yup.string().required("Required"),
//     country: Yup.string().required("Required"),
//     zipCode: Yup.string().required("Required"),
//   });

//   // TODO: Encapsulate and move up to parent to pass to modal
//   // Handle Form Submission
//   const handleSubmit = async (
//     values: CheckoutFormValues,
//     { setSubmitting, setErrors, resetForm }: FormikHelpers<CheckoutFormValues>
//   ) => {
//     setIsProcessing(true);
//     console.log("!submit", values);
//     if (!stripe || !elements) return;

//     // TODO: Make this better
//     const name = values.firstName + values.lastName;

//     // TODO: create separate user object for firebase storage/ email campaigns
//     const userDetails = {
//       firstName: values.firstName,
//       lastName: values.lastName,
//       address: {
//         line1: values.address,
//         city: values.city,
//         state: values.state,
//         postal_code: values.zipCode,
//       },
//     };

//     try {
//       // Create PaymentMethod with Stripe
//       const { error, paymentMethod } = await stripe.createPaymentMethod({
//         type: "card",
//         card: elements.getElement(CardElement)!,
//         billing_details: {
//           name: name,
//           address: {
//             line1: values.address,
//             city: values.city,
//             state: values.state,
//             postal_code: values.zipCode,
//           },
//         },
//       });
//       console.log("!! (sub)paymentMethod", paymentMethod);
//       if (error) {
//         console.log("!!errors(sub)", error);
//         // setErrors({ name: error.message || "Payment error" });
//         setSubmitting(false);
//         setIsProcessing(false);
//         return;
//       }
//       // Send data to backend (create PaymentIntent)
//       const response = await fetch(url, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           paymentMethodId: paymentMethod.id,
//           amount: 1000, // todo: replace with price
//           currency: "usd",
//         }),
//       });
//       console.log("!! (sub) response:", response);
//       const data = await response.json();
//       console.log("!! (sub) data:", data);
//       if (data.error) {
//         console.log("!! (sub) data error", data.error);
//         // setErrors({ name: data.error });
//         setSubmitting(false);
//         setIsProcessing(false);
//         return;
//       }
//       resetForm();
//       alert("Payment Successful!");
//     } catch (err) {
//       console.log("!(sub) bottom error", err);
//       // setErrors({ name: "Something went wrong." });
//     }

//     setSubmitting(false);
//     setIsProcessing(false);
//   };

//   const StripCheckoutFormik = useFormik({
//     initialValues: CheckoutFormInitialValues,
//     // validationSchema: validationSchema,
//     onSubmit: handleSubmit,
//   });

//   return (
//     <ContainerWrapper expanded={isExpanded} authState={authState}>
//       <CheckoutFields
//         formik={StripCheckoutFormik}
//         isProcessing={isProcessing}
//       />
//     </ContainerWrapper>
//   );
// };

// export default CheckoutForm;

// // **Container Wrapper Component**
// const ContainerWrapper: React.FC<{
//   expanded?: boolean;
//   onToggle?: () => void;
//   children: React.ReactNode;
//   authState: UserAuthState;
// }> = ({ expanded, authState, onToggle, children }) => {
//   const tooltipDisabledMessage = getTooltipMessage(authState);
//   const action =
//     authState === UserAuthState.NOT_SIGNED_IN ? "sign in" : "sign up";
//   const headerContent =
//     authState !== UserAuthState.VERIFIED ? (
//       <>
//         <Tooltip title={tooltipDisabledMessage}>
//           <span>
//             <IconButton
//               size='small'
//               disableRipple
//               sx={{
//                 pointerEvents: "none", // Prevents clicking or interaction
//                 cursor: "default", // Ensures no hand cursor on hover
//                 backgroundColor: "transparent", // Optional: Removes background hover effect
//                 "&:hover": { backgroundColor: "transparent" }, // Prevents hover styling
//               }}>
//               <LockIcon color='disabled' />
//             </IconButton>
//           </span>
//         </Tooltip>
//         <Tooltip title={tooltipDisabledMessage}>
//           <span style={{ alignSelf: "center" }}>
//             <Typography>You must {action} to continue</Typography>
//           </span>
//         </Tooltip>
//       </>
//     ) : (
//       <AccordionSummary sx={summaryStyles}>
//         <Typography variant='h5'>Payment Details</Typography>
//       </AccordionSummary>
//     );
//   return (
//     <Accordion style={AccordionStyles} expanded={expanded} onChange={onToggle}>
//       <AccordionSummary sx={summaryStyles}>{headerContent}</AccordionSummary>
//       <AccordionDetails>{children}</AccordionDetails>
//     </Accordion>
//   );
// };

// // **Checkout Fields Component**
// const CheckoutFields: React.FC<{
//   formik: FormikProps<CheckoutFormValues>;
//   isProcessing: boolean;
// }> = ({ formik, isProcessing }) => (
//   <form onSubmit={formik.handleSubmit}>
//     <Stack
//       spacing={2}
//       sx={{
//         mx: "auto",
//         paddingBottom: 2,
//       }}>
//       <Stack direction='row' gap={2}>
//         <TextField
//           name='firstName'
//           label='First Name'
//           size='small'
//           fullWidth
//           value={formik.values.firstName}
//           onChange={formik.handleChange}
//           onBlur={formik.handleBlur}
//           error={formik.touched.firstName && Boolean(formik.errors.firstName)}
//           helperText={formik.touched.firstName && formik.errors.firstName}
//         />
//         <TextField
//           name='lastName'
//           label='Last Name'
//           size='small'
//           fullWidth
//           value={formik.values.lastName}
//           onChange={formik.handleChange}
//           onBlur={formik.handleBlur}
//           error={formik.touched.lastName && Boolean(formik.errors.lastName)}
//           helperText={formik.touched.lastName && formik.errors.lastName}
//         />
//       </Stack>

//       <TextField
//         name='address'
//         label='Address'
//         size='small'
//         fullWidth
//         value={formik.values.address}
//         onChange={formik.handleChange}
//         onBlur={formik.handleBlur}
//         error={formik.touched.address && Boolean(formik.errors.address)}
//         helperText={formik.touched.address && formik.errors.address}
//       />

//       <Stack direction='row' gap={2}>
//         <TextField
//           name='city'
//           label='City'
//           size='small'
//           fullWidth
//           value={formik.values.city}
//           onChange={formik.handleChange}
//           onBlur={formik.handleBlur}
//           error={formik.touched.city && Boolean(formik.errors.city)}
//           helperText={formik.touched.city && formik.errors.city}
//         />
//         <TextField
//           name='state'
//           label='State'
//           size='small'
//           fullWidth
//           value={formik.values.state}
//           onChange={formik.handleChange}
//           onBlur={formik.handleBlur}
//           error={formik.touched.state && Boolean(formik.errors.state)}
//           helperText={formik.touched.state && formik.errors.state}
//         />
//         <TextField
//           name='zipCode'
//           label='ZIP Code'
//           size='small'
//           fullWidth
//           value={formik.values.zipCode}
//           onChange={formik.handleChange}
//           onBlur={formik.handleBlur}
//           error={formik.touched.zipCode && Boolean(formik.errors.zipCode)}
//           helperText={formik.touched.zipCode && formik.errors.zipCode}
//         />
//       </Stack>

//       <Box
//         sx={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}>
//         <CardElement
//           options={{
//             hidePostalCode: true,
//             style: { base: { fontSize: "16px" } },
//           }}
//         />
//       </Box>

//       <Button
//         type='submit'
//         variant='contained'
//         fullWidth
//         disabled={isProcessing}>
//         {isProcessing ? "Processing..." : "Pay"}
//       </Button>
//     </Stack>
//   </form>
// );
