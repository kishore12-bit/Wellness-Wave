import { Tabs } from "expo-router";
import React from "react";
import { Platform, View, Animated } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useAuth } from "@clerk/clerk-expo";

export default function TabLayout() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const TabIcon = ({ name, color, focused }) => {
    return (
      <View
        style={{
          width: 60,
          height: 60,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: focused ? "#FFD93D" : "transparent",
            width: focused ? 50 : 24,
            height: focused ? 50 : 24,
            borderRadius: focused ? 25 : 12,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: focused ? 25 : 0,
            shadowColor: focused ? "#FFD93D" : "transparent",
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: focused ? 5 : 0,
          }}
        >
          <MaterialCommunityIcons
            name={name}
            size={focused ? 24 : 24}
            color={focused ? "#2D1B69" : color}
          />
        </View>
      </View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          bottom: Platform.OS === "ios" ? 20 : 0,
          left: 20,
          right: 20,
          elevation: 0,
          borderRadius: 30,
          height: 60,
          backgroundColor: "#4A148C",
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.25,
          shadowRadius: 10,
          paddingBottom: 0,
        },
        tabBarBackground: () => (
          <BlurView
            tint="dark"
            intensity={30}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 30,
            }}
          />
        ),
        tabBarActiveTintColor: "#FFD93D",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.5)",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          paddingBottom: 5,
        },
      }}
    >
      <Tabs.Screen
        name="meditation"
        options={{
          title: "Meditate",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="meditation" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="mood"
        options={{
          title: "Mood",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="emoticon-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="book-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: "Support",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="help-circle-outline"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}
