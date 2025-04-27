import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { config } from "../config/firebase";
import { getUserBreathingMinutes } from "../config/firebase";
import { getJournalingStreak } from "../components/journal/JournalFirebase";

// Initialize Firebase
const app = initializeApp(config);
const db = getFirestore(app);

export default function ProfileScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [profileData, setProfileData] = useState({
    fullName: "",
    age: "",
    weight: "",
    height: "",
  });
  const [breathingMinutes, setBreathingMinutes] = useState(0);
  const [journalingStreak, setJournalingStreak] = useState(0);

  const fetchUserProfile = async () => {
    if (!user?.id) return;
    try {
      const userDoc = await getDoc(doc(db, "user_profile", user.id));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfileData({
          fullName: data.fullName || "",
          age: data.age ? `${data.age}y` : "--",
          weight: data.weight ? `${data.weight}kg` : "--",
          height: data.height ? `${data.height}cm` : "--",
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchBreathingMinutes = async () => {
    if (!user?.id) return;
    const minutes = await getUserBreathingMinutes(user.id);
    setBreathingMinutes(minutes);
  };

  const fetchJournalingStreak = async () => {
    if (!user?.id) return;
    const { success, data: streak } = await getJournalingStreak(user.id);
    if (success) {
      setJournalingStreak(streak);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchBreathingMinutes();
    fetchJournalingStreak();
  }, [user?.id]);

  const handleSettingsPress = () => {
    router.push("/settings");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFD93D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          onPress={handleSettingsPress}
          style={styles.settingsButton}
        >
          <MaterialCommunityIcons name="cog" size={24} color="#FFD93D" />
          <Text style={styles.settingsText}>Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: user?.imageUrl }} style={styles.avatar} />
            </View>
          </View>
          <Text style={styles.name}>{profileData.fullName}</Text>
          <Text style={styles.email}>
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </View>

        <View style={styles.basicStats}>
          <View style={styles.statColumn}>
            <Text style={styles.statValue}>{profileData.age}</Text>
            <Text style={styles.statLabel}>Age</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statColumn}>
            <Text style={styles.statValue}>{profileData.weight}</Text>
            <Text style={styles.statLabel}>Weight</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statColumn}>
            <Text style={styles.statValue}>{profileData.height}</Text>
            <Text style={styles.statLabel}>Height</Text>
          </View>
        </View>

        <View style={styles.meditationStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{breathingMinutes}</Text>
            <Text style={styles.statLabel}>
              Minutes of breathing excercise today
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{journalingStreak}</Text>
            <Text style={styles.statLabel}>Journaling Streak</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2D1B69",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 20,
    flex: 1,
  },
  settingsButton: {
    padding: 8,
    alignItems: "center",
  },
  settingsText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 15,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#4A148C",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFD93D",
  },
  avatar: {
    width: 94,
    height: 94,
    borderRadius: 47,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  basicStats: {
    flexDirection: "row",
    backgroundColor: "#4A148C",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    justifyContent: "space-around",
    alignItems: "center",
  },
  statColumn: {
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: "80%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFD93D",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  meditationStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#4A148C",
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFD93D",
    marginBottom: 5,
  },
});
