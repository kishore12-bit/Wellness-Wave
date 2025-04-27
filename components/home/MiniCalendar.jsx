import React from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Text as PaperText } from "react-native-paper";
import { theme } from "./Theme";
import { getMoodColor } from "./utils";

const MiniCalendar = ({
  dates,
  onDatePress,
  selectedDate,
  moodData,
  isLoading,
}) => {
  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getMoodColorByDate = (date) => {
    // If it's today, highlight with yellow border
    if (isToday(date)) {
      return getMoodColor("happy"); // Use the happy color (yellow)
    }

    if (!moodData || moodData.length === 0) {
      return "rgba(173, 216, 230, 0.5)"; // Default light blue if no mood data
    }

    const mood = moodData.find((m) => m.date.getTime() === date.getTime());
    if (!mood || !mood.mood) {
      return "rgba(173, 216, 230, 0.5)"; // Default light blue if no mood for this date
    }

    // Use the same color function as in MoodStatistics
    return getMoodColor(mood.mood);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={theme.colors.primary} size="small" />
        <PaperText style={styles.loadingText}>Loading...</PaperText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.calendarContainer}>
        {dates.map((date) => {
          const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const dayName = dayNames[date.getDay()];
          const todayDate = isToday(date);

          return (
            <View key={date.getTime()} style={styles.calendarItem}>
              {/* Circle */}
              <TouchableOpacity
                style={[
                  styles.circle,
                  {
                    backgroundColor: getMoodColorByDate(date),
                  },
                  todayDate && styles.todayCircle,
                  selectedDate &&
                    date.getTime() === selectedDate.getTime() && {
                      backgroundColor: theme.colors.primary,
                      borderWidth: 2,
                      borderColor: "#FFFFFF",
                    },
                ]}
                onPress={() => onDatePress(date)}
              />

              {/* Date number */}
              <PaperText
                style={[styles.dateText, todayDate && styles.todayText]}
              >
                {date.getDate()}
              </PaperText>

              {/* Day name */}
              <PaperText
                style={[styles.dayLabel, todayDate && styles.todayText]}
              >
                {dayName}
              </PaperText>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 10,
  },
  calendarContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
    paddingHorizontal: 10,
  },
  calendarItem: {
    alignItems: "center",
    width: "14%",
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  todayCircle: {
    borderWidth: 3,
    borderColor: "#FFD93D", // Yellow border for today
  },
  dateText: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 2,
  },
  dayLabel: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.9,
  },
  todayText: {
    color: "#FFD93D", // Yellow text for today
    fontWeight: "bold",
  },
  loadingContainer: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: theme.colors.text,
    fontSize: 14,
  },
});

export default MiniCalendar;
