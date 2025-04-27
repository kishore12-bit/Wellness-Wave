import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useUser, useAuth } from "@clerk/clerk-expo";
import {
  syncUserWithFirebase,
  getUserByClerkId,
} from "../services/userService";
import { useFirebaseUserContext } from "../contexts/FirebaseUserContext";

/**
 * Component to test the Clerk-Firebase integration
 */
export const ClerkFirebaseTest = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { firebaseUser, isLoading, error, refreshUser } =
    useFirebaseUserContext();
  const [testStatus, setTestStatus] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  const runTest = async () => {
    if (!user) {
      setTestStatus("Error: No Clerk user found. Please sign in first.");
      return;
    }

    setIsTesting(true);
    setTestStatus("Running test...");

    try {
      // Step 1: Force sync the user to Firebase
      setTestStatus("Step 1: Syncing user to Firebase...");
      await syncUserWithFirebase(user);

      // Step 2: Fetch the user from Firebase
      setTestStatus("Step 2: Fetching user from Firebase...");
      const fbUser = await getUserByClerkId(user.id);

      if (!fbUser) {
        setTestStatus("Error: Failed to fetch user from Firebase after sync.");
        setIsTesting(false);
        return;
      }

      // Step 3: Verify the data matches
      setTestStatus("Step 3: Verifying user data...");
      const clerkEmail = user.emailAddresses[0]?.emailAddress || "";
      const firebaseEmail = fbUser.email || "";

      if (clerkEmail !== firebaseEmail) {
        setTestStatus(
          `Error: Email mismatch. Clerk: ${clerkEmail}, Firebase: ${firebaseEmail}`
        );
        setIsTesting(false);
        return;
      }

      // Step 4: Refresh the context
      setTestStatus("Step 4: Refreshing Firebase user context...");
      await refreshUser();

      setTestStatus(
        "✅ Test completed successfully! Clerk user is synced with Firebase."
      );
    } catch (error) {
      setTestStatus(`Error during test: ${error.message || "Unknown error"}`);
      console.error("Test error:", error);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clerk-Firebase Integration Test</Text>

      {isLoading ? (
        <ActivityIndicator size="small" color="#FFD93D" />
      ) : (
        <>
          <View style={styles.userInfo}>
            <Text style={styles.label}>Clerk User ID:</Text>
            <Text style={styles.value}>{user?.id || "Not signed in"}</Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.label}>Firebase User:</Text>
            <Text style={styles.value}>
              {firebaseUser ? "✅ Found" : "❌ Not found"}
            </Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Error: {error.message || "Unknown error"}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={runTest}
            disabled={isTesting || !user}
          >
            {isTesting ? (
              <ActivityIndicator size="small" color="#2D1B69" />
            ) : (
              <Text style={styles.buttonText}>Run Integration Test</Text>
            )}
          </TouchableOpacity>

          {testStatus ? (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>{testStatus}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, styles.signOutButton]}
            onPress={signOut}
          >
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2D1B69",
    textAlign: "center",
  },
  userInfo: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
  },
  label: {
    fontWeight: "bold",
    width: 120,
    color: "#555",
  },
  value: {
    flex: 1,
    color: "#333",
  },
  button: {
    backgroundColor: "#FFD93D",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  signOutButton: {
    backgroundColor: "#FF6B6B",
    marginTop: 8,
  },
  buttonText: {
    color: "#2D1B69",
    fontWeight: "bold",
    fontSize: 16,
  },
  statusContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#E8E8E8",
    borderRadius: 8,
  },
  statusText: {
    color: "#333",
  },
  errorContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
  },
  errorText: {
    color: "#D32F2F",
  },
});
