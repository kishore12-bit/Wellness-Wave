import React, { useEffect } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { syncUserWithFirebase } from "../services/userService";

/**
 * Component that handles synchronization between Clerk and Firebase
 * This can be used in sign-in/sign-up flows or anywhere you need to ensure
 * the user is synchronized with Firebase
 */
export const ClerkFirebaseSync = ({ onSyncComplete, showLoading = true }) => {
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    const syncUser = async () => {
      console.log("ClerkFirebaseSync: Starting sync process");
      console.log("Auth loaded:", isAuthLoaded);
      console.log("User signed in:", isSignedIn);
      console.log("User loaded:", isUserLoaded);
      console.log("User exists:", !!user);
      console.log("User ID:", user?.id);

      // Only proceed if auth is loaded and user is signed in
      if (!isAuthLoaded || !isSignedIn || !isUserLoaded || !user) {
        console.log("ClerkFirebaseSync: Conditions not met for sync");
        return;
      }

      setIsSyncing(true);
      setError(null);

      try {
        console.log("ClerkFirebaseSync: Attempting to sync with Firebase");
        // Sync the user with Firebase
        await syncUserWithFirebase(user);
        console.log("ClerkFirebaseSync: Sync successful");

        // Call the callback if provided
        if (onSyncComplete) {
          onSyncComplete();
        }
      } catch (err) {
        console.error(
          "ClerkFirebaseSync: Error syncing user with Firebase:",
          err
        );
        setError(err.message || "Failed to sync user with Firebase");
      } finally {
        setIsSyncing(false);
      }
    };

    syncUser();
  }, [isAuthLoaded, isSignedIn, isUserLoaded, user, onSyncComplete]);

  // If we don't want to show loading, just return null
  if (!showLoading) {
    return null;
  }

  // Show loading indicator while syncing
  if (isSyncing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFD93D" />
        <Text style={styles.text}>Syncing your account...</Text>
      </View>
    );
  }

  // Show error if there was one
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Nothing to show if not syncing and no error
  return null;
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
});
