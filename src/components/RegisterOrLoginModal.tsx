import React, { FC } from "react";
import ReusableModal from "./ReusableModal";
import RegisterOrLoginForm from "../forms/RegisterOrLoginForm/RegisterOrLoginForm";
import { PurchaseModalValidationSchema } from "../utils/validations";
import { LoginFormInitialValues } from "../utils/consts";
import { FormikConfig } from "formik";
import { LoginFormInitialValuesType } from "../utils/types";
import { handleLoginRegisterFormSubmit } from "../forms/RegisterOrLoginForm/registe-or-login-utils";
import { UserAuthState } from "../utils/auth-utils";

interface RegisterOrLoginModalProps {
  open: boolean;
  authState: UserAuthState;
  loginErrors: boolean;
  handleClose: (reason?: "backdropClick" | "escapeKeyDown") => void;
  setLoginErrors: React.Dispatch<React.SetStateAction<boolean>>;
}

export const RegisterOrLoginModal: FC<RegisterOrLoginModalProps> = ({
  open,
  loginErrors,
  authState,
  handleClose,
  setLoginErrors,
}) => {
  const loginFormikValues: FormikConfig<LoginFormInitialValuesType> = {
    initialValues: LoginFormInitialValues,
    validationSchema: PurchaseModalValidationSchema,
    onSubmit: async (values, formikHelpers) => {
      await handleLoginRegisterFormSubmit(
        values,
        formikHelpers,
        setLoginErrors,
        handleClose
      );
    },
  };
  return (
    <ReusableModal
      loginErrors={loginErrors}
      open={open}
      maxWidth='sm'
      hideConfirmationDialog
      hideActionButtons
      handleClose={handleClose}>
      <RegisterOrLoginForm
        authState={authState}
        formId='navbar-ud'
        formikInitializerValues={loginFormikValues}
      />
    </ReusableModal>
  );
};
