import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
  ScrollView,
  Modal,
  Dimensions,
  StatusBar,
  Image,
  ActivityIndicator,
  Linking,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { config } from "../config/firebase";
import * as ImagePicker from "expo-image-picker";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Initialize Firebase
const app = initializeApp(config);
const db = getFirestore(app);

export default function SettingsScreen() {
  // 1. INITIALIZATION & STATE SETUP
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();
  const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    age: "",
    weight: "",
    height: "",
  });
  const [isContactSupportOpen, setIsContactSupportOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // 2. DATA FETCHING ON COMPONENT MOUNT
  useEffect(() => {
    if (user?.id) {
      fetchUserProfile();
    }
  }, [user?.id]);

  // 3. PROFILE DATA MANAGEMENT
  // 3.1 Fetch user profile from Firebase
  const fetchUserProfile = async () => {
    if (!user?.id) return;
    try {
      const userDoc = await getDoc(doc(db, "user_profile", user.id));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setPersonalInfo({
          fullName: data.fullName || user?.fullName || "",
          age: data.age ? data.age.toString() : "",
          weight: data.weight ? data.weight.toString() : "",
          height: data.height ? data.height.toString() : "",
        });
      } else {
        // If no document exists yet, initialize with Clerk data
        setPersonalInfo({
          fullName: user?.fullName || "",
          age: "",
          weight: "",
          height: "",
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // 3.2 Save personal information to Firebase
  const handleSavePersonalInfo = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const userProfileRef = doc(db, "user_profile", user.id);
      await setDoc(
        userProfileRef,
        {
          fullName: personalInfo.fullName,
          age: parseInt(personalInfo.age),
          weight: parseInt(personalInfo.weight),
          height: parseInt(personalInfo.height),
          imageUrl: user?.imageUrl,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setIsPersonalInfoOpen(false);
    } catch (error) {
      console.error("Error saving user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. IMAGE HANDLING
  // 4.1 Handle image selection and upload
  const handleImagePick = async () => {
    try {
      // 4.1.1 Request gallery permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert("Permission to access gallery is required!");
        return;
      }

      // 4.1.2 Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      // 4.1.3 Handle selected image
      if (!result.canceled) {
        setIsLoading(true);
        try {
          // 4.1.4 Update image in Clerk first
          await updateClerkImage(result.assets[0].uri);

          // 4.1.5 Then update Firebase with new Clerk URL
          if (!user) return;
          const userProfileRef = doc(db, "user_profile", user.id);
          await setDoc(
            userProfileRef,
            {
              imageUrl: user.imageUrl,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (error) {
          console.error("Error updating profile image:", error);
          alert("Failed to update profile image. Please try again.");
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      alert("Error accessing image gallery");
    }
  };

  // 4.2 Update profile image in Clerk
  const updateClerkImage = async (imageUri) => {
    if (!user) return;
    try {
      // Fix for FormData issue in React Native
      // Create a file object that Clerk can accept
      const fileToUpload = {
        uri: imageUri,
        type: "image/jpeg",
        name: "profile-image.jpg",
      };

      // Use the Clerk API directly with the file object
      await user.setProfileImage({
        file: fileToUpload,
      });
    } catch (error) {
      console.error("Error updating Clerk image:", error);
      throw error;
    }
  };

  // 5. UI EVENT HANDLERS
  const handlePersonalInfoChange = (field, value) => {
    setPersonalInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleContactSupport = () => {
    setIsContactSupportOpen(!isContactSupportOpen);
  };

  const handleSubmitSupport = async () => {
    if (!user?.id || !supportMessage.trim()) return;

    setIsSending(true);
    try {
      // Create a new support ticket in Firestore
      const supportRef = doc(db, "support_tickets", `${user.id}_${Date.now()}`);

      // Get the primary email from user's emailAddresses array
      const userEmail =
        user.emailAddresses?.[0]?.emailAddress || "No email provided";

      await setDoc(supportRef, {
        userId: user.id,
        userEmail: userEmail,
        userName: user.fullName || "Anonymous User",
        message: supportMessage.trim(),
        status: "new", // Status can be: new, in-progress, resolved
        createdAt: new Date().toISOString(),
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version,
        },
        // Add any additional metadata that might be helpful
        userImageUrl: user.imageUrl,
      });

      // Show success message
      Alert.alert(
        "Message Sent",
        "Thank you for contacting support. We'll get back to you soon.",
        [
          {
            text: "OK",
            onPress: () => {
              setIsContactSupportOpen(false);
              setSupportMessage("");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error sending support message:", error);
      Alert.alert("Error", "Failed to send message. Please try again later.");
    } finally {
      setIsSending(false);
    }
  };

  const faqs = [
    // Meditation FAQs
    {
      id: "med1",
      question: "How do I start meditating?",
      answer:
        "Start with short 5-minute sessions in a quiet place. Focus on your breath and try to clear your mind. Our app provides guided meditations perfect for beginners.",
    },
    {
      id: "med2",
      question: "What are the benefits of meditation?",
      answer:
        "Regular meditation can reduce stress, improve focus, enhance sleep quality, boost emotional well-being, and help manage anxiety and depression.",
    },
    {
      id: "med3",
      question: "How often should I meditate?",
      answer:
        "We recommend daily meditation, even if it's just for 5-10 minutes. Consistency is more important than duration. Track your streak in the app to stay motivated!",
    },

    // Breathing Exercise FAQs
    {
      id: "breath1",
      question:
        "What are the different types of breathing exercises available?",
      answer:
        "We offer four types: Stress Relief for anxiety reduction, Focus & Productivity for better concentration, Sleep & Relaxation for better rest, and General breathing for overall wellness.",
    },
    {
      id: "breath2",
      question: "How long should I do breathing exercises?",
      answer:
        "Start with 5-10 minutes per session. Our guided exercises have preset durations, but you can adjust them based on your comfort level and schedule.",
    },
    {
      id: "breath3",
      question: "When is the best time to do breathing exercises?",
      answer:
        "You can practice anytime, but specific exercises work better at certain times: stress relief when anxious, focus exercises before work, and sleep breathing before bed.",
    },

    // Mood Tracking FAQs
    {
      id: "mood1",
      question: "Why should I track my mood?",
      answer:
        "Mood tracking helps you understand your emotional patterns, identify triggers, and make positive lifestyle changes. It's a valuable tool for emotional self-awareness.",
    },
    {
      id: "mood2",
      question: "How often should I log my mood?",
      answer:
        "We recommend logging your mood daily for the most accurate tracking. You can log multiple times a day if your mood changes significantly.",
    },
    {
      id: "mood3",
      question: "Can I view my mood history?",
      answer:
        "Yes! You can view your mood patterns over time in the app. This helps you identify trends and understand what affects your emotional well-being.",
    },

    // Journaling FAQs
    {
      id: "journal1",
      question: "What makes AI journaling different?",
      answer:
        "Our AI journaling feature provides personalized prompts based on your mood and previous entries, helping you explore your thoughts more deeply and meaningfully.",
    },
    {
      id: "journal2",
      question: "How private are my journal entries?",
      answer:
        "Your journal entries are completely private and securely stored. Only you can access your entries, and they're protected by your account credentials.",
    },
    {
      id: "journal3",
      question: "How can I get the most out of journaling?",
      answer:
        "Be honest in your entries, try to write regularly, and use the AI prompts to explore different aspects of your thoughts and feelings. You can also review past entries to track your personal growth.",
    },
    {
      id: "journal4",
      question: "Can I edit or delete my journal entries?",
      answer:
        "Yes, you can access all your past entries in the 'Entries' tab. Your entries are stored locally and can be managed according to your preferences.",
    },

    // General App FAQs
    {
      id: "general1",
      question: "How do I track my overall progress?",
      answer:
        "Your profile dashboard shows comprehensive statistics including meditation minutes, mood patterns, and journaling streaks. Each feature has its own detailed progress tracking section.",
    },
    {
      id: "general2",
      question: "Can I use the app offline?",
      answer:
        "Most features work offline, but you'll need an internet connection to sync your data, receive AI journaling prompts, and update your profile.",
    },
    {
      id: "general3",
      question: "How do I customize my experience?",
      answer:
        "Visit the Settings page to update your profile, adjust notifications, and customize your app experience. You can also personalize your avatar and personal information.",
    },
  ];

  const renderFAQItem = ({ id, question, answer }) => (
    <View style={styles.faqItem} key={id}>
      <View style={styles.faqQuestion}>
        <MaterialCommunityIcons name="help-circle" size={20} color="#FFD93D" />
        <Text style={styles.faqQuestionText}>{question}</Text>
      </View>
      <Text style={styles.faqAnswerText}>{answer}</Text>
    </View>
  );

  const FAQModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showFAQModal}
      onRequestClose={() => setShowFAQModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>FAQs</Text>
            <TouchableOpacity
              onPress={() => setShowFAQModal(false)}
              style={styles.closeButton}
            >
              <MaterialCommunityIcons name="close" size={24} color="#2D1B69" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.faqScrollContainer}>
            <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
            {faqs.map((faq) => renderFAQItem(faq))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderAvatarSection = () => (
    <View style={styles.avatarSection}>
      <View style={styles.avatarWrapper}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: user?.imageUrl }} style={styles.avatar} />
        </View>
        <TouchableOpacity
          style={[
            styles.editAvatarButton,
            isLoading && styles.editAvatarButtonDisabled,
          ]}
          onPress={handleImagePick}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#2D1B69" />
          ) : (
            <MaterialCommunityIcons name="pencil" size={16} color="#2D1B69" />
          )}
        </TouchableOpacity>
      </View>
      <Text style={styles.avatarHint}>
        {isLoading ? "Updating..." : "Tap pencil to change avatar"}
      </Text>
    </View>
  );

  const renderSettingItem = ({
    icon,
    title,
    value,
    hasChevron = true,
    isSwitch = false,
    onPress,
    isOpen = false,
  }) => (
    <>
      <TouchableOpacity
        style={styles.settingItem}
        onPress={onPress}
        disabled={isSwitch}
      >
        <View style={styles.settingLeft}>
          <MaterialCommunityIcons name={icon} size={24} color="#FFD93D" />
          <Text style={styles.settingText}>{title}</Text>
        </View>
        <View style={styles.settingRight}>
          {isSwitch ? (
            <Switch
              value={value}
              onValueChange={onPress}
              trackColor={{ false: "#767577", true: "#2D1B69" }}
              thumbColor={value ? "#FFD93D" : "#f4f3f4"}
            />
          ) : (
            <>
              {value && <Text style={styles.settingValue}>{value}</Text>}
              {hasChevron && (
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#2D1B69"
                />
              )}
            </>
          )}
        </View>
      </TouchableOpacity>
      {isOpen && title === "Personal Information" && (
        <View style={styles.dropdownContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={personalInfo.fullName}
              onChangeText={(value) =>
                handlePersonalInfoChange("fullName", value)
              }
              placeholder="Enter your full name"
              placeholderTextColor="#666666"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Age</Text>
            <TextInput
              style={styles.input}
              value={personalInfo.age}
              onChangeText={(value) => handlePersonalInfoChange("age", value)}
              placeholder="Enter your age"
              placeholderTextColor="#666666"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={personalInfo.weight}
              onChangeText={(value) =>
                handlePersonalInfoChange("weight", value)
              }
              placeholder="Enter your weight in kg"
              placeholderTextColor="#666666"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              value={personalInfo.height}
              onChangeText={(value) =>
                handlePersonalInfoChange("height", value)
              }
              placeholder="Enter your height in cm"
              placeholderTextColor="#666666"
              keyboardType="numeric"
            />
          </View>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSavePersonalInfo}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {isOpen && title === "Contact Support" && (
        <View style={styles.dropdownContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>How can we help you?</Text>
            <TextInput
              style={[styles.input, { height: 120, textAlignVertical: "top" }]}
              multiline={true}
              value={supportMessage}
              onChangeText={(value) => setSupportMessage(value)}
              placeholder="Describe your issue here..."
              placeholderTextColor="#666666"
            />
          </View>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (isSending || !supportMessage.trim()) &&
                styles.saveButtonDisabled,
            ]}
            onPress={handleSubmitSupport}
            disabled={isSending || !supportMessage.trim()}
          >
            <Text style={styles.saveButtonText}>
              {isSending ? "Sending..." : "Submit"}
            </Text>
          </TouchableOpacity>
          <Text style={styles.supportNote}>
            Our support team will respond to you at:{" "}
            {user?.emailAddresses?.[0]?.emailAddress || "your registered email"}
          </Text>
        </View>
      )}
    </>
  );

  // 6. UI RENDERING COMPONENTS
  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FAQModal />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFD93D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.settingsGroup}>{renderAvatarSection()}</View>

        <Text style={styles.sectionTitle}>General Settings</Text>
        <View style={styles.settingsGroup}>
          {renderSettingItem({
            icon: "account-outline",
            title: "Personal Information",
            onPress: () => setIsPersonalInfoOpen(!isPersonalInfoOpen),
            isOpen: isPersonalInfoOpen,
            value: "",
          })}
        </View>

        <Text style={styles.sectionTitle}>Help</Text>
        <View style={styles.settingsGroup}>
          {renderSettingItem({
            icon: "help-circle-outline",
            title: "FAQs",
            onPress: () => setShowFAQModal(true),
            value: "",
          })}
          {renderSettingItem({
            icon: "email-outline",
            title: "Contact Support",
            onPress: handleContactSupport,
            isOpen: isContactSupportOpen,
            value: "",
          })}
        </View>

        <Text style={styles.sectionTitle}>Sign Out</Text>
        <View style={styles.settingsGroup}>
          {renderSettingItem({
            icon: "logout",
            title: "Sign Out",
            onPress: handleSignOut,
            hasChevron: false,
            value: "",
          })}
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
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFD93D",
    marginBottom: 10,
    marginTop: 20,
  },
  settingsGroup: {
    backgroundColor: "#4A148C",
    borderRadius: 15,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    fontSize: 16,
    color: "#FFFFFF",
    marginLeft: 12,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingValue: {
    fontSize: 14,
    color: "#FFD93D",
    marginRight: 8,
  },
  dropdownContent: {
    padding: 16,
    backgroundColor: "#2D1B69",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: "#FFD93D",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#4A148C",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  saveButton: {
    backgroundColor: "#FFD93D",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: "#2D1B69",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#2D1B69",
    width: "90%",
    height: SCREEN_HEIGHT * 0.8,
    borderRadius: 20,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#4A148C",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  closeButton: {
    padding: 4,
  },
  faqScrollContainer: {
    flex: 1,
    padding: 20,
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFD93D",
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 20,
    backgroundColor: "#4A148C",
    padding: 16,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#FFD93D",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
    flex: 1,
  },
  faqAnswerText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 20,
  },
  avatarSection: {
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 10,
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
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFD93D",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2D1B69",
  },
  avatarHint: {
    fontSize: 14,
    color: "#FFD93D",
    opacity: 0.8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  editAvatarButtonDisabled: {
    opacity: 0.6,
  },
  supportNote: {
    fontSize: 14,
    color: "#FFD93D",
    marginTop: 16,
    textAlign: "center",
    opacity: 0.8,
  },
});
