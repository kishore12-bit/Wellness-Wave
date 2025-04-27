import React, { createContext, useContext } from "react";
import { useFirebaseUser } from "../hooks/useFirebaseUser";

// Create the context
const FirebaseUserContext = createContext(null);

/**
 * Provider component for Firebase user data
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Provider component
 */
export const FirebaseUserProvider = ({ children }) => {
  const firebaseUserData = useFirebaseUser();

  return (
    <FirebaseUserContext.Provider value={firebaseUserData}>
      {children}
    </FirebaseUserContext.Provider>
  );
};

/**
 * Hook to use the Firebase user context
 * @returns {Object} - Firebase user data and utility functions
 */
export const useFirebaseUserContext = () => {
  const context = useContext(FirebaseUserContext);

  if (context === null) {
    throw new Error(
      "useFirebaseUserContext must be used within a FirebaseUserProvider"
    );
  }

  return context;
};
