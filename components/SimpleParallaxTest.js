import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ParallaxScrollView from "./ParallaxScrollView";

export const SimpleParallaxTest = () => {
  return (
    <ParallaxScrollView
      parallaxHeaderHeight={150}
      renderBackground={() => (
        <LinearGradient
          colors={["#4A148C", "#2D1B69"]}
          style={styles.headerBackground}
        />
      )}
      renderForeground={() => (
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>Parallax Test</Text>
        </View>
      )}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Simple Parallax Test</Text>
        <Text style={styles.paragraph}>
          This is a simple test of the ParallaxScrollView component.
        </Text>
        <Text style={styles.paragraph}>
          Scroll up and down to see the parallax effect.
        </Text>
        {Array.from({ length: 10 }).map((_, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.cardText}>Test Card {i + 1}</Text>
          </View>
        ))}
      </View>
    </ParallaxScrollView>
  );
};

const styles = StyleSheet.create({
  headerBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  headerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 16,
    color: "#666",
  },
  card: {
    backgroundColor: "#F5F5F5",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardText: {
    fontSize: 16,
    color: "#333",
  },
});
