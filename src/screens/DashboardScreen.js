import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const [habits, setHabits] = useState([]);
  const [todayStats, setTodayStats] = useState({
    completed: 0,
    total: 0,
    streak: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState(null);

  // This will run every time the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadHabits();
    }, [])
  );

  const loadHabits = async () => {
    try {
      setIsLoading(true);
      const storedHabits = await AsyncStorage.getItem("habits");
      console.log("Loading habits from storage:", storedHabits); // Debug log

      if (storedHabits) {
        const parsedHabits = JSON.parse(storedHabits);
        console.log("Parsed habits:", parsedHabits); // Debug log
        setHabits(parsedHabits);
        calculateTodayStats(parsedHabits);
      } else {
        console.log("No habits found in storage, using sample data");
        // Initialize with empty array instead of sample data
        setHabits([]);
        setTodayStats({ completed: 0, total: 0, streak: 0 });
      }
    } catch (error) {
      console.log("Error loading habits:", error);
      Alert.alert("Error", "Failed to load habits. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const toggleFilter = () => {
    const filterSequence = [
      "health",
      "Work",
      "productivity",
      "Learning",
      "Mindfulness",
    ];
    const currentIndex = filterSequence.indexOf(filterCategory);
    const nextIndex = (currentIndex + 1) % (filterSequence.length + 1); // +1 to include null (show all)
    setFilterCategory(
      nextIndex === filterSequence.length ? null : filterSequence[nextIndex]
    );
  };

  const calculateTodayStats = (habitsList) => {
    if (habitsList.length === 0) {
      setTodayStats({ completed: 0, total: 0, streak: 0 });
      return;
    }

    const completed = habitsList.filter((habit) => habit.completedToday).length;
    const total = habitsList.length;
    const avgStreak =
      habitsList.reduce((sum, habit) => sum + habit.streak, 0) /
      habitsList.length;

    setTodayStats({
      completed,
      total,
      streak: Math.round(avgStreak || 0),
    });
  };

  const toggleHabitCompletion = async (habitId) => {
    try {
      const updatedHabits = habits.map((habit) => {
        if (habit.id === habitId) {
          const newCompletedStatus = !habit.completedToday;
          return {
            ...habit,
            completedToday: newCompletedStatus,
            streak: newCompletedStatus
              ? habit.streak + 1
              : Math.max(0, habit.streak - 1),
          };
        }
        return habit;
      });

      setHabits(updatedHabits);
      calculateTodayStats(updatedHabits);
      await AsyncStorage.setItem("habits", JSON.stringify(updatedHabits));

      // Show feedback
      const updatedHabit = updatedHabits.find((h) => h.id === habitId);
      const message = updatedHabit.completedToday
        ? `Great job! You've completed ${updatedHabit.name}!`
        : `${updatedHabit.name} marked as incomplete`;

      Alert.alert("Habit Updated", message);
    } catch (error) {
      console.log("Error updating habit:", error);
      Alert.alert("Error", "Failed to update habit. Please try again.");
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const renderStatCard = (title, value, subtitle, icon, color) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  const renderHabitCard = (habit) => (
    <TouchableOpacity
      key={habit.id}
      style={[
        styles.habitCard,
        habit.completedToday && styles.habitCardCompleted,
      ]}
      onPress={() => toggleHabitCompletion(habit.id)}
      activeOpacity={0.7}
    >
      <View style={styles.habitHeader}>
        <View
          style={[styles.habitIcon, { backgroundColor: habit.color + "20" }]}
        >
          <Ionicons name={habit.icon} size={24} color={habit.color} />
        </View>
        <View style={styles.habitInfo}>
          <Text style={styles.habitName}>{habit.name}</Text>
          <Text style={styles.habitCategory}>
            {habit.category || "General"}
          </Text>
        </View>
        <View style={styles.habitStatus}>
          <Ionicons
            name={habit.completedToday ? "checkmark-circle" : "ellipse-outline"}
            size={32}
            color={habit.completedToday ? "#27ae60" : "#bdc3c7"}
          />
        </View>
      </View>

      <View style={styles.habitDetails}>
        <View style={styles.habitTarget}>
          <Text style={styles.habitTargetText}>
            Target: {habit.target || 1} {habit.unit || "time(s)"}
          </Text>
        </View>
        <View style={styles.habitStreak}>
          <Ionicons name="flame" size={16} color="#f39c12" />
          <Text style={styles.habitStreakText}>
            {habit.streak || 0} day streak
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const completionPercentage =
    todayStats.total > 0
      ? Math.round((todayStats.completed / todayStats.total) * 100)
      : 0;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="hourglass" size={48} color="#666" />
        <Text style={styles.loadingText}>Loading your habits...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}!</Text>
        <Text style={styles.headerSubtitle}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>

      {habits.length > 0 ? (
        <>
          {/* Progress Overview */}
          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>Today's Progress</Text>
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressPercentage}>
                  {completionPercentage}%
                </Text>
                <Text style={styles.progressText}>
                  {todayStats.completed} of {todayStats.total} habits completed
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${completionPercentage}%` },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsSection}>
            <View style={styles.statsRow}>
              {renderStatCard(
                "Completed",
                todayStats.completed,
                "today",
                "checkmark-circle",
                "#27ae60"
              )}
              {renderStatCard(
                "Total Habits",
                todayStats.total,
                "active",
                "list-circle",
                "#3498db"
              )}
            </View>
            <View style={styles.statsRow}>
              {renderStatCard(
                "Average Streak",
                todayStats.streak,
                "days",
                "flame",
                "#f39c12"
              )}
              {renderStatCard(
                "Success Rate",
                `${completionPercentage}%`,
                "today",
                "trending-up",
                "#9b59b6"
              )}
            </View>
          </View>

          {/* Habits List */}
          <View style={styles.habitsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Habits</Text>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={toggleFilter}
              >
                <Ionicons name="filter" size={20} color="#666" />
                <Text style={{ fontSize: 12, color: "#666", marginLeft: 4 }}>
                  {filterCategory || "All"}
                </Text>
              </TouchableOpacity>
            </View>
            {habits
              .filter((h) => !filterCategory || h.category === filterCategory)
              .map(renderHabitCard)}
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="add-circle-outline" size={64} color="#bdc3c7" />
          <Text style={styles.emptyStateTitle}>No habits yet</Text>
          <Text style={styles.emptyStateSubtitle}>
            Tap the "Add Habit" tab to create your first habit and start
            building better routines!
          </Text>
          <TouchableOpacity style={styles.emptyStateButton}>
            <Text style={styles.emptyStateButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#7f8c8d",
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  alertBox: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 25,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 15,
  },
  progressCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#27ae60",
  },
  progressText: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "right",
    flex: 1,
    marginLeft: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#ecf0f1",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#27ae60",
    borderRadius: 4,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    flex: 1,
    marginHorizontal: 5,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  statTitle: {
    fontSize: 12,
    color: "#7f8c8d",
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 10,
    color: "#bdc3c7",
  },
  habitsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "white",
  },
  habitCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  habitCardCompleted: {
    backgroundColor: "#f8fff8",
    borderWidth: 1,
    borderColor: "#27ae60",
  },
  habitHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  habitIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  habitCategory: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  habitStatus: {
    marginLeft: 10,
  },
  habitDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  habitTarget: {
    flex: 1,
  },
  habitTargetText: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  habitStreak: {
    flexDirection: "row",
    alignItems: "center",
  },
  habitStreakText: {
    fontSize: 14,
    color: "#f39c12",
    marginLeft: 4,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  emptyStateButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyStateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
