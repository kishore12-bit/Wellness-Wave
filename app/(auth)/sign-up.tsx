import * as React from "react";
import { Suspense } from "react";
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ClerkFirebaseSync = React.lazy(() =>
  import("../../components/ClerkFirebaseSync").then((module) => ({
    default: module.ClerkFirebaseSync,
  }))
);

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [isSignedIn, setIsSignedIn] = React.useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validatePassword = () => {
    if (password.length < 8) {
      Alert.alert(
        "Invalid Password",
        "Password must be at least 8 characters long"
      );
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert(
        "Password Mismatch",
        "Password and confirm password do not match"
      );
      return false;
    }
    return true;
  };

  const onSignUpPress = async () => {
    if (!isLoaded || !signUp) return;

    if (!emailAddress) {
      Alert.alert("Missing Information", "Please enter your email address");
      return;
    }

    if (!validatePassword()) {
      return;
    }

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.message ||
        "An error occurred during sign up. Please try again.";

      Alert.alert("Sign Up Error", errorMessage, [{ text: "OK" }]);
      console.error("Error during sign up:", err);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded || !signUp) return;

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        setIsSignedIn(true);
      } else {
        Alert.alert(
          "Verification Error",
          "Unable to verify email. Please check the code and try again.",
          [{ text: "OK" }]
        );
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.message ||
        "An error occurred during verification. Please try again.";

      Alert.alert("Verification Error", errorMessage, [{ text: "OK" }]);
      console.error("Error during verification:", JSON.stringify(err, null, 2));
    }
  };

  // Handle Firebase sync completion
  const handleSyncComplete = async () => {
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
        {pendingVerification ? (
          <>
            <Text style={styles.title}>Verify your email</Text>
            <Text style={styles.subtitle}>
              Check your email for the verification code
            </Text>
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                value={code}
                placeholder="Enter verification code"
                placeholderTextColor="#9B9B9B"
                onChangeText={setCode}
              />
              <TouchableOpacity style={styles.button} onPress={onVerifyPress}>
                <Text style={styles.buttonText}>VERIFY</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Start your wellness journey today
            </Text>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                autoCapitalize="none"
                value={emailAddress}
                placeholder="Email Address"
                placeholderTextColor="#9B9B9B"
                onChangeText={setEmailAddress}
                keyboardType="email-address"
              />
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  placeholder="Create Password"
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
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={confirmPassword}
                  placeholder="Confirm Password"
                  placeholderTextColor="#9B9B9B"
                  secureTextEntry={!showConfirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  onPress={toggleShowConfirmPassword}
                  style={styles.eyeIcon}
                >
                  <MaterialCommunityIcons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={24}
                    color="#FFD93D"
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.passwordHint}>
                Password must be at least 8 characters long
              </Text>
              <TouchableOpacity style={styles.button} onPress={onSignUpPress}>
                <Text style={styles.buttonText}>SIGN UP</Text>
              </TouchableOpacity>
              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <TouchableOpacity onPress={() => router.push("/sign-in")}>
                  <Text style={styles.linkText}>Sign in</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
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
  passwordHint: {
    color: "#FFD93D",
    fontSize: 12,
    marginTop: -10,
    marginLeft: 15,
    opacity: 0.8,
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
