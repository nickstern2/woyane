import * as Yup from "yup";

// Define your validation schema with Yup

export const PurchaseModalValidationSchema = Yup.object({
  email: Yup.string().email().required("Email is required"),
  password: Yup.string()
    .required("No password provided.")
    .min(8, "Password is too short - should be 8 chars minimum."),
});
