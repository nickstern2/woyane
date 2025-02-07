import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
} from "firebase/auth";
import { auth } from "../firebase";
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
