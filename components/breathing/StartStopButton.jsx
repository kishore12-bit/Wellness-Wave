import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const StartStopButton = ({ isBreathing, handleStart }) => {
  return (
    <TouchableOpacity
      style={[styles.startButton, isBreathing && styles.stopButton]}
      onPress={handleStart}
    >
      <Text style={styles.buttonText}>
        {isBreathing ? "Stop" : "Start Breathing Exercise"}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  startButton: {
    backgroundColor: "#FFD93D",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 20,
  },
  stopButton: {
    backgroundColor: "#FF6B6B",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D1B69",
  },
});

export default StartStopButton;
