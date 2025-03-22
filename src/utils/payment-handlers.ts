import { CardElement } from "@stripe/react-stripe-js";
import { Stripe, StripeCardElement, StripeElements } from "@stripe/stripe-js";
import { FormikHelpers } from "formik";
import { toast } from "react-toastify";
import { PurchaseType } from "./auth-utils";
import { callFunction } from "../api";
import { QueryNames, QueryType } from "./consts";

export interface CheckoutFormValues {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  currency: string;
}

export const handlePaymentSubmit = async (
  values: CheckoutFormValues,
  formikHelpers: FormikHelpers<CheckoutFormValues>,
  stripe: Stripe | null,
  elements: StripeElements | null,
  setIsProcessing: (processing: boolean) => void,
  handleClose: () => void,
  userId: string | undefined,
  purchaseType: PurchaseType,
  handleRefetchUserData: () => void
) => {
  const { setSubmitting, resetForm } = formikHelpers;
  setIsProcessing(true);

  if (!stripe || !elements) {
    console.error("Stripe or Elements missing");
    return finalizePayment(setSubmitting, setIsProcessing, false);
  }

  const cardElement = elements.getElement(CardElement);
  if (!cardElement) {
    console.error("CardElement not found");
    return finalizePayment(setSubmitting, setIsProcessing, false);
  }

  try {
    // Step 1: Create Payment Method
    const paymentMethod = await createPaymentMethod(
      stripe,
      cardElement,
      values
    );
    if (!paymentMethod)
      return finalizePayment(setSubmitting, setIsProcessing, false);

    // Step 2: Create Payment Intent
    const clientSecret = await createPaymentIntent(
      paymentMethod.id,
      values,
      userId,
      purchaseType
    );
    if (!clientSecret)
      return finalizePayment(setSubmitting, setIsProcessing, false);

    // Step 3: Confirm Payment
    const paymentSucceeded = await confirmPayment(
      stripe,
      clientSecret,
      cardElement
    );
    if (!paymentSucceeded)
      return finalizePayment(setSubmitting, setIsProcessing, false);

    // Step 4: Update User Purchase in DB
    const userUpdated = await updateUserDetailsAfterPurchase(
      userId,
      purchaseType
    );
    if (!userUpdated)
      return finalizePayment(setSubmitting, setIsProcessing, false);

    // Step 5: Finalize UI Updates
    finalizePayment(setSubmitting, setIsProcessing, true);
    handleRefetchUserData();
    resetForm();
    toast.success("Payment Successful");
    handleClose();
  } catch (err) {
    console.error("Payment error:", err);
    finalizePayment(setSubmitting, setIsProcessing, false);
  }
};

/** Step 1: Create Payment Method */
const createPaymentMethod = async (
  stripe: Stripe,
  cardElement: StripeCardElement,
  values: CheckoutFormValues
) => {
  try {
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: {
        name: `${values.firstName} ${values.lastName}`,
        address: { line1: values.address, country: values.country },
      },
    });

    if (error) {
      console.error("Error creating PaymentMethod:", error);
      return null;
    }

    console.log("PaymentMethod created:", paymentMethod);
    return paymentMethod;
  } catch (error) {
    console.error("Unexpected error in createPaymentMethod:", error);
    return null;
  }
};

/** Step 2: Call Backend to Create Payment Intent */
const createPaymentIntent = async (
  paymentMethodId: string,
  values: CheckoutFormValues,
  userId: string | undefined,
  purchaseType: PurchaseType
) => {
  try {
    const data = await callFunction<{ clientSecret: string; error?: string }>(
      QueryNames.createPaymentIntent,
      QueryType.POST,
      {
        paymentMethodId,
        currency: values.currency,
        userId,
        isRented: purchaseType === PurchaseType.RENT,
      }
    );

    if (data.error) {
      console.error("Backend PaymentIntent error:", data.error);
      return null;
    }

    console.log("Payment Intent created:", data.clientSecret);
    return data.clientSecret;
  } catch (error) {
    console.error("Error creating PaymentIntent:", error);
    return null;
  }
};

/** Step 3: Confirm Payment on Frontend */
const confirmPayment = async (
  stripe: Stripe,
  clientSecret: string,
  cardElement: StripeCardElement
) => {
  try {
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      { payment_method: { card: cardElement } }
    );

    if (error) {
      console.error("Payment confirmation failed:", error);
      return false;
    }

    console.log("Payment confirmed:", paymentIntent.status);
    return paymentIntent.status === "succeeded";
  } catch (error) {
    console.error("Error confirming payment:", error);
    return false;
  }
};

/** Step 4: Call Backend to Update User details after Purchase */
const updateUserDetailsAfterPurchase = async (
  userId: string | undefined,
  purchaseType: PurchaseType
) => {
  try {
    const updateResponse = await callFunction<{
      success?: boolean;
      error?: string;
    }>(QueryNames.updateUserDetailsAfterPurchase, QueryType.POST, {
      userId,
      isRented: purchaseType === PurchaseType.RENT,
    });

    if (!updateResponse?.success) {
      console.error("Failed to update user purchase:", updateResponse?.error);
      toast.error("Failed to update purchase details. Please contact support.");
      return false;
    }

    console.log("User purchase successfully updated!");
    return true;
  } catch (error) {
    console.error("Error updating user purchase:", error);
    return false;
  }
};

/** Step 5: Finalize Payment (Reset UI) */
const finalizePayment = (
  setSubmitting: (submitting: boolean) => void,
  setIsProcessing: (processing: boolean) => void,
  success: boolean
) => {
  setSubmitting(false);
  setIsProcessing(false);
  if (!success) {
    toast.error("Payment failed. Please try again.");
  }
};
