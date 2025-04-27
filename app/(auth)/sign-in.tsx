import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import React, { useState, Suspense } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ClerkFirebaseSync = React.lazy(() =>
  import("../../components/ClerkFirebaseSync").then((module) => ({
    default: module.ClerkFirebaseSync,
  }))
);

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSignedIn, setIsSignedIn] = React.useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Handle the submission of the sign-in form
  const onSignInPress = React.useCallback(async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        setIsSignedIn(true);
      } else {
        Alert.alert(
          "Sign In Error",
          "Unable to sign in. Please check your credentials and try again.",
          [{ text: "OK" }]
        );
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.message || "An error occurred. Please try again.";
      Alert.alert("Sign In Error", errorMessage);
    }
  }, [isLoaded, emailAddress, password]);

  // Handle Firebase sync completion
  const handleSyncComplete = () => {
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.container}>
      {isSignedIn && (
        <Suspense fallback={null}>
          <ClerkFirebaseSync
            onSyncComplete={handleSyncComplete}
            showLoading={true}
          />
        </Suspense>
      )}
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue your journey</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Enter email"
            placeholderTextColor="#9B9B9B"
            onChangeText={setEmailAddress}
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={password}
              placeholder="Enter password"
              placeholderTextColor="#9B9B9B"
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={toggleShowPassword}
              style={styles.eyeIcon}
            >
              <MaterialCommunityIcons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="#FFD93D"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={() => router.push("/forgot-password")}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={onSignInPress}>
            <Text style={styles.buttonText}>SIGN IN</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/sign-up")}>
              <Text style={styles.linkText}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2D1B69",
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    justifyContent: "center",
    paddingBottom: 100, // Add some bottom padding to center the content better
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.8,
    marginBottom: 40,
  },
  form: {
    width: "100%",
    gap: 15,
    paddingHorizontal: 10, // Add some horizontal padding
  },
  input: {
    backgroundColor: "#4A148C",
    padding: 15,
    borderRadius: 30,
    color: "#FFFFFF",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#FFD93D",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D1B69",
    letterSpacing: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 5,
  },
  footerText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  linkText: {
    color: "#FFD93D",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginTop: -5,
    marginBottom: 10,
  },
  forgotPasswordText: {
    color: "#FFD93D",
    fontSize: 14,
    fontWeight: "500",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    padding: 10,
  },
});
