import React from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import { getMoodAnimation } from "./constants";

const MoodAnimation = ({ selectedMood }) => {
  const animation = getMoodAnimation(selectedMood);

  return (
    <View style={styles.emojiContainer}>
      <LottieView source={animation} autoPlay loop style={styles.animation} />
    </View>
  );
};

const styles = StyleSheet.create({
  emojiContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 40,
    marginTop: 50,
  },
  animation: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginBottom: 30,
  },
});

export default MoodAnimation;
