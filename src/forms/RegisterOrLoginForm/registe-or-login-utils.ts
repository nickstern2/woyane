import { sendEmailVerification } from "firebase/auth";
import { signUp, signIn } from "../../utils/auth-utils";
import { toast } from "react-toastify";

export const handleLoginRegisterFormSubmit = async (
  values: { email: string; password: string },
  { setSubmitting }: any,
  setLoginErrors: React.Dispatch<React.SetStateAction<boolean>>,
  handleClose?: () => void
) => {
  console.log("!!Submit", values);
  setSubmitting(true);
  setLoginErrors(false);
  try {
    // Attempt to sign up
    const userCredential = await signUp(values.email, values.password);
    const user = userCredential.user;

    // Send verification email
    await sendEmailVerification(user);
    // console.log("!*Call startPollingForEmailVerification");
    // startPollingForEmailVerification(user);

    // TODO: Toast notification
    toast.success("Verification email sent! 📩 Check your inbox.");
    handleClose && handleClose();
    console.log("Verification email sent to", values.email);
  } catch (error: any) {
    console.error("Error signing up:", error?.message);

    // If email is already in use, try signing in instead
    if (error.code === "auth/email-already-in-use") {
      console.log("User already exists. Attempting to sign in...");
      try {
        console.log("!Attempting to sign in");
        const signInCredential = await signIn(values.email, values.password);
        toast.success("Welcome back! Successfully signed in.");
        handleClose && handleClose();
        console.log("Successfully signed in:", signInCredential.user);
      } catch (signInError: any) {
        setLoginErrors(true);
        toast.error(
          "Failed to sign in. You have entered an invalid username or password."
        );
      }
    } else {
      toast.error("Something went wrong! Try again.");
    }
  } finally {
    setSubmitting(false);
  }
};
