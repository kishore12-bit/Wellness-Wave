import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useUser } from "@clerk/clerk-expo";

// Import components
import MoodOption from "../../components/mood/MoodOption";
import MoodAnimation from "../../components/mood/MoodAnimation";
import { moods } from "../../components/mood/constants";
import { logMood } from "../../components/mood/MoodFirebase";

const MoodLoggingScreen = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      const now = new Date();
      console.log("User ID:", user.id);
      console.log("User Email:", user.emailAddresses[0].emailAddress);
      console.log("Login Time:", now.toLocaleString());
      console.log("Timestamp:", now.getTime());
    }
  }, [user]);

  const handleMoodSelection = (moodId) => {
    setSelectedMood(moodId);
  };

  const handleSubmit = async () => {
    if (!selectedMood) {
      Alert.alert("Error", "Please select a mood before logging.", [
        { text: "OK" },
      ]);
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be logged in to log your mood.", [
        { text: "OK" },
      ]);
      return;
    }

    try {
      setLoading(true);
      const now = new Date();

      // Log locally
      console.log("=== Mood Logging ===");
      console.log("User ID:", user.id);
      console.log("Selected mood:", selectedMood);
      console.log("Date:", now.toLocaleDateString());
      console.log("Time:", now.toLocaleTimeString());
      console.log("Full Timestamp:", now.toISOString());
      console.log("Unix Timestamp:", Math.floor(now.getTime() / 1000));
      console.log("==================");

      // Get the mood label
      const selectedMoodObj = moods.find((mood) => mood.id === selectedMood);

      // Log to Firebase
      const result = await logMood(
        user.id,
        selectedMood,
        selectedMoodObj.label
      );

      if (result.success) {
        Alert.alert("Success", "Your mood has been logged successfully!", [
          {
            text: "OK",
            onPress: () => {
              setSelectedMood(null);
            },
          },
        ]);
      } else {
        throw new Error("Failed to log mood");
      }
    } catch (error) {
      console.error("Error logging mood:", error);
      Alert.alert(
        "Error",
        "There was a problem logging your mood. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How Do You Feel{"\n"}Today?</Text>

      <MoodAnimation selectedMood={selectedMood} />

      <View style={styles.moodContainer}>
        {moods.map((mood) => (
          <MoodOption
            key={mood.id}
            mood={mood}
            isSelected={selectedMood === mood.id}
            onSelect={handleMoodSelection}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#2D1B69" size="small" />
        ) : (
          <Text style={styles.actionButtonText}>Log Mood</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2D1B69",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 40,
  },
  moodContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 40,
  },
  actionButton: {
    backgroundColor: "#FFD93D",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
  },
  actionButtonText: {
    color: "#2D1B69",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default MoodLoggingScreen;
