import React, { useState, useEffect, Suspense } from "react";
import { SignedOut, useUser } from "@clerk/clerk-expo";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from "react-native";
import LottieView from "lottie-react-native";
import FeatureShowcase from "../../components/landing/FeatureShowcase";
import { useRouter } from "expo-router";

// Lazy load the sign-in and sign-up components
const SignIn = React.lazy(() => import("../(auth)/sign-in"));
const SignUp = React.lazy(() => import("../(auth)/sign-up"));
const router = useRouter();

export default function Page() {
  const { user } = useUser();
  const [showAuth, setShowAuth] = useState(false);
  const [authScreen, setAuthScreen] = useState(null); // "signin" or "signup"
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (user) {
      // If signed in, navigate to tabs
      router.replace("/(tabs)");
    }
  }, [user]);

  const handleGetStarted = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowAuth(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleAuthPress = (screen) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setAuthScreen(screen); // "signin" or "signup"
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <SignedOut>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {!showAuth ? (
            <FeatureShowcase onGetStarted={handleGetStarted} />
          ) : authScreen === null ? (
            <View style={styles.authContent}>
              <LottieView
                source={require("../../assets/animation/homepage_animation.json")}
                autoPlay
                loop
                style={styles.animation}
              />

              <Text style={styles.title}>Welcome to{"\n"}Wellness Wave</Text>
              <Text style={styles.subtitle}>
                Your journey to mindfulness begins here
              </Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleAuthPress("signin")}
                >
                  <Text style={styles.buttonText}>SIGN IN</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleAuthPress("signup")}
                >
                  <Text style={styles.buttonText}>SIGN UP</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Suspense fallback={<Text style={styles.loading}>Loading...</Text>}>
              {authScreen === "signin" ? <SignIn /> : <SignUp />}
            </Suspense>
          )}
        </Animated.View>
      </SignedOut>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2D1B69",
  },
  content: {
    flex: 1,
  },
  authContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  animation: {
    width: 300,
    height: 300,
    marginBottom: 30,
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
  buttonContainer: {
    width: "100%",
    gap: 15,
  },
  button: {
    width: "100%",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    backgroundColor: "#FFD93D",
    opacity: 1,
    elevation: 3,
    shadowColor: "#FFD93D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D1B69",
    letterSpacing: 1,
  },
  loading: {
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
    marginTop: 50,
  },
});
