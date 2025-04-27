import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CalendarPicker from "react-native-calendar-picker";
import { useUser } from "@clerk/clerk-expo";
import { getJournalEntries } from "./JournalFirebase";

const JournalEntriesTab = () => {
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedEntryId, setExpandedEntryId] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, [user?.id]);

  const fetchEntries = async () => {
    if (!user?.id) {
      setEntries([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await getJournalEntries(user.id, 20); // Get up to 20 entries

      if (result.success) {
        setEntries(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch journal entries");
      }
    } catch (err) {
      console.error("Error fetching journal entries:", err);
      setError("Failed to load journal entries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDisplayDate = (date) => {
    if (!date) return "All Entries";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Update the normalizeDate function to handle both Date objects and date strings
  const normalizeDate = (date) => {
    if (typeof date === "string") {
      // Handle date string in MM/DD/YYYY format
      const [month, day, year] = date.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    // Handle Date object
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const onDateSelect = (date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const clearDateFilter = () => {
    setSelectedDate(null);
  };

  const filteredEntries = selectedDate
    ? entries.filter((entry) => {
        const normalizedEntryDate = normalizeDate(entry.date);
        const normalizedSelectedDate = normalizeDate(selectedDate);
        console.log(
          "Entry date:",
          normalizedEntryDate,
          "Selected date:",
          normalizedSelectedDate
        ); // For debugging
        return normalizedEntryDate === normalizedSelectedDate;
      })
    : entries;

  const refreshEntries = () => {
    fetchEntries();
  };

  const toggleEntryExpansion = (entryId) => {
    setExpandedEntryId(expandedEntryId === entryId ? null : entryId);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD93D" />
        <Text style={styles.loadingText}>Loading journal entries...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={60} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshEntries}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowCalendar(true)}
        >
          <MaterialCommunityIcons
            name="calendar"
            size={20}
            color="#FFD93D"
            style={styles.calendarIcon}
          />
          <Text style={styles.datePickerText}>
            {formatDisplayDate(selectedDate)}
          </Text>
        </TouchableOpacity>

        {selectedDate && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearDateFilter}
          >
            <MaterialCommunityIcons
              name="close-circle"
              size={20}
              color="#FFD93D"
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.refreshButton} onPress={refreshEntries}>
          <MaterialCommunityIcons name="refresh" size={20} color="#FFD93D" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>Select Date</Text>
              <TouchableOpacity
                onPress={() => setShowCalendar(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color="#FFD93D"
                />
              </TouchableOpacity>
            </View>

            <CalendarPicker
              onDateChange={onDateSelect}
              selectedDayColor="#FFD93D"
              selectedDayTextColor="#2D1B69"
              todayBackgroundColor="rgba(255, 217, 61, 0.2)"
              todayTextStyle={{ color: "#FFD93D" }}
              textStyle={{ color: "white" }}
              previousTitle="Previous"
              nextTitle="Next"
              previousTitleStyle={{ color: "#FFD93D", fontSize: 14 }}
              nextTitleStyle={{ color: "#FFD93D", fontSize: 14 }}
              monthTitleStyle={{ color: "white", fontWeight: "bold" }}
              yearTitleStyle={{ color: "white", fontWeight: "bold" }}
              dayLabelsWrapper={{ borderBottomWidth: 0, borderTopWidth: 0 }}
              customDatesStyles={entries.map((entry) => {
                const [month, day, year] = entry.date.split("/");
                return {
                  date: new Date(year, month - 1, day),
                  style: { backgroundColor: "rgba(255, 217, 61, 0.3)" },
                  textStyle: { color: "white", fontWeight: "bold" },
                };
              })}
              width={300}
              headerWrapperStyle={styles.calendarHeaderWrapper}
            />
          </View>
        </View>
      </Modal>

      {filteredEntries.length > 0 ? (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {filteredEntries.map((entry) => (
            <TouchableOpacity
              key={entry.id}
              style={styles.entryCard}
              activeOpacity={0.7}
            >
              <View style={styles.headerContainer}>
                <View style={styles.dateContainer}>
                  <Text style={styles.date}>{entry.date}</Text>
                  <Text style={styles.time}>{entry.time}</Text>
                </View>
                <View style={styles.emotionsContainer}>
                  {entry.selectedEmotions.map((emotion) => (
                    <View key={emotion} style={styles.emotionTag}>
                      <Text style={styles.emotionText}>{emotion}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.contentContainer}>
                <View style={styles.promptContainer}>
                  <Text style={styles.promptLabel}>Prompt:</Text>
                  <Text style={styles.promptText}>{entry.prompt}</Text>
                </View>

                <View style={styles.entryContainer}>
                  <Text style={styles.entryLabel}>Entry:</Text>
                  <Text
                    style={[
                      styles.entryText,
                      expandedEntryId === entry.id && styles.expandedEntryText,
                    ]}
                    numberOfLines={expandedEntryId === entry.id ? undefined : 3}
                  >
                    {entry.journalEntry}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.chevronContainer,
                  expandedEntryId === entry.id &&
                    styles.chevronContainerExpanded,
                ]}
                onPress={() => toggleEntryExpansion(entry.id)}
              >
                <MaterialCommunityIcons
                  name={
                    expandedEntryId === entry.id ? "chevron-up" : "chevron-down"
                  }
                  size={24}
                  color="#FFD93D"
                />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="notebook-outline"
            size={60}
            color="#FFD93D"
          />
          <Text style={styles.emptyText}>
            {selectedDate
              ? "No journal entries found for this date"
              : "No journal entries yet. Start journaling!"}
          </Text>
          {selectedDate && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={clearDateFilter}
            >
              <Text style={styles.resetButtonText}>Show All Entries</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2D1B69",
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#4A148C",
    borderRadius: 8,
    margin: 16,
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  calendarIcon: {
    marginRight: 8,
  },
  datePickerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  clearButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  calendarContainer: {
    width: "90%",
    backgroundColor: "#4A148C",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    alignItems: "center",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },
  calendarHeaderWrapper: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: "center",
    justifyContent: "space-between",
  },
  calendarTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  scrollContainer: {
    padding: 16,
    paddingTop: 8,
  },
  entryCard: {
    backgroundColor: "#4A148C",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  dateContainer: {
    marginRight: 12,
  },
  date: {
    color: "#FFD93D",
    fontSize: 14,
    fontWeight: "bold",
  },
  time: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    marginTop: 4,
  },
  emotionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
    justifyContent: "flex-end",
  },
  emotionTag: {
    backgroundColor: "rgba(255, 217, 61, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
    marginBottom: 4,
  },
  emotionText: {
    color: "#FFD93D",
    fontSize: 12,
  },
  contentContainer: {
    borderLeftWidth: 2,
    borderLeftColor: "rgba(255, 217, 61, 0.3)",
    paddingLeft: 12,
    marginLeft: 4,
  },
  promptContainer: {
    marginBottom: 12,
  },
  promptLabel: {
    color: "#FFD93D",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  promptText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 13,
    fontStyle: "italic",
    lineHeight: 18,
  },
  entryContainer: {
    marginBottom: 8,
  },
  entryLabel: {
    color: "#FFD93D",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  entryText: {
    color: "white",
    fontSize: 14,
    lineHeight: 20,
  },
  expandedEntryText: {
    marginBottom: 8,
  },
  chevronContainer: {
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 217, 61, 0.2)",
    marginTop: 12,
  },
  chevronContainerExpanded: {
    backgroundColor: "rgba(255, 217, 61, 0.1)",
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: "#4A148C",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFD93D",
  },
  resetButtonText: {
    color: "#FFD93D",
    fontSize: 14,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2D1B69",
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2D1B69",
    padding: 20,
  },
  errorText: {
    color: "#FFFFFF",
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#FFD93D",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "#2D1B69",
    fontWeight: "bold",
  },
  refreshButton: {
    padding: 10,
    marginLeft: 10,
  },
});

export default JournalEntriesTab;
