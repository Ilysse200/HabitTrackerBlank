import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CATEGORIES = [
  { id: 'health', name: 'Health', icon: 'fitness', color: '#4CAF50' },
  { id: 'productivity', name: 'Productivity', icon: 'briefcase', color: '#2196F3' },
  { id: 'learning', name: 'Learning', icon: 'book', color: '#9C27B0' },
  { id: 'mindfulness', name: 'Mindfulness', icon: 'heart', color: '#E91E63' },
  { id: 'social', name: 'Social', icon: 'people', color: '#FF9800' },
  { id: 'creative', name: 'Creative', icon: 'brush', color: '#795548' },
  { id: 'finance', name: 'Finance', icon: 'card', color: '#607D8B' },
  { id: 'other', name: 'Other', icon: 'ellipsis-horizontal', color: '#9E9E9E' },
];

const FREQUENCIES = [
  { id: 'daily', name: 'Daily', description: 'Every day' },
  { id: 'weekly', name: 'Weekly', description: 'Once per week' },
  { id: 'weekdays', name: 'Weekdays', description: 'Monday to Friday' },
  { id: 'weekends', name: 'Weekends', description: 'Saturday and Sunday' },
];

export default function AddHabitScreen({ navigation }) {
  const [habitName, setHabitName] = useState('');
  const [habitDescription, setHabitDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('health');
  const [selectedFrequency, setSelectedFrequency] = useState('daily');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateHabit = async () => {
    if (!habitName.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    setIsLoading(true);
    
    try {
      const newHabit = {
        id: Date.now().toString(),
        name: habitName.trim(),
        description: habitDescription.trim(),
        category: selectedCategory,
        frequency: selectedFrequency,
        createdAt: new Date().toISOString(),
        completedDates: [],
      };

      // Get existing habits
      const existingHabitsStr = await AsyncStorage.getItem('habits');
      const existingHabits = existingHabitsStr ? JSON.parse(existingHabitsStr) : [];
      
      // Add new habit
      const updatedHabits = [...existingHabits, newHabit];
      await AsyncStorage.setItem('habits', JSON.stringify(updatedHabits));

      Alert.alert(
        'Success!',
        'Your new habit has been created successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setHabitName('');
              setHabitDescription('');
              setSelectedCategory('health');
              setSelectedFrequency('daily');
              // Navigate back to dashboard
              navigation.navigate('Dashboard');
            },
          },
        ]
      );
    } catch (error) {
      console.log('Error creating habit:', error);
      Alert.alert('Error', 'Failed to create habit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (categoryId) => {
    const category = CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category : CATEGORIES[0];
  };

  const getFrequencyInfo = (frequencyId) => {
    const frequency = FREQUENCIES.find(freq => freq.id === frequencyId);
    return frequency ? frequency : FREQUENCIES[0];
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create New Habit</Text>
          <Text style={styles.subtitle}>
            Build a positive routine that sticks with you
          </Text>
        </View>

        {/* Habit Name Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Habit Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Drink 8 glasses of water"
            value={habitName}
            onChangeText={setHabitName}
            maxLength={50}
          />
          <Text style={styles.charCount}>{habitName.length}/50</Text>
        </View>

        {/* Description Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add more details about your habit..."
            value={habitDescription}
            onChangeText={setHabitDescription}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
          <Text style={styles.charCount}>{habitDescription.length}/200</Text>
        </View>

        {/* Category Selection */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoriesContainer}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    selectedCategory === category.id && styles.categoryCardSelected,
                    { borderColor: category.color }
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                    <Ionicons name={category.icon} size={24} color="#fff" />
                  </View>
                  <Text style={[
                    styles.categoryName,
                    selectedCategory === category.id && styles.categoryNameSelected
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Frequency Selection */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Frequency</Text>
          <View style={styles.frequencyContainer}>
            {FREQUENCIES.map((frequency) => (
              <TouchableOpacity
                key={frequency.id}
                style={[
                  styles.frequencyCard,
                  selectedFrequency === frequency.id && styles.frequencyCardSelected
                ]}
                onPress={() => setSelectedFrequency(frequency.id)}
              >
                <View style={styles.frequencyHeader}>
                  <Text style={[
                    styles.frequencyName,
                    selectedFrequency === frequency.id && styles.frequencyNameSelected
                  ]}>
                    {frequency.name}
                  </Text>
                  {selectedFrequency === frequency.id && (
                    <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
                  )}
                </View>
                <Text style={styles.frequencyDescription}>
                  {frequency.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preview Card */}
        <View style={styles.previewSection}>
          <Text style={styles.label}>Preview</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View style={styles.previewInfo}>
                <Text style={styles.previewName}>
                  {habitName || 'Your habit name'}
                </Text>
                <Text style={styles.previewDescription}>
                  {habitDescription || 'Your habit description'}
                </Text>
              </View>
              <View style={[
                styles.previewIcon,
                { backgroundColor: getCategoryIcon(selectedCategory).color }
              ]}>
                <Ionicons 
                  name={getCategoryIcon(selectedCategory).icon} 
                  size={20} 
                  color="#fff" 
                />
              </View>
            </View>
            <View style={styles.previewFooter}>
              <Text style={styles.previewFrequency}>
                {getFrequencyInfo(selectedFrequency).name} • {getCategoryIcon(selectedCategory).name}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Create Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.createButton, (!habitName.trim() || isLoading) && styles.createButtonDisabled]}
          onPress={handleCreateHabit}
          disabled={!habitName.trim() || isLoading}
        >
          {isLoading ? (
            <Text style={styles.createButtonText}>Creating...</Text>
          ) : (
            <>
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.createButtonText}>Create Habit</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  inputSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  categoryCard: {
    alignItems: 'center',
    padding: 16,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryCardSelected: {
    borderWidth: 2,
    backgroundColor: '#f0f8ff',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  categoryNameSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  frequencyContainer: {
    gap: 12,
  },
  frequencyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  frequencyCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  frequencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  frequencyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  frequencyNameSelected: {
    color: '#007AFF',
  },
  frequencyDescription: {
    fontSize: 14,
    color: '#666',
  },
  previewSection: {
    marginHorizontal: 20,
    marginBottom: 100,
  },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  previewInfo: {
    flex: 1,
    marginRight: 12,
  },
  previewName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  previewDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  previewFrequency: {
    fontSize: 12,
    color: '#999',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});