import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { Text as PaperText } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "./Theme";

const QuoteCard = ({ quote }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [quote]);

  return (
    <Animated.View style={[styles.quoteCardContainer, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={["#4A148C", "#3D1173"]}
        style={styles.quoteCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <MaterialCommunityIcons
          name="format-quote-open"
          size={24}
          color="rgba(255, 217, 61, 0.5)"
          style={styles.quoteIcon}
        />
        <PaperText style={styles.quoteText}>{quote}</PaperText>
        <MaterialCommunityIcons
          name="format-quote-close"
          size={24}
          color="rgba(255, 217, 61, 0.5)"
          style={[styles.quoteIcon, styles.quoteIconEnd]}
        />
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  quoteCardContainer: {
    marginBottom: 30,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: "#4A148C",
  },
  quoteCard: {
    padding: 20,
    borderRadius: 16,
  },
  quoteText: {
    fontSize: 18,
    textAlign: "center",
    color: theme.colors.text,
    fontStyle: "italic",
    lineHeight: 26,
  },
  quoteIcon: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  quoteIconEnd: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
});

export default QuoteCard;
