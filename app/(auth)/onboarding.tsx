import * as React from "react";
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useUser } from "@clerk/clerk-expo";

export default function OnboardingScreen() {
  const router = useRouter();
  const { user } = useUser();

  const [fullName, setFullName] = React.useState("");
  const [avatar, setAvatar] = React.useState(null);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const onComplete = async () => {
    try {
      // Handle avatar upload if exists
      if (avatar) {
        try {
          const response = await fetch(avatar);
          const blob = await response.blob();
          const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
          await user.setProfileImage({ file });
        } catch (imageError) {
          console.error("Error uploading avatar:", imageError);
        }
      }

      // Split and update name
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || null;

      await user.update({
        firstName,
        lastName,
      });

      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Let's personalize your experience</Text>

        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons name="camera" size={30} color="#FFD93D" />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            value={fullName}
            placeholder="Full Name"
            placeholderTextColor="#9B9B9B"
            onChangeText={setFullName}
          />
          <TouchableOpacity style={styles.button} onPress={onComplete}>
            <Text style={styles.buttonText}>COMPLETE PROFILE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
