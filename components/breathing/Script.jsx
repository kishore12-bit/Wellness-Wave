import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Script = ({
  isLoadingScript,
  calmingScript,
  words,
  currentWordIndex,
  isSpeaking,
  handleSpeak,
  isBreathing,
  handleStart,
  startStopButton,
}) => {
  const renderScript = () => {
    return (
      <Text style={styles.scriptText}>
        {words.map((word, index) => (
          <Text
            key={index}
            style={[
              index === currentWordIndex && {
                backgroundColor: "rgba(255, 217, 61, 0.3)",
                borderRadius: 4,
                padding: 2,
              },
            ]}
          >
            {word + " "}
          </Text>
        ))}
      </Text>
    );
  };

  return (
    <>
      {isLoadingScript ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD93D" />
          <Text style={styles.loadingText}>
            Preparing your calming guidance...
          </Text>
        </View>
      ) : (
        <>
          {renderScript()}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.iconButton, isSpeaking && styles.activeIconButton]}
              onPress={handleSpeak}
            >
              <MaterialCommunityIcons
                name={isSpeaking ? "volume-high" : "volume-medium"}
                size={24}
                color="#2D1B69"
              />
              <Text style={styles.iconButtonText}>
                {isSpeaking ? "Stop Reading" : "Read Aloud"}
              </Text>
            </TouchableOpacity>
            <View style={styles.startStopButtonContainer}>
              {startStopButton}
            </View>
          </View>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  scriptText: {
    fontSize: 18,
    color: "#FFFFFF",
    lineHeight: 28,
    marginBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 20,
    fontSize: 16,
  },
  buttonContainer: {
    alignItems: "center",
    gap: 16,
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD93D",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  activeIconButton: {
    backgroundColor: "#FFA500",
  },
  iconButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D1B69",
  },
  startStopButtonContainer: {
    marginTop: 16,
  },
});

export default Script;
