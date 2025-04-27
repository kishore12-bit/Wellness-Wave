import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ForgotPassword() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"email" | "reset">("email");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendResetCode = async () => {
    if (!isLoaded || !emailAddress) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: emailAddress,
      });
      setStep("reset");
      Alert.alert(
        "Success",
        "Reset code has been sent to your email. Please check your inbox and spam folder."
      );
    } catch (err: any) {
      console.error("Error sending reset code:", err);
      const errorMessage =
        err.errors?.[0]?.message ||
        "Failed to send reset code. Please check your email and try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetCode || !newPassword || !confirmPassword) {
      Alert.alert(
        "Missing Information",
        "Please fill in all fields to reset your password."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Password Mismatch",
        "The passwords you entered don't match. Please try again."
      );
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert(
        "Invalid Password",
        "Password must be at least 8 characters long. Please choose a stronger password."
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: resetCode,
        password: newPassword,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        Alert.alert("Success", "Your password has been reset successfully!", [
          { text: "OK", onPress: () => router.replace("/sign-in") },
        ]);
      } else {
        Alert.alert(
          "Error",
          "Unable to reset password. Please check your reset code and try again."
        );
      }
    } catch (err: any) {
      console.error("Error resetting password:", err);
      const errorMessage =
        err.errors?.[0]?.message ||
        "Failed to reset password. Please make sure your reset code is correct and try again.";

      if (errorMessage.includes("data breach")) {
        Alert.alert(
          "Password Security Alert",
          "This password has been found in a data breach. Please choose a different, secure password to protect your account.",
          [{ text: "OK" }]
        );
      } else if (errorMessage.includes("expired")) {
        Alert.alert(
          "Code Expired",
          "Your reset code has expired. Please request a new code.",
          [
            { text: "Cancel" },
            {
              text: "Request New Code",
              onPress: () => {
                setStep("email");
                setResetCode("");
                setNewPassword("");
                setConfirmPassword("");
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFD93D" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          {step === "email"
            ? "Enter your email to receive a reset code"
            : "Enter the code from your email and your new password"}
        </Text>

        <View style={styles.form}>
          {step === "email" ? (
            <>
              <TextInput
                style={styles.input}
                autoCapitalize="none"
                value={emailAddress}
                placeholder="Enter email"
                placeholderTextColor="#9B9B9B"
                onChangeText={setEmailAddress}
                keyboardType="email-address"
              />

              <TouchableOpacity
                style={styles.button}
                onPress={handleSendResetCode}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? "SENDING..." : "SEND RESET CODE"}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                value={resetCode}
                placeholder="Enter reset code"
                placeholderTextColor="#9B9B9B"
                onChangeText={setResetCode}
                keyboardType="number-pad"
              />

              <TextInput
                style={styles.input}
                value={newPassword}
                placeholder="Enter new password"
                placeholderTextColor="#9B9B9B"
                secureTextEntry={true}
                onChangeText={setNewPassword}
              />

              <TextInput
                style={styles.input}
                value={confirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#9B9B9B"
                secureTextEntry={true}
                onChangeText={setConfirmPassword}
              />

              <TouchableOpacity
                style={styles.button}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? "RESETTING..." : "RESET PASSWORD"}
                </Text>
              </TouchableOpacity>
            </>
          )}
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
    paddingBottom: 100,
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
    paddingHorizontal: 10,
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
});
