import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
} from "firebase/auth";
import { auth } from "../firebase";
import { UserData } from "../providers/useAuth";
import { toast } from "react-toastify";
// Function to check if user is authenticated
export const checkAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user); // Calls back with user object or null
  });
};

// Sign Up a new user
export const signUp = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

// Sign In existing user
export const signIn = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// Log Out user
export const logOut = async (): Promise<void> => {
  return await signOut(auth);
};

export const resendEmailVerification = async (): Promise<void> => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      console.log("!!Resent email verification:");
      await sendEmailVerification(currentUser);
      toast.success("Verification email sent! Check your inbox.");
    } catch (error) {
      toast.error("Error sending email verification. Please try again.");
      console.error("!Error sending email verification:", error);
    }
  }
};

export const forgotPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("!!Password reset email sent successfully to:", email);
  } catch (error) {
    console.error("!Error sending password reset email:", error);
  }
};

export enum UserAuthState {
  NOT_SIGNED_IN = "NOT_SIGNED_IN",
  SIGNED_IN_NOT_VERIFIED = "SIGNED_IN_NOT_VERIFIED",
  VERIFIED = "VERIFIED",
}

export enum AuthStateDisabledMessage {
  NOT_SIGNED_IN = "Please sign in to continue",
  SIGNED_IN_NOT_VERIFIED = "Please verify your email to continue",
  VERIFIED = "",
}

export enum PurchaseType {
  PURCHASE = "PURCHASE",
  RENT = "RENT",
}

export const getTooltipMessage = (authState: UserAuthState) => {
  let message = "";
  switch (authState) {
    case UserAuthState.NOT_SIGNED_IN:
      message = AuthStateDisabledMessage.NOT_SIGNED_IN;
      break;

    case UserAuthState.SIGNED_IN_NOT_VERIFIED:
      message = AuthStateDisabledMessage.SIGNED_IN_NOT_VERIFIED;
      break;

    default:
      message = "";
      break;
  }
  return message;
};

export const getIsBillingSectionExpanded = (authState: UserAuthState) => {
  let isExpanded = false;

  switch (authState) {
    case UserAuthState.NOT_SIGNED_IN:
      isExpanded = false;
      break;
    case UserAuthState.SIGNED_IN_NOT_VERIFIED:
      isExpanded = false;
      break;
    case UserAuthState.VERIFIED:
      isExpanded = true;
      break;
    default:
      isExpanded = false;
      break;
  }
  return isExpanded;
};

export const canUserWatchFilm = (userData: UserData | null): boolean => {
  if (!userData) return false;

  // Check if user has purchased
  if (userData.isPurchased && (userData.purchaseHistory?.length ?? 0) > 0) {
    return true;
  }

  // Check if user has an active rental
  const rentalHistory = userData.rentalHistory ?? [];
  if (userData.isRented && rentalHistory.length > 0) {
    const latestRental = rentalHistory[rentalHistory.length - 1];

    if (!latestRental.rentalDate?._seconds) return false;

    // TODO: What number do we want
    const RENTAL_DURATION_DAYS = 3; // Days until expiration
    const rentalDate = new Date(latestRental.rentalDate._seconds * 1000);
    const expirationDate = new Date(rentalDate);
    // TODO: Do without mutating. Test if i make this a var if it has same value as expirationDate. In other words does this still update expirationDate or will it be localized to variable
    expirationDate.setDate(expirationDate.getDate() + RENTAL_DURATION_DAYS);

    // const expirationDate = new Date(rentalDate.getTime() + RENTAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

    return new Date() <= expirationDate;
  }

  return false;
};
