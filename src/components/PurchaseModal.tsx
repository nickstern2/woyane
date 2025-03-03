import React, { useState } from "react";
import { FormikConfig } from "formik";
import { PurchaseModalValidationSchema } from "../utils/validations";
import {
  getIsBillingSectionExpanded,
  getTooltipMessage,
  PurchaseType,
  UserAuthState,
} from "../utils/auth-utils";
import { User } from "firebase/auth";
import RegisterOrLoginForm from "../forms/RegisterOrLoginForm/RegisterOrLoginForm";
import { LoginFormInitialValuesType } from "../utils/types";
import ReusableModal from "./ReusableModal";
import { LoginFormInitialValues } from "../utils/consts";
import { handleLoginRegisterFormSubmit } from "../forms/RegisterOrLoginForm/registe-or-login-utils";

import { StripeCheckoutWrapper } from "./StripeCheckoutForm";

interface PurchaseModalProps {
  open: boolean;
  loginErrors: boolean;
  user: User | null;
  handleClose: (reason?: "backdropClick" | "escapeKeyDown") => void;
  handlePurchase: (type: "rent" | "buy") => void;
  refetchUserData: (user: User) => Promise<void>;
  setLoginErrors: React.Dispatch<React.SetStateAction<boolean>>;
  authState: UserAuthState;
  purchaseType: PurchaseType | null;
  isAccordion: boolean;
}

const handleAccordionToggle = (
  setter: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setter((prev) => !prev);
};

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  open,
  authState,
  isAccordion,
  user,
  purchaseType,
  loginErrors,
  setLoginErrors,
  refetchUserData,
  handleClose,
  handlePurchase,
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isSignUpSectionExpanded, setIsSignUpSectionExpanded] = useState(true);
  const isBillingSectionExpanded = getIsBillingSectionExpanded(authState);

  console.log("!!isBillingSectionExpanded", isBillingSectionExpanded);

  const tooltipDisabledMessage = getTooltipMessage(authState);
  const purchaseActionText =
    purchaseType === PurchaseType.PURCHASE ? "Purchase" : "Rent";

  console.log("!clientSecret", clientSecret);

  // const [pollingStarted, setPollingStarted] = useState(false); // State to control polling
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null); // Track interval for cleanup

  //
  // Find a way to pass onsubmit
  const loginFormUseFormikValues: FormikConfig<LoginFormInitialValuesType> = {
    initialValues: LoginFormInitialValues,
    validationSchema: PurchaseModalValidationSchema,
    onSubmit: async (values, formikHelpers) => {
      await handleLoginRegisterFormSubmit(
        values,
        formikHelpers,
        setLoginErrors
      );
    },
  };

  const onSubmit = (formikOnSubmit: () => void) => {
    formikOnSubmit();
  };

  return (
    <ReusableModal
      isAccordion={isAccordion}
      loginErrors={loginErrors}
      title={`${purchaseActionText} Woyane`}
      open={open}
      handleClose={handleClose}
      // customOnSubmit={() => }//todo: stripe onsubmit
      tooltipDisabledMessage={tooltipDisabledMessage}
      authState={authState}
      confirmationSuccessTitle={purchaseActionText}>
      <>
        <RegisterOrLoginForm
          formId='woyane-ud'
          isAccordion
          authState={authState}
          formikInitializerValues={loginFormUseFormikValues}
          expanded={isSignUpSectionExpanded}
          onToggle={() => handleAccordionToggle(setIsSignUpSectionExpanded)}
        />

        <StripeCheckoutWrapper
          amount={1000}
          authState={authState}
          clientSecret={clientSecret}
          setClientSecret={setClientSecret}
          // handleAccordionToggle={handleAccordionToggle}
          isExpanded={isBillingSectionExpanded}
        />
      </>
    </ReusableModal>
  );
};

export default PurchaseModal;
