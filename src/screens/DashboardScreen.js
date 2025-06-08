import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [habits, setHabits] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const habitsData = await AsyncStorage.getItem('habits');
      const userDataStr = await AsyncStorage.getItem('userData');
      
      if (habitsData) {
        setHabits(JSON.parse(habitsData));
      }
      if (userDataStr) {
        setUserData(JSON.parse(userDataStr));
      }
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const toggleHabitCompletion = async (habitId) => {
    const today = new Date().toDateString();
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const completedDates = habit.completedDates || [];
        const isCompletedToday = completedDates.includes(today);
        
        return {
          ...habit,
          completedDates: isCompletedToday
            ? completedDates.filter(date => date !== today)
            : [...completedDates, today],
        };
      }
      return habit;
    });
    
    setHabits(updatedHabits);
    await AsyncStorage.setItem('habits', JSON.stringify(updatedHabits));
  };

  const getStreakCount = (habit) => {
    if (!habit.completedDates || habit.completedDates.length === 0) return 0;
    
    const dates = habit.completedDates.sort((a, b) => new Date(b) - new Date(a));
    let streak = 0;
    let currentDate = new Date();
    
    for (let dateStr of dates) {
      const date = new Date(dateStr);
      const diffTime = Math.abs(currentDate - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= streak + 1) {
        streak++;
        currentDate = date;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getCompletionRate = (habit) => {
    if (!habit.completedDates || habit.createdAt === undefined) return 0;
    
    const createdDate = new Date(habit.createdAt);
    const today = new Date();
    const daysSinceCreated = Math.ceil((today - createdDate) / (1000 * 60 * 60 * 24)) + 1;
    
    return Math.round((habit.completedDates.length / daysSinceCreated) * 100);
  };

  const isCompletedToday = (habit) => {
    const today = new Date().toDateString();
    return habit.completedDates && habit.completedDates.includes(today);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getTodayStats = () => {
    const completedToday = habits.filter(habit => isCompletedToday(habit)).length;
    const totalHabits = habits.length;
    return { completed: completedToday, total: totalHabits };
  };

  const stats = getTodayStats();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {getGreeting()}, {userData?.firstName || 'User'}!
        </Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          </View>
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed Today</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="trending-up" size={24} color="#2196F3" />
          </View>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Habits</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="flame" size={24} color="#FF9800" />
          </View>
          <Text style={styles.statNumber}>
            {habits.length > 0 ? Math.max(...habits.map(h => getStreakCount(h))) : 0}
          </Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
      </View>

      {/* Progress Overview */}
      {habits.length > 0 && (
        <View style={styles.progressContainer}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {stats.completed} of {stats.total} habits completed
          </Text>
        </View>
      )}

      {/* Habits List */}
      <View style={styles.habitsContainer}>
        <Text style={styles.sectionTitle}>Your Habits</Text>
        
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptySubtitle}>
              Start building healthy habits by adding your first one!
            </Text>
          </View>
        ) : (
          habits.map((habit) => {
            const streak = getStreakCount(habit);
            const completionRate = getCompletionRate(habit);
            const completedToday = isCompletedToday(habit);
            
            return (
              <View key={habit.id} style={styles.habitCard}>
                <View style={styles.habitHeader}>
                  <View style={styles.habitInfo}>
                    <Text style={styles.habitName}>{habit.name}</Text>
                    <Text style={styles.habitDescription}>{habit.description}</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.checkButton,
                      completedToday && styles.checkButtonCompleted
                    ]}
                    onPress={() => toggleHabitCompletion(habit.id)}
                  >
                    <Ionicons
                      name={completedToday ? "checkmark" : "checkmark-outline"}
                      size={24}
                      color={completedToday ? "#fff" : "#007AFF"}
                    />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.habitStats}>
                  <View style={styles.habitStat}>
                    <Ionicons name="flame" size={16} color="#FF9800" />
                    <Text style={styles.habitStatText}>{streak} day streak</Text>
                  </View>
                  <View style={styles.habitStat}>
                    <Ionicons name="trending-up" size={16} color="#4CAF50" />
                    <Text style={styles.habitStatText}>{completionRate}% completion</Text>
                  </View>
                </View>
                
                <View style={styles.habitFrequency}>
                  <Text style={styles.frequencyText}>
                    {habit.frequency || 'Daily'} • {habit.category || 'General'}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  progressContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginVertical: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  habitsContainer: {
    marginBottom: 20,
  },
  habitCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  habitInfo: {
    flex: 1,
    marginRight: 12,
  },
  habitName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  habitDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  checkButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonCompleted: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  habitStats: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  habitStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  habitStatText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  habitFrequency: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  frequencyText: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});