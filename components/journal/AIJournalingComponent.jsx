import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
} from "react-native";
import {
  Provider as PaperProvider,
  DefaultTheme,
  Surface,
  Text as PaperText,
} from "react-native-paper";
import Groq from "groq-sdk";
import { useUser } from "@clerk/clerk-expo";
import { saveJournalEntry } from "./JournalFirebase";

const groq = new Groq({
  apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY,
});

async function getGroqChatCompletion(selectedEmotions) {
  const emotionPrompt =
    selectedEmotions.length > 0
      ? `Generate a short, focused journaling prompt based on the user's selected emotion: ${selectedEmotions.join(
          ", "
        )}`
      : "Keep prompts concise, reflective, and actionable. Ensure variety by generating a new prompt each time the user logs in.";

  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: emotionPrompt,
      },
    ],
    model: "llama-3.3-70b-versatile",
  });
}

const AIJournalingComponent = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const emotions = [
    "Happy",
    "Grateful",
    "Motivated",
    "Sad",
    "Stressed",
    "Anxious",
    "Excited",
    "Calm",
    "Confident",
    "Curious",
    "Frustrated",
    "Hopeful",
    "Inspired",
    "Lonely",
    "Nervous",
    "Peaceful",
    "Proud",
    "Relaxed",
    "Surprised",
    "Tired",
  ];

  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [journalEntry, setJournalEntry] = useState("");
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchPrompt = async () => {
      if (selectedEmotions.length > 0) {
        try {
          const chatCompletion = await getGroqChatCompletion(selectedEmotions);
          const newPrompt = chatCompletion.choices[0]?.message?.content || "";
          setPrompt(newPrompt);
        } catch (error) {
          console.error("Error fetching prompt from Groq:", error);
          Alert.alert("Error", "Failed to fetch AI prompt.");
          setPrompt("Reflect on your current thoughts and feelings.");
        }
      } else {
        setPrompt("Reflect on your current thoughts and feelings.");
      }
    };

    fetchPrompt();
  }, [selectedEmotions]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: selectedEmotions.length > 0 ? 1 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [selectedEmotions]);

  const handleSave = async () => {
    // Check if entry is valid
    if (selectedEmotions.length === 0 || !journalEntry.trim()) {
      Alert.alert(
        "Error",
        "Please select at least one emotion and write a journal entry."
      );
      return;
    }

    // Check if user is logged in
    if (!user?.id) {
      Alert.alert("Error", "You must be logged in to save journal entries.");
      return;
    }

    try {
      setLoading(true);

      // Get current date and time
      const now = new Date();
      const date = now.toLocaleDateString();
      const time = now.toLocaleTimeString();

      // Log the journal entry to console
      console.log("=== New Journal Entry Saved ===");
      console.log("User ID:", user.id);
      console.log("Date:", date);
      console.log("Time:", time);
      console.log("Selected Emotions:", selectedEmotions);
      console.log("AI-Generated Prompt:", prompt);
      console.log("Journal Entry:", journalEntry);
      console.log("==============================");

      // Save to Firebase
      const result = await saveJournalEntry(
        user.id,
        selectedEmotions,
        prompt,
        journalEntry
      );

      if (result.success) {
        // Reset the form
        setJournalEntry("");
        setSelectedEmotions([]);

        // Show success message
        Alert.alert("Success", "Your journal entry has been saved!");
      } else {
        throw new Error(result.error || "Failed to save journal entry");
      }
    } catch (error) {
      console.error("Error saving journal entry:", error);
      Alert.alert(
        "Error",
        "There was a problem saving your journal entry. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmotionPress = (emotion) => {
    setSelectedEmotions((prev) => {
      if (prev.includes(emotion)) {
        return prev.filter((em) => em !== emotion);
      } else {
        return prev.length < 3 ? [...prev, emotion] : prev;
      }
    });
  };

  return (
    <Surface style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <PaperText style={styles.title}>AI-Powered Journaling</PaperText>

        <View style={styles.emotionContainer}>
          {emotions.map((emotion) => (
            <TouchableOpacity
              key={emotion}
              style={[
                styles.emotionButton,
                selectedEmotions.includes(emotion) && styles.selectedEmotion,
              ]}
              onPress={() => handleEmotionPress(emotion)}
            >
              <PaperText style={styles.emotionText}>{emotion}</PaperText>
            </TouchableOpacity>
          ))}
        </View>

        <Animated.View style={[styles.promptContainer, { opacity: fadeAnim }]}>
          {prompt && <PaperText style={styles.promptText}>{prompt}</PaperText>}
        </Animated.View>

        <Animated.View
          style={[{ opacity: fadeAnim }, styles.journalInputContainer]}
        >
          <TextInput
            style={styles.journalInput}
            multiline
            placeholder="Write your journal entry here..."
            placeholderTextColor="#BDBDBD"
            value={journalEntry}
            onChangeText={setJournalEntry}
          />
        </Animated.View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleSave}
        disabled={loading}
      >
        <PaperText style={styles.actionButtonText}>
          {loading ? "Saving..." : "Save Entry"}
        </PaperText>
      </TouchableOpacity>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#2D1B69",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 45,
    marginBottom: 40,
    textAlign: "center",
  },
  emotionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 50,
  },
  emotionButton: {
    padding: 10,
    margin: 5,
    borderRadius: 20,
    backgroundColor: "#4A148C",
  },
  selectedEmotion: {
    backgroundColor: "#FFD93D",
  },
  emotionText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  promptContainer: {
    backgroundColor: "#4A148C",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  promptText: {
    fontSize: 18,
    fontStyle: "italic",
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  journalInputContainer: {
    minHeight: 200,
  },
  bottomPadding: {
    height: 80,
  },
  journalInput: {
    backgroundColor: "#4A148C",
    borderRadius: 10,
    padding: 15,
    minHeight: 200,
    textAlignVertical: "top",
    color: "#FFFFFF",
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

export default AIJournalingComponent;
