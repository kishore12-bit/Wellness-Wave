import React from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const BreathingCircle = ({
  breathAnimation,
  textOpacity,
  currentPhase,
  countdown,
  isBreathing,
}) => {
  return (
    <View style={styles.circleContainer}>
      <Animated.View
        style={[
          styles.breathCircle,
          {
            transform: [{ scale: breathAnimation }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacity,
          },
        ]}
      >
        <Text style={styles.phaseText}>
          {!isBreathing
            ? countdown > 0
              ? countdown
              : "Get Ready"
            : currentPhase}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  circleContainer: {
    width: width * 0.8,
    height: width * 0.8,
    alignItems: "center",
    justifyContent: "center",
  },
  breathCircle: {
    width: "100%",
    height: "100%",
    borderRadius: width * 0.4,
    backgroundColor: "#FFD93D",
    opacity: 0.3,
  },
  textContainer: {
    position: "absolute",
    alignItems: "center",
  },
  phaseText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
});

export default BreathingCircle;
