import React from "react";
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  View,
} from "react-native";
import { Searchbar } from "react-native-paper";
import {
  Provider as PaperProvider,
  DefaultTheme,
  Surface,
  Text as PaperText,
} from "react-native-paper";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#FFD93D",
    background: "#2D1B69",
    text: "#FFFFFF",
    placeholder: "#BDBDBD",
    chip: "#4A148C",
    chipText: "#FFFFFF",
  },
};

const articles = [
  {
    id: "1",
    category: "Mindfulness & Meditation",
    title: "Headspace",
    description: "Guided meditation & mindfulness",
    url: "https://www.headspace.com/",
  },
  {
    id: "2",
    category: "Mindfulness & Meditation",
    title: "Calm",
    description: "Sleep, meditation & relaxation",
    url: "https://www.calm.com/",
  },
  {
    id: "3",
    category: "Stress Management",
    title: "Verywell Mind",
    description: "Mental health articles & self-help",
    url: "https://www.verywellmind.com/",
  },
  {
    id: "4",
    category: "Self-Care",
    title: "Tiny Buddha",
    description: "Wisdom on self-care & happiness",
    url: "https://tinybuddha.com/",
  },
];

const hotlines = [
  {
    id: "1",
    name: "National Suicide Prevention Lifeline",
    phone: "988",
    description: "24/7 crisis support",
  },
  {
    id: "2",
    name: "Crisis Text Line",
    description: "Text HOME to 741741",
    phone: "741741",
  },
  {
    id: "3",
    name: "NAMI Helpline",
    phone: "1-800-950-6264",
    description: "Mental health information and referrals",
  },
];

const directories = [
  {
    id: "1",
    name: "BetterHelp",
    description: "Online therapy platform",
    url: "https://www.betterhelp.com/",
  },
  {
    id: "2",
    name: "Talkspace",
    description: "Professional counseling online",
    url: "https://www.talkspace.com/",
  },
  {
    id: "3",
    name: "Psychology Today Therapist Finder",
    description: "Find local therapists",
    url: "https://www.psychologytoday.com/us/therapists",
  },
];

export default function SupportScreen() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const onChangeSearch = (query) => setSearchQuery(query);

  // Filter resources based on search query
  const filteredResources = {
    articles: articles.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    hotlines: hotlines.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    directories: directories.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  };

  // Combine all resources into a single array with headers
  const combinedResources = [
    { type: "header", id: "header-articles", title: "Articles" },
    ...filteredResources.articles.map((item) => ({
      type: "article",
      key: `article-${item.id}`,
      ...item,
    })),
    { type: "header", id: "header-hotlines", title: "Hotlines" },
    ...filteredResources.hotlines.map((item) => ({
      type: "hotline",
      key: `hotline-${item.id}`,
      ...item,
    })),
    { type: "header", id: "header-directories", title: "Directories" },
    ...filteredResources.directories.map((item) => ({
      type: "directory",
      key: `directory-${item.id}`,
      ...item,
    })),
  ];

  const renderItem = ({ item }) => {
    if (item.type === "header") {
      return <PaperText style={styles.categoryTitle}>{item.title}</PaperText>;
    }

    return (
      <TouchableOpacity
        onPress={() => {
          if (item.url) {
            Linking.openURL(item.url);
          } else if (item.phone) {
            Linking.openURL(`tel:${item.phone}`);
          }
        }}
      >
        <ThemedView style={styles.item}>
          <PaperText style={styles.itemName}>
            {item.title || item.name}
          </PaperText>
          <PaperText style={styles.itemDescription}>
            {item.description}
          </PaperText>
        </ThemedView>
      </TouchableOpacity>
    );
  };

  return (
    <PaperProvider theme={theme}>
      <Surface style={styles.container}>
        <PaperText style={styles.title}>Resources & Support</PaperText>
        <Searchbar
          placeholder="Search resources..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchBar}
          placeholderTextColor={theme.colors.placeholder}
          iconColor={theme.colors.placeholder}
          inputStyle={{ color: theme.colors.text }}
        />
        <FlatList
          data={combinedResources}
          renderItem={renderItem}
          keyExtractor={(item) => item.key || item.id}
          contentContainerStyle={styles.list}
        />
      </Surface>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.text,
    marginTop: 45,
    marginBottom: 20,
    textAlign: "center",
  },
  searchBar: {
    marginBottom: 20,
    backgroundColor: theme.colors.chip,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 10,
  },
  list: {
    marginBottom: 20,
  },
  item: {
    backgroundColor: theme.colors.chip,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.chipText,
    marginBottom: 5,
  },
  itemDescription: {
    fontSize: 14,
    color: theme.colors.chipText,
  },
});
