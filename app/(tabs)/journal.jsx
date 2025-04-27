"use client";

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";
import AIJournalingComponent from "../../components/journal/AIJournalingComponent";
import JournalEntriesTab from "../../components/journal/JournalEntriesTab";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#FFD93D",
    background: "#2D1B69",
    text: "#FFFFFF",
    placeholder: "#BDBDBD",
  },
};

export default function JournalScreen() {
  const [activeTab, setActiveTab] = useState("Journal");

  // Log when the journal tab changes
  useEffect(() => {
    console.log(`Journal tab changed to: ${activeTab}`);
  }, [activeTab]);

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Journal</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Journal" && styles.activeTab]}
            onPress={() => setActiveTab("Journal")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Journal" && styles.activeTabText,
              ]}
            >
              Journal
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Entries" && styles.activeTab]}
            onPress={() => setActiveTab("Entries")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Entries" && styles.activeTabText,
              ]}
            >
              Entries
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "Journal" ? (
          <AIJournalingComponent />
        ) : (
          <JournalEntriesTab />
        )}
      </SafeAreaView>
    </PaperProvider>
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
