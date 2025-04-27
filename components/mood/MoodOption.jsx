import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

const MoodOption = ({ mood, isSelected, onSelect }) => {
  return (
    <Pressable
      onPress={() => onSelect(mood.id)}
      style={[styles.moodOption, isSelected && { transform: [{ scale: 1.1 }] }]}
    >
      <View
        style={[
          styles.moodDot,
          { backgroundColor: mood.color },
          isSelected && styles.selectedMood,
        ]}
      />
      <Text style={styles.moodLabel}>{mood.label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  moodOption: {
    alignItems: "center",
  },
  moodDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 5,
  },
  selectedMood: {
    transform: [{ scale: 1.2 }],
    shadowColor: "#fff",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  moodLabel: {
    color: "white",
    fontSize: 12,
    marginTop: 8,
  },
});

export default MoodOption;
