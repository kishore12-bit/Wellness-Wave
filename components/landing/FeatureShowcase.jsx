import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import ParallaxScrollView from "../ParallaxScrollView";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const FeatureCard = ({ icon, title, description, color, index }) => (
  <Animated.View style={styles.featureCard}>
    <LinearGradient
      colors={[`${color}40`, `${color}20`]}
      style={styles.cardGradient}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}40` }]}>
        <MaterialCommunityIcons name={icon} size={32} color={color} />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </LinearGradient>
  </Animated.View>
);

export default function FeatureShowcase({ onGetStarted }) {
  const features = [
    {
      icon: "meditation",
      title: "Guided Meditation",
      description:
        "Find peace with our curated meditation sessions for all levels",
      color: "#FFD93D",
    },
    {
      icon: "emoticon",
      title: "Mood Tracking",
      description:
        "Track and understand your emotional journey with visual insights",
      color: "#4CAF50",
    },
    {
      icon: "notebook",
      title: "AI Journal",
      description:
        "Express yourself with AI-powered journaling prompts and analysis",
      color: "#2196F3",
    },
    {
      icon: "weather-windy",
      title: "Breathing Exercises",
      description: "Master your breath with guided breathing techniques",
      color: "#9C27B0",
    },
    {
      icon: "chart-line-variant",
      title: "Progress Tracking",
      description: "Monitor your wellness journey with detailed statistics",
      color: "#FF5722",
    },
  ];

  return (
    <View style={styles.mainContainer}>
      <ParallaxScrollView
        style={styles.container}
        backgroundColor="#1A1040"
        parallaxHeaderHeight={350}
        stickyHeaderHeight={0}
        contentBackgroundColor="#1A1040"
        backgroundScrollSpeed={1}
        fadeOutForeground={false}
        renderScrollComponent={() => (
          <Animated.ScrollView style={{ backgroundColor: "#1A1040" }} />
        )}
        renderBackground={() => (
          <View style={styles.headerContainer}>
            <LinearGradient
              colors={["#2D1B69", "#1A1040"]}
              style={StyleSheet.absoluteFill}
            />
            <LottieView
              source={require("../../assets/animation/homepage_animation.json")}
              autoPlay
              loop
              style={styles.animation}
            />
          </View>
        )}
        renderForeground={() => (
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>Welcome to{"\n"}Wellness Wave</Text>
            <Text style={styles.subtitle}>
              Your Complete Wellness Companion
            </Text>
          </View>
        )}
      >
        <View style={[styles.content, { backgroundColor: "#1A1040" }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Discover Inner Peace</Text>
            <Text style={styles.sectionSubtitle}>
              Experience a suite of powerful features designed to enhance your
              well-being
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} index={index} />
            ))}
          </View>

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Why Choose Wellness Wave?</Text>
            {[
              { icon: "shield-check", text: "Personalized wellness journey" },
              { icon: "brain", text: "AI-powered insights" },
              { icon: "chart-timeline-variant", text: "Track your progress" },
            ].map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <MaterialCommunityIcons
                    name={benefit.icon}
                    size={24}
                    color="#FFD93D"
                  />
                </View>
                <Text style={styles.benefitText}>{benefit.text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={onGetStarted}
          >
            <LinearGradient
              colors={["#FFD93D", "#FFC107"]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.getStartedText}>GET STARTED</Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={24}
                color="#2D1B69"
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ParallaxScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#1A1040",
  },
  container: {
    flex: 1,
    backgroundColor: "#1A1040",
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 350,
    alignItems: "center",
    justifyContent: "center",
  },
  animation: {
    width: width,
    height: 350,
  },
  titleContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 350,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(26, 16, 64, 0.7)",
  },
  mainTitle: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 20,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.9,
  },
  content: {
    padding: 20,
    backgroundColor: "#1A1040",
    flex: 1,
    minHeight: Dimensions.get("window").height,
  },
  sectionHeader: {
    marginBottom: 30,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.8,
    maxWidth: "80%",
  },
  featuresContainer: {
    alignItems: "center",
    gap: 20,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  featureCard: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    backgroundColor: "#2D1B69",
  },
  cardGradient: {
    padding: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
    lineHeight: 22,
  },
  benefitsContainer: {
    backgroundColor: "rgba(45, 27, 105, 0.5)",
    borderRadius: 20,
    padding: 25,
    marginBottom: 40,
  },
  benefitsTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 25,
    textAlign: "center",
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  benefitIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255, 217, 61, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  benefitText: {
    fontSize: 18,
    color: "#FFFFFF",
    opacity: 0.9,
    flex: 1,
  },
  getStartedButton: {
    marginBottom: 30,
    borderRadius: 30,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#FFD93D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 10,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D1B69",
    letterSpacing: 1,
  },
});
