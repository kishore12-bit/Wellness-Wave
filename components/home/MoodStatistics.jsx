import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Card, IconButton, Text as PaperText } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "./Theme";
import { getMoodColor, getMoodEmoji } from "./utils";
import { getTodaysMood, getWeeklyMoodHistory } from "../mood/MoodFirebase";

const MoodStatistics = ({
  dates,
  visible,
  onClose,
  userId,
  moodData,
  onRefresh,
}) => {
  const [todaysMood, setTodaysMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [weeklyMoodData, setWeeklyMoodData] = useState(moodData || []);

  useEffect(() => {
    // Update local state when prop changes
    if (moodData && moodData.length > 0 && currentWeekOffset === 0) {
      setWeeklyMoodData(moodData);
    }
  }, [moodData, currentWeekOffset]);

  useEffect(() => {
    let isMounted = true;

    if (visible && userId && isMounted && !loading) {
      console.log("Fetching today's mood...");
      fetchTodaysMood();
    }

    return () => {
      isMounted = false;
    };
  }, [visible, userId]);

  const fetchTodaysMood = async () => {
    if (!userId || loading) return;

    try {
      setLoading(true);
      console.log("Fetching today's mood for user:", userId);
      const result = await getTodaysMood(userId);

      if (result.success && result.data) {
        setTodaysMood(result.data);
        console.log("Today's mood fetched successfully");
      } else if (result.success) {
        console.log("No mood found for today");
        setTodaysMood(null);
      }
    } catch (error) {
      console.error("Error fetching today's mood:", error);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousWeek = async () => {
    const newOffset = currentWeekOffset - 1;
    setCurrentWeekOffset(newOffset);

    // Fetch data for the previous week
    if (userId) {
      try {
        setLoading(true);
        console.log(`Fetching mood data for week offset: ${newOffset}`);

        const result = await getWeeklyMoodHistory(userId, dates, newOffset);

        if (result.success) {
          setWeeklyMoodData(result.data);
          console.log("Previous week's mood data fetched successfully");
        } else {
          console.error(
            "Failed to fetch previous week's mood data:",
            result.error
          );
        }
      } catch (error) {
        console.error("Error fetching previous week's mood data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const goToNextWeek = async () => {
    if (currentWeekOffset < 0) {
      const newOffset = currentWeekOffset + 1;
      setCurrentWeekOffset(newOffset);

      // If returning to current week, use the data from props
      if (newOffset === 0 && moodData) {
        setWeeklyMoodData(moodData);
        return;
      }

      // Otherwise fetch data for the next week
      if (userId) {
        try {
          setLoading(true);
          console.log(`Fetching mood data for week offset: ${newOffset}`);

          const result = await getWeeklyMoodHistory(userId, dates, newOffset);

          if (result.success) {
            setWeeklyMoodData(result.data);
            console.log("Next week's mood data fetched successfully");
          } else {
            console.error(
              "Failed to fetch next week's mood data:",
              result.error
            );
          }
        } catch (error) {
          console.error("Error fetching next week's mood data:", error);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const formatWeekRange = () => {
    // Get the start and end dates of the current week being displayed
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 6 + currentWeekOffset * 7); // Go back 6 days from today + offset
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Go forward 6 days from start

    // Format the dates
    const startFormatted = startOfWeek.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const endFormatted = endOfWeek.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    return `${startFormatted} - ${endFormatted}`;
  };

  if (!visible) return null;

  // Process the mood data for the chart
  const chartData =
    weeklyMoodData && weeklyMoodData.length > 0
      ? weeklyMoodData.map((item) => {
          const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const dayName = dayNames[item.date.getDay()];

          // If we have mood data for this date
          if (item.mood && item.value) {
            return {
              date: item.date,
              day: dayName,
              mood: item.mood,
              height: item.value * 30, // Scale the height based on mood value (1-5)
              value: item.value,
            };
          }

          // No mood data for this date
          return {
            date: item.date,
            day: dayName,
            mood: null,
            height: 0,
            value: 0,
          };
        })
      : [];

  return (
    <Card style={styles.statisticsCard}>
      <Card.Title
        title="Weekly Mood Statistics"
        titleStyle={styles.cardTitle}
      />
      <IconButton
        icon="close"
        size={20}
        onPress={onClose}
        style={styles.closeButton}
      />
      <Card.Content style={styles.cardContent}>
        {/* Today's Mood Section */}
        <View style={styles.todaysMoodContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.todaysMoodTitle}>Today's Mood</Text>
            <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
              <MaterialCommunityIcons
                name="refresh"
                size={18}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={theme.colors.primary} size="small" />
          ) : todaysMood ? (
            <View style={styles.todaysMoodContent}>
              <View
                style={[
                  styles.moodCircle,
                  {
                    backgroundColor: getMoodColor(
                      todaysMood.moodLabel.toLowerCase()
                    ),
                  },
                ]}
              >
                <Text style={styles.moodEmoji}>
                  {getMoodEmoji(todaysMood.moodLabel.toLowerCase())}
                </Text>
              </View>

              <View style={styles.moodInfo}>
                <Text style={styles.moodLabel}>{todaysMood.moodLabel}</Text>
                <Text style={styles.moodTime}>Logged at {todaysMood.time}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noMoodText}>No mood logged today</Text>
          )}
        </View>

        <View style={styles.divider} />

        {/* Weekly Chart Navigation */}
        <View style={styles.weekNavigation}>
          <TouchableOpacity style={styles.navButton} onPress={goToPreviousWeek}>
            <MaterialCommunityIcons
              name="chevron-left"
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>

          <Text style={styles.weekRangeText}>{formatWeekRange()}</Text>

          <TouchableOpacity
            style={[
              styles.navButton,
              currentWeekOffset === 0 && styles.disabledNavButton,
            ]}
            onPress={goToNextWeek}
            disabled={currentWeekOffset === 0}
          >
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={
                currentWeekOffset === 0
                  ? "rgba(255, 217, 61, 0.5)"
                  : theme.colors.primary
              }
            />
          </TouchableOpacity>
        </View>

        {/* Weekly Chart */}
        <Text style={styles.weeklyChartTitle}>Weekly Overview</Text>
        <View style={styles.chartContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={theme.colors.primary} size="large" />
              <Text style={styles.loadingText}>Loading mood data...</Text>
            </View>
          ) : chartData.length > 0 ? (
            chartData.map((data) => (
              <View key={data.date.getTime()} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    data.mood
                      ? {
                          height: data.height,
                          backgroundColor: getMoodColor(data.mood),
                        }
                      : styles.emptyBar,
                  ]}
                >
                  {data.mood && (
                    <Text style={styles.moodEmoji}>
                      {getMoodEmoji(data.mood)}
                    </Text>
                  )}
                </View>
                <PaperText style={styles.dayLabel}>{data.day}</PaperText>
              </View>
            ))
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>
                No mood data available for this week
              </Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  statisticsCard: {
    backgroundColor: "#4A148C",
    borderRadius: 15,
    marginTop: 30,
    marginBottom: 75,
    marginHorizontal: -16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "bold",
  },
  cardContent: {
    paddingHorizontal: 0,
    paddingBottom: 20,
  },
  todaysMoodContainer: {
    padding: 15,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  todaysMoodTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  refreshButton: {
    padding: 5,
  },
  todaysMoodContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  moodCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  moodInfo: {
    flex: 1,
  },
  moodLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 5,
  },
  moodTime: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.8,
  },
  noMoodText: {
    fontSize: 16,
    color: theme.colors.text,
    opacity: 0.7,
    fontStyle: "italic",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 15,
    marginBottom: 15,
  },
  weekNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  navButton: {
    padding: 5,
  },
  disabledNavButton: {
    opacity: 0.5,
  },
  weekRangeText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "bold",
  },
  weeklyChartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 200,
    paddingTop: 20,
    width: "100%",
  },
  barContainer: {
    alignItems: "center",
    width: "14%",
  },
  bar: {
    width: "70%",
    borderRadius: 20,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 5,
    minWidth: 25,
    minHeight: 30,
  },
  emptyBar: {
    width: "70%",
    height: 30,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    minWidth: 25,
  },
  moodEmoji: {
    fontSize: 16,
    marginTop: 5,
  },
  dayLabel: {
    marginTop: 5,
    color: theme.colors.text,
    fontSize: 12,
  },
  closeButton: {
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 150,
    width: "100%",
  },
  loadingText: {
    marginTop: 10,
    color: theme.colors.text,
    fontSize: 14,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 150,
    width: "100%",
  },
  noDataText: {
    color: theme.colors.text,
    fontSize: 14,
    fontStyle: "italic",
    opacity: 0.7,
  },
});

export default MoodStatistics;
