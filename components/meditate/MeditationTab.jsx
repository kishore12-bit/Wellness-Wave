import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import Modal from "react-native-modal";

const meditationSessions = {
  "Stress Relief": [
    {
      id: "sr1",
      title: "10-Minute Meditation For Stress",
      duration: "10 min",
      description:
        "A quick and effective meditation to help reduce daily stress",
      thumbnail: "https://img.youtube.com/vi/z6X5oEIg6Ak/hqdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=z6X5oEIg6Ak",
    },
    {
      id: "sr2",
      title: "20 Minute Guided Meditation for Reducing Anxiety and Stress",
      duration: "20 min",
      description: "A longer session for deep stress and anxiety relief",
      thumbnail: "https://img.youtube.com/vi/MIr3RsUWrdo/hqdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=MIr3RsUWrdo",
    },
    {
      id: "sr3",
      title: "Daily Calm | 10 Minute Mindfulness Meditation",
      duration: "10 min",
      description: "Be present and find calm through mindful awareness",
      thumbnail: "https://img.youtube.com/vi/ZToicYcHIOU/hqdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=ZToicYcHIOU",
    },
  ],
  Focus: [
    {
      id: "f1",
      title: "5 Minute Meditation for Focus",
      duration: "5 min",
      description: "Quick focus boost for busy moments",
      thumbnail: "https://img.youtube.com/vi/zSkFFW--Ma0/hqdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=zSkFFW--Ma0",
    },
    {
      id: "f2",
      title: "10 Minute Guided Meditation for Focus",
      duration: "10 min",
      description: "Enhance concentration and mental clarity",
      thumbnail: "https://img.youtube.com/vi/ausxoXBrmWs/hqdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=ausxoXBrmWs",
    },
    {
      id: "f3",
      title: "Ten Minute Mindfulness Guided Meditation for Focus",
      duration: "10 min",
      description: "Improve focus through mindfulness practice",
      thumbnail: "https://img.youtube.com/vi/o_SHRA0oxRQ/hqdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=o_SHRA0oxRQ",
    },
  ],
  Sleep: [
    {
      id: "s1",
      title: "Guided Sleep Meditation, Fall back asleep and stay asleep",
      duration: "varies",
      description: "Deep Sleep Meditation by Mindful Movement",
      thumbnail: "https://img.youtube.com/vi/RUvAsMmbyMo/hqdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=RUvAsMmbyMo",
    },
    {
      id: "s2",
      title: "Rainstorm Sounds for Relaxing, Focus or Deep Sleep",
      duration: "8 hours",
      description: "Nature White Noise for peaceful sleep",
      thumbnail: "https://img.youtube.com/vi/ZToicYcHIOU/hqdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=ZToicYcHIOU",
    },
    {
      id: "s3",
      title: "Deep Sleep Music: Delta Waves",
      duration: "8 hours",
      description: "Relaxing music with delta waves for deep sleep",
      thumbnail: "https://img.youtube.com/vi/6zGQSWib32E/hqdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=6zGQSWib32E",
    },
  ],
  Anxiety: [
    {
      id: "a1",
      title: "Guided Meditation for Anxiety & Stress",
      duration: "10 min",
      description: "Calm your mind with this gentle guided meditation",
      thumbnail: "https://img.youtube.com/vi/MIr3RsUWrdo/hqdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=MIr3RsUWrdo",
    },
    {
      id: "a2",
      title: "10 Minute Guided Meditation for Anxiety",
      duration: "10 min",
      description: "Find peace and reduce anxiety through guided practice",
      thumbnail: "https://img.youtube.com/vi/O-6f5wQXSu8/hqdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=O-6f5wQXSu8",
    },
    {
      id: "a3",
      title: "Calm Anxiety - Guided Meditation",
      duration: "varies",
      description: "Specialized meditation for anxiety relief",
      thumbnail: "https://img.youtube.com/vi/4pLUleLdwY4/hqdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=4pLUleLdwY4",
    },
  ],
  "Self-Love": [
    {
      id: "sl1",
      title: "Guided Meditation for Self-Love",
      duration: "varies",
      description: "Nurture self-love and inner peace",
      thumbnail: "https://img.youtube.com/vi/itZMM5gCboo/hqdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=itZMM5gCboo",
    },
    {
      id: "sl2",
      title: "Self-Love Meditation",
      duration: "10 min",
      description: "Develop self-compassion and acceptance",
      thumbnail: "https://img.youtube.com/vi/ZToicYcHIOU/hqdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=ZToicYcHIOU",
    },
    {
      id: "sl3",
      title: "Loving-Kindness Meditation",
      duration: "varies",
      description: "Traditional meditation for cultivating self-love",
      thumbnail: "https://img.youtube.com/vi/sz7cpV7ERsM/hqdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=sz7cpV7ERsM",
    },
  ],
};

