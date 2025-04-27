import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  StyleSheet,
  Platform,
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import LottieView from "lottie-react-native";
import {
  Provider as PaperProvider,
  Surface,
  Avatar,
  Portal,
  Modal,
  Button,
  Text as PaperText,
} from "react-native-paper";
import Groq from "groq-sdk";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { config } from "../../config/firebase";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Import custom components
import MoodStatistics from "../../components/home/MoodStatistics";
import MiniCalendar from "../../components/home/MiniCalendar";
import QuoteCard from "../../components/home/QuoteCard";
import { theme } from "../../components/home/Theme";
import { getGreetingTime } from "../../components/home/utils";
import { getWeeklyMoodHistory } from "../../components/mood/MoodFirebase";

const groq = new Groq({
  apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY,
});

// Initialize Firebase
const app = initializeApp(config);
const db = getFirestore(app);

async function getQuote() {
  const quotePrompt =
    "Generate a short, inspiring motivational quote. Keep it concise and impactful.";

  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: quotePrompt,
      },
    ],
    model: "llama-3.3-70b-versatile",
  });
}

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showStatistics, setShowStatistics] = useState(false);
  const [quote, setQuote] = useState(
    "The only limit to our realization of tomorrow will be our doubts of today. - Franklin D. Roosevelt"
  );
  const [weeklyMoodData, setWeeklyMoodData] = useState([]);
  const [isLoadingMoods, setIsLoadingMoods] = useState(false);
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [showProfileAlert, setShowProfileAlert] = useState(false);
  const [missingFields, setMissingFields] = useState([]);

  // Generate dates array once at component level
  const today = new Date();
  const dates = useMemo(() => {
    // Create an array of the past 7 days, with today as the last day
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      // Start from 6 days ago (i=0) to today (i=6)
      date.setDate(today.getDate() - (6 - i));
      return date;
    });
  }, [today]);

  const fetchWeeklyMoodData = useCallback(async () => {
    if (!user?.id || isLoadingMoods) return;

    try {
      setIsLoadingMoods(true);
      console.log("Fetching weekly mood data...");
      const result = await getWeeklyMoodHistory(user.id, dates);

      if (result.success) {
        setWeeklyMoodData(result.data);
        console.log("Weekly mood data fetched successfully");
      } else {
        console.error("Failed to fetch weekly mood data:", result.error);
      }
    } catch (error) {
      console.error("Error fetching weekly mood data:", error);
    } finally {
      setIsLoadingMoods(false);
    }
  }, [user?.id]);

  const fetchUserProfile = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "user_profile", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserName(data.fullName || "Wellness Seeker");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserName("Wellness Seeker");
    }
  };

  const checkProfileCompleteness = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "user_profile", userId));
      const data = userDoc.exists() ? userDoc.data() : {};

      const missing = [];
      if (!data.fullName) missing.push("name");
      if (!data.age) missing.push("age");
      if (!data.weight) missing.push("weight");
      if (!data.height) missing.push("height");

      if (missing.length > 0) {
        setMissingFields(missing);
        setShowProfileAlert(true);
      }
    } catch (error) {
      console.error("Error checking profile completeness:", error);
    }
  };

  useEffect(() => {
    if (isSignedIn && user?.id) {
      fetchUserProfile(user.id);
      fetchWeeklyMoodData();
      checkProfileCompleteness(user.id);
    }
  }, [isSignedIn, user?.id]);

  const handleDatePress = (date) => {
    if (selectedDate && date.getTime() === selectedDate.getTime()) {
      setSelectedDate(null);
      setShowStatistics(false);
    } else {
      setSelectedDate(date);
      setShowStatistics(true);
    }
  };

  const handleCloseStatistics = () => {
    setShowStatistics(false);
  };

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const chatCompletion = await getQuote();
        const newQuote = chatCompletion.choices[0]?.message?.content || "";
        setQuote(newQuote);
      } catch (error) {
        console.error("Error fetching quote from Groq:", error);
      }
    };

    fetchQuote();
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/login");
    }
  }, [isLoaded, isSignedIn]);

  const handleProfilePress = () => {
    if (!isSignedIn) {
      router.push("/login");
      return;
    }
    router.push("/profile");
  };

  const refreshMoodData = () => {
    console.log("Manually refreshing mood data...");
    // Clear existing data first to show loading state
    setWeeklyMoodData([]);
    setIsLoadingMoods(true);

    // Short timeout to ensure UI updates before fetching
    setTimeout(() => {
      fetchWeeklyMoodData();
    }, 100);
  };

  const ProfileAlert = () => (
    <Portal>
      <Modal
        visible={showProfileAlert}
        onDismiss={() => setShowProfileAlert(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <MaterialCommunityIcons
            name="account-alert"
            size={40}
            color="#FFD93D"
          />
          <PaperText style={styles.modalTitle}>Complete Your Profile</PaperText>
          <PaperText style={styles.modalText}>
            Please complete your profile by adding your{" "}
            {missingFields.join(", ")}.
          </PaperText>
          <View style={styles.modalButtons}>
            <Button
              mode="contained"
              onPress={() => {
                setShowProfileAlert(false);
                router.push("/settings");
              }}
              style={styles.completeButton}
              labelStyle={styles.buttonLabel}
            >
              Complete Profile
            </Button>
            <Button
              mode="text"
              onPress={() => setShowProfileAlert(false)}
              style={styles.laterButton}
              labelStyle={[styles.buttonLabel, styles.laterButtonLabel]}
            >
              Later
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          style={styles.animation}
          source={require("../../assets/animation/homepage_animation.json")}
          autoPlay
          loop
        />
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <Surface style={styles.container}>
        <View style={styles.safeArea}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreetingTime()}</Text>
              <Text style={styles.name}>{userName}</Text>
            </View>
            <TouchableOpacity
              onPress={handleProfilePress}
              style={styles.profileContainer}
            >
              <Avatar.Image
                size={40}
                source={{ uri: user?.imageUrl }}
                style={styles.avatarImage}
              />
              <Text style={styles.profileText}>Profile</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contentContainer}>
              <View style={styles.animationContainer}>
                <LottieView
                  style={styles.animation}
                  source={require("../../assets/animation/homepage_animation.json")}
                  autoPlay
                  loop
                />
              </View>

              <QuoteCard quote={quote} />

              <MiniCalendar
                dates={dates}
                onDatePress={handleDatePress}
                selectedDate={selectedDate}
                moodData={weeklyMoodData}
                isLoading={isLoadingMoods}
              />

              <MoodStatistics
                dates={dates}
                visible={showStatistics}
                onClose={handleCloseStatistics}
                userId={user?.id}
                moodData={weeklyMoodData}
                onRefresh={refreshMoodData}
              />
            </View>
          </ScrollView>
        </View>
      </Surface>
      <ProfileAlert />
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === "ios" ? 44 : 24,
  },
  greeting: {
    fontSize: 24,
    color: theme.colors.text,
    fontWeight: "bold",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    color: theme.colors.text,
    opacity: 0.9,
  },
  avatarImage: {
    backgroundColor: theme.colors.chip,
  },
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  animationContainer: {
    width: "100%",
    height: 200,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  animation: {
    width: 200,
    height: 200,
  },
  modalContainer: {
    backgroundColor: "#4A148C",
    margin: 20,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 5,
  },
  modalContent: {
    alignItems: "center",
    width: "100%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 15,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
    opacity: 0.9,
    lineHeight: 22,
  },
  modalButtons: {
    width: "100%",
    gap: 10,
  },
  completeButton: {
    backgroundColor: "#FFD93D",
    paddingVertical: 8,
    borderRadius: 25,
  },
  laterButton: {
    backgroundColor: "transparent",
  },
  buttonLabel: {
    fontSize: 16,
    color: "#2D1B69",
    fontWeight: "bold",
  },
  laterButtonLabel: {
    color: "#FFD93D",
  },
  profileContainer: {
    alignItems: "center",
  },
  profileText: {
    color: theme.colors.text,
    fontSize: 12,
    marginTop: 4,
    opacity: 0.9,
  },
});
