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

// Define Enum for User Authentication State
export enum UserAuthState {
  NOT_SIGNED_IN = "NOT_SIGNED_IN",
  SIGNED_IN_NOT_VERIFIED = "SIGNED_IN_NOT_VERIFIED",
  VERIFIED = "VERIFIED",
}

// Define Context Interface
interface AuthContextType {
  user: User | null;
  loading: boolean;
  userData: any | null;
  authState: UserAuthState; // New state for managing authentication
  refetchUserData: (user: User) => Promise<void>;
}

// Create AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom Hook to Access Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// AuthProvider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [authState, setAuthState] = useState<UserAuthState>(
    UserAuthState.NOT_SIGNED_IN
  ); // New state
  const [loading, setLoading] = useState(true);

  // Fetch User Data from Firestore
  const fetchUserData = async (firebaseUser: User) => {
    const token = await getIdToken(firebaseUser, true);
    console.log("!User Token:", token);

    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      setUserData(userSnap.data());
    } else {
      setUserData(null);
    }
  };

  // Listen for Auth Changes & Set `authState`
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      console.log("!!Auth Change Detected:", firebaseUser);
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

// import React, {
//   useEffect,
//   useState,
//   createContext,
//   useContext,
//   ReactNode,
// } from "react";

// import {
//   getIdToken,
//   onAuthStateChanged,
//   onIdTokenChanged,
//   User,
// } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";
// import { auth, db } from "../firebase";

// interface AuthContextType {
//   user: User | null;
//   loading: boolean;
//   userData: any | null; // Holds Firestore user data like rental history
//   refetchUserData: (user: User) => Promise<void>;
// }

// // Create the AuthContext with a default value
// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // Custom Hook to Access Auth Context
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// // AuthProvider Component (Wraps App)
// export const AuthProvider: React.FC<{ children: ReactNode }> = ({
//   children,
// }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [userData, setUserData] = useState<any | null>(null); // Store Firestore user data
//   const [loading, setLoading] = useState(true);

//   // Function to fetch user data from Firestore
//   const fetchUserData = async (firebaseUser: User) => {
//     const test = await getIdToken(firebaseUser, true);

//     if (test) {
//       console.log("!test data from getIdToken", test);
//     } else {
//       console.log("!No test data");
//     }
//     const userDocRef = doc(db, "users", firebaseUser.uid);
//     const userSnap = await getDoc(userDocRef);
//     console.log(
//       "!!userSnap(on refrsh)",
//       userSnap.id,
//       userSnap.metadata,
//       userSnap.exists(),
//       userSnap?.data()
//     );
//     if (userSnap.exists()) {
//       setUserData(userSnap.data()); // Store Firestore user data
//     } else {
//       setUserData(null); // User document doesn't exist
//     }
//   };

//   useEffect(() => {
//     const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
//       console.log("!!unsubscribe", firebaseUser);
//       setUser(firebaseUser);
//       if (firebaseUser) {
//         // Fetch additional user data from Firestore
//         const userDocRef = doc(db, "users", firebaseUser.uid);
//         const userSnap = await getDoc(userDocRef);
//         if (userSnap.exists()) {
//           setUserData(userSnap.data()); // Store Firestore user data
//         } else {
//           setUserData(null);
//         }
//       } else {
//         setUserData(null);
//       }
//       setLoading(false);
//     });

//     return () => unsubscribe(); // Cleanup listener on unmount
//   }, []);

//   const refetchUserData = async (user: User) => {
//     if (user) {
//       await fetchUserData(user); // Re-fetch user data if user is authenticated
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, userData, refetchUserData }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
