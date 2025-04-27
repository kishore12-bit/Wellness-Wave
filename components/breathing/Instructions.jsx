import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Instructions = ({ title, instructions }) => {
  return (
    <View style={styles.instructionsContainer}>
      <Text style={styles.instructionTitle}>{title}</Text>
      <Text style={styles.instructionText}>{instructions}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  instructionsContainer: {
    padding: 20,
    backgroundColor: "#4A148C",
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 40,
  },
  instructionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFD93D",
    marginBottom: 16,
    textAlign: "center",
  },
  instructionText: {
    fontSize: 16,
    color: "#FFFFFF",
    lineHeight: 24,
  },
});

export default Instructions;
