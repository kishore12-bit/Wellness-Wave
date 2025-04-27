import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-expo";
import {
  syncUserWithFirebase,
  getUserByClerkId,
  updateUserMetadata,
} from "../services/userService";

/**
 * Custom hook to handle Firebase user synchronization with Clerk
 * @returns {Object} - Firebase user data and utility functions
 */
export const useFirebaseUser = () => {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync user when Clerk user changes
  useEffect(() => {
    const syncUser = async () => {
      if (!isClerkLoaded || !clerkUser) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Check if user already exists in Firebase
        let fbUser = await getUserByClerkId(clerkUser.id);

        // If not, or if we want to ensure data is up-to-date, sync the user
        if (!fbUser) {
          fbUser = await syncUserWithFirebase(clerkUser);
        }

        setFirebaseUser(fbUser);
      } catch (err) {
        console.error("Error in useFirebaseUser hook:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    syncUser();
  }, [clerkUser, isClerkLoaded]);

  /**
   * Force a sync of the current user with Firebase
   * @returns {Promise<Object>} - The updated Firebase user
   */
  const refreshUser = async () => {
    if (!clerkUser) return null;

    setIsLoading(true);
    setError(null);

    try {
      const fbUser = await syncUserWithFirebase(clerkUser);
      setFirebaseUser(fbUser);
      return fbUser;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update user metadata in Firebase
   * @param {Object} metadata - The metadata to update
   * @returns {Promise<void>}
   */
  const updateMetadata = async (metadata) => {
    if (!clerkUser) return;

    try {
      await updateUserMetadata(clerkUser.id, metadata);
      // Refresh the user to get the updated data
      await refreshUser();
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  return {
    firebaseUser,
    isLoading,
    error,
    refreshUser,
    updateMetadata,
  };
};
