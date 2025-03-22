import * as Yup from "yup";

// Define your validation schema with Yup

export const PurchaseModalValidationSchema = Yup.object({
  email: Yup.string().email().required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password is too short - 8 chars minimum"),
});
export const ForgotPasswordValidationSchema = Yup.object({
  email: Yup.string().email().required("Email is required"),
});
