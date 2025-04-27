import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";

const BreathingTab = () => {
  const router = useRouter();

  const breathingCategories = [
    {
      id: "stress",
      title: "Stress Relief",
      icon: (
        <MaterialCommunityIcons name="meditation" size={50} color="#FFD93D" />
      ),
      description: "Calm your mind and reduce stress",
      route: "/breathing/stress-relief",
    },
    {
      id: "focus",
      title: "Focus & Productivity",
      icon: <Ionicons name="bulb-outline" size={50} color="#FFD93D" />,
      description: "Enhance concentration and mental clarity",
      route: "/breathing/focus-productivity",
    },
    {
      id: "sleep",
      title: "Sleep & Relaxation",
      icon: <Ionicons name="moon-outline" size={50} color="#FFD93D" />,
      description: "Prepare your body and mind for rest",
      route: "/breathing/sleep-relaxation",
    },
    {
      id: "general",
      title: "General Relaxation",
      icon: <FontAwesome5 name="spa" size={45} color="#FFD93D" />,
      description: "Overall wellbeing and calmness",
      route: "/breathing/general",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Breathing Exercises</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.categoriesContainer}>
          {breathingCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => router.push(category.route)}
            >
              <View style={styles.iconContainer}>{category.icon}</View>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categoryDescription}>
                {category.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2D1B69",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  categoryCard: {
    backgroundColor: "#4A148C",
    width: "45%",
    aspectRatio: 0.8,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  iconContainer: {
    backgroundColor: "rgba(74, 20, 140, 0.7)",
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 217, 61, 0.3)",
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  categoryDescription: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
});

export default BreathingTab;
