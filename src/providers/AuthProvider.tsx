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
import { AuthContext } from "./useAuth";
import { QueryNames, QueryType } from "../utils/consts";

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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  // TODO: type
  const [userData, setUserData] = useState<any | null>(null);
  console.log("!!userData", userData);
  const [authState, setAuthState] = useState<UserAuthState>(
    UserAuthState.NOT_SIGNED_IN
  );
  const [loading, setLoading] = useState(true);

  // Fetch User Data from Firestore
  // const fetchUserData = async (firebaseUser: User) => {
  //   console.log("!firebaseUser", firebaseUser);
  //   try {
  //     const data = await callFunction<{
  //       isRented: boolean;
  //       isPurchased: boolean;
  //       rentalHistory: any[];
  //       purchaseHistory: any[];
  //       error?: string;
  //     }>(QueryNames.getUserData, QueryType.GET, { uid: firebaseUser.uid });

  //     // const data = await data
  //     console.log("!!FE data TEWST", data);
  //     if (data.error) {
  //       console.error("Failed to fetch user data:", data.error);
  //       setUserData(null);
  //     } else {
  //       setUserData(data);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching user data:", error);
  //     setUserData(null);
  //   }
  // };
  const fetchUserData = async (firebaseUser: User) => {
    console.log("!firebaseUser", firebaseUser);
    try {
      const response = await fetch(
        `https://us-central1-woyane-36a2f.cloudfunctions.net/getUserData?uid=${firebaseUser.uid}`
      );

      if (!response.ok) {
        console.error("Failed to fetch user data:", response.statusText);
        setUserData(null);
        return;
      }

      const data = await response.json();
      console.log("!!FE data TEWST", data);

      if (data.error) {
        console.error("Failed to fetch user data:", data.error);
        setUserData(null);
      } else {
        setUserData(data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData(null);
    }
  };

  // Listen for Auth Changes & Set `authState`
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setAuthState(UserAuthState.NOT_SIGNED_IN);
        setUserData(null);
      } else if (!firebaseUser.emailVerified) {
        setAuthState(UserAuthState.SIGNED_IN_NOT_VERIFIED);
      } else {
        setAuthState(UserAuthState.VERIFIED);
      }

      if (firebaseUser) {
        await fetchUserData(firebaseUser);
      }

      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // Function to Manually Refresh User Data
  const refetchUserData = async (user: User) => {
    console.log("!!! ~~ Call refetchUserData");
    if (user) {
      await fetchUserData(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, userData, authState, refetchUserData }}>
      {children}
    </AuthContext.Provider>
  );
};
