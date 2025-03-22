import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { getIdToken, onIdTokenChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { UserAuthState } from "../utils/auth-utils";
import { callFunction } from "../api";

interface RentalHistoryEntry {
  rentalDate: {
    _seconds: number;
    _nanoseconds?: number;
  };
}

interface PurchaseHistoryEntry {
  purchaseDate: {
    _seconds: number;
    _nanoseconds?: number;
  };
}

export interface UserData {
  isPurchased?: boolean;
  isRented?: boolean;
  purchaseHistory?: PurchaseHistoryEntry[];
  rentalHistory?: RentalHistoryEntry[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userData: UserData | null;
  authState: UserAuthState;
  refetchUserData: (user: User) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
