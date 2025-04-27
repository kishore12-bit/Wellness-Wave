import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import MeditationTab from "../../components/meditate/MeditationTab";
import BreathingTab from "../../components/meditate/BreathingTab";

export default function MeditationScreen() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("Meditation");

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Let's unwind</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Meditation" && styles.activeTab]}
          onPress={() => setActiveTab("Meditation")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Meditation" && styles.activeTabText,
            ]}
          >
            Meditation
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Breathing" && styles.activeTab]}
          onPress={() => setActiveTab("Breathing")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Breathing" && styles.activeTabText,
            ]}
          >
            Breathing Exercises
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "Meditation" ? (
        <MeditationTab
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      ) : (
        <BreathingTab />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2D1B69",
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#4A148C",
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#FFD93D",
  },
  tabText: {
    fontWeight: "500",
    color: "white",
    fontSize: 16,
  },
  activeTabText: {
    color: "#2D1B69",
    fontWeight: "bold",
  },
});
