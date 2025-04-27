import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useFirebaseUserContext } from "../contexts/FirebaseUserContext";

/**
 * Component that displays user data from Firebase
 * This is an example of how to use the Firebase user data in your components
 */
export const UserProfileData = () => {
  const { firebaseUser, isLoading, error, refreshUser } =
    useFirebaseUserContext();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#FFD93D" />
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Error: {error.message || "Failed to load user data"}
        </Text>
      </View>
    );
  }

  if (!firebaseUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No user data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>

      <View style={styles.dataRow}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{firebaseUser.fullName || "Not set"}</Text>
      </View>

      <View style={styles.dataRow}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{firebaseUser.email || "Not set"}</Text>
      </View>

      <View style={styles.dataRow}>
        <Text style={styles.label}>User ID:</Text>
        <Text style={styles.value}>{firebaseUser.id || "Not set"}</Text>
      </View>

      <View style={styles.dataRow}>
        <Text style={styles.label}>Created:</Text>
        <Text style={styles.value}>
          {firebaseUser.createdAt
            ? new Date(firebaseUser.createdAt.seconds * 1000).toLocaleString()
            : "Not available"}
        </Text>
      </View>
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
    marginBottom: 12,
    color: "#2D1B69",
  },
  dataRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    fontWeight: "bold",
    width: 80,
    color: "#555",
  },
  value: {
    flex: 1,
    color: "#333",
  },
  loadingText: {
    marginTop: 8,
    color: "#666",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
  text: {
    color: "#666",
    textAlign: "center",
  },
});