const categories = ["All", ...Object.keys(meditationSessions)];

const MeditationTab = ({ selectedCategory, setSelectedCategory }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const fallbackThumbnail = "https://i.imgur.com/7WdsTPP.png";

  const getAllSessions = () => {
    return Object.values(meditationSessions).flat();
  };

  const filteredSessions =
    selectedCategory === "All"
      ? getAllSessions()
      : meditationSessions[selectedCategory] || [];

  const getYoutubeVideoId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const renderMeditationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.meditationCard}
      onPress={() => setSelectedVideo(item.videoUrl)}
    >
      <View style={styles.meditationImageContainer}>
        <Image
          source={{ uri: item.thumbnail }}
          style={styles.meditationImage}
          defaultSource={{ uri: fallbackThumbnail }}
          onError={(e) => {
            // If the thumbnail fails to load, the defaultSource will be used automatically
            console.log("Thumbnail load error:", e.nativeEvent.error);
          }}
        />
        <View style={styles.playButton}>
          <Ionicons name="play" size={20} color="#2D1B69" />
        </View>
      </View>
      <View style={styles.meditationInfo}>
        <Text style={styles.meditationTitle}>{item.title}</Text>
        <Text style={styles.meditationDuration}>{item.duration}</Text>
        <Text style={styles.meditationDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.selectedCategoryText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </View>

      <FlatList
        data={filteredSessions}
        renderItem={renderMeditationItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.meditationList}
      />

      <Modal
        isVisible={!!selectedVideo}
        onBackdropPress={() => setSelectedVideo(null)}
        onBackButtonPress={() => setSelectedVideo(null)}
        style={styles.modal}
      >
        <View style={styles.videoContainer}>
          <WebView
            source={{
              uri: `https://www.youtube.com/embed/${getYoutubeVideoId(
                selectedVideo || ""
              )}`,
            }}
            style={styles.video}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2D1B69",
  },
  categoryContainer: {
    marginVertical: 10,
    paddingLeft: 15,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#4A148C",
  },
  selectedCategory: {
    backgroundColor: "#FFD93D",
  },
  categoryText: {
    color: "white",
    fontWeight: "500",
  },
  selectedCategoryText: {
    color: "#2D1B69",
    fontWeight: "bold",
  },
  meditationList: {
    padding: 15,
  },
  meditationCard: {
    flexDirection: "row",
    backgroundColor: "#4A148C",
    borderRadius: 12,
    marginBottom: 15,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  meditationImageContainer: {
    position: "relative",
  },
  meditationImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  playButton: {
    position: "absolute",
    backgroundColor: "#FFD93D",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    top: "50%",
    left: "50%",
    marginLeft: -18,
    marginTop: -18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  meditationInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "center",
  },
  meditationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  meditationDuration: {
    fontSize: 14,
    color: "#FFD93D",
    marginBottom: 4,
  },
  meditationDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 20,
  },
  modal: {
    margin: 0,
    justifyContent: "center",
  },
  videoContainer: {
    height: 300,
    backgroundColor: "black",
    borderRadius: 10,
    overflow: "hidden",
  },
  video: {
    flex: 1,
  },
});

export default MeditationTab;
