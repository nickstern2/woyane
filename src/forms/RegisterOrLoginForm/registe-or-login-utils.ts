import { sendEmailVerification } from "firebase/auth";
import { signUp, signIn } from "../../utils/auth-utils";
import { toast } from "react-toastify";

export const handleLoginRegisterFormSubmit = async (
  values: { email: string; password: string },
  { setSubmitting }: any, //TODO: type
  setLoginErrors: React.Dispatch<React.SetStateAction<boolean>>,
  handleClose?: () => void
) => {
  setSubmitting(true);
  setLoginErrors(false);
  try {
    const userCredential = await signUp(values.email, values.password);
    const user = userCredential.user;
    await sendEmailVerification(user);

    // startPollingForEmailVerification(user);
    toast.success("Verification email sent! Check your inbox.");
    // Close if accessing from navbar modal
    handleClose && handleClose();
  } catch (error: any) {
    console.error("Error signing up:", error?.message);

    // If email is already in use, try signing in instead
    if (error.code === "auth/email-already-in-use") {
      try {
        await signIn(values.email, values.password);
        toast.success("Welcome back! Successfully signed in.");
        // Close if accessing from navbar modal
        handleClose && handleClose();
      } catch (signInError: any) {
        setLoginErrors(true);
      }
    }
  } finally {
    setSubmitting(false);
  }
};
