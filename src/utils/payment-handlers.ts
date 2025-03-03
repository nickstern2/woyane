import { CardElement } from "@stripe/react-stripe-js";
import { Stripe, StripeElements } from "@stripe/stripe-js";
import { FormikHelpers } from "formik";
import { toast } from "react-toastify";
import { useAuth } from "../providers/useAuth";

export interface CheckoutFormValues {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export const handlePaymentSubmit = async (
  values: CheckoutFormValues,
  formikHelpers: FormikHelpers<CheckoutFormValues>,
  stripe: Stripe | null,
  elements: StripeElements | null,
  url2: string,
  setIsProcessing: (processing: boolean) => void,
  handleClose: () => void,
  userId: string | undefined
) => {
  // const { user } = useAuth(); // Access Firebase user
  // const userId = user?.uid;
  console.log("!!in handle userId", userId);
  // TODO: Emulator url. make dynamic
  const url =
    "http://127.0.0.1:5001/woyane-36a2f/us-central1/createPaymentIntent";

  const { setSubmitting, setErrors, resetForm } = formikHelpers;

  setIsProcessing(true);
  console.log("!submit", values, url);
  console.log("!userId", userId);
  if (!stripe || !elements) return;

  const name = values.firstName + " " + values.lastName;
  // TODO: Store user details for add campaigns
  const userDetails = {
    firstName: values.firstName,
    lastName: values.lastName,
    address: {
      line1: values.address,
      city: values.city,
      state: values.state,
      postal_code: values.zipCode,
    },
  };

  try {
    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      console.error("CardElement not found");
      setIsProcessing(false);
      setSubmitting(false);
      return;
    }
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: {
        name: name,
        address: {
          line1: values.address,
          city: values.city,
          state: values.state,
          // postal_code: values.zipCode,
        },
      },
    });

    console.log("!! (sub)paymentMethod", paymentMethod);
    if (error) {
      console.log("!!errors(sub)", error);
      // setErrors({ name: error.message || "Payment error" });
      setSubmitting(false);
      setIsProcessing(false);
      return;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentMethodId: paymentMethod.id,
        amount: 15000, // TODO: replace with price
        currency: "usd", //TODO:
        userId: userId,
        isRented: false, //todo:
      }),
    });

    console.log("!! (sub) response:", response);
    const data = await response.json();
    console.log("!! (sub) data:", data);
    if (data.error) {
      console.log("!! (sub) data error", data.error);
      // setErrors({ name: data.error });
      setSubmitting(false);
      setIsProcessing(false);
      return;
    }
    resetForm();
    toast.success("Payment Successful");
    handleClose();
  } catch (err) {
    console.log("!(sub) bottom error", err);
    // setErrors({ name: "Something went wrong." });
  }

  setSubmitting(false);
  setIsProcessing(false);
};
