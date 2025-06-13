import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreateBlogScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title for your blog post.');
      return false;
    }
    if (!content.trim()) {
      Alert.alert('Validation Error', 'Please enter content for your blog post.');
      return false;
    }
    if (title.trim().length < 5) {
      Alert.alert('Validation Error', 'Title must be at least 5 characters long.');
      return false;
    }
    if (content.trim().length < 50) {
      Alert.alert('Validation Error', 'Content must be at least 50 characters long.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Get current user data
      const userData = await AsyncStorage.getItem('userData');
      const user = userData ? JSON.parse(userData) : { name: 'Admin' };

      // Create new blog post
      const newBlog = {
        id: generateId(),
        title: title.trim(),
        summary: summary.trim() || null,
        content: content.trim(),
        author: user.name || 'Admin',
        createdAt: new Date().toISOString(),
        image: imageUrl.trim() || null,
        tags: tags.trim() ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      };

      // Get existing blogs
      const existingBlogs = await AsyncStorage.getItem('blogPosts');
      const blogs = existingBlogs ? JSON.parse(existingBlogs) : [];

      // Add new blog
      blogs.push(newBlog);

      // Save updated blogs
      await AsyncStorage.setItem('blogPosts', JSON.stringify(blogs));

      Alert.alert(
        'Success',
        'Blog post created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.log('Error creating blog:', error);
      Alert.alert('Error', 'Failed to create blog post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (title || summary || content || tags || imageUrl) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          {
            text: 'Keep Editing',
            style: 'cancel',
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Title <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter blog post title..."
              placeholderTextColor="#999"
              maxLength={100}
            />
            <Text style={styles.charCount}>{title.length}/100</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Summary (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={summary}
              onChangeText={setSummary}
              placeholder="Brief summary of the blog post..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              maxLength={200}
            />
            <Text style={styles.charCount}>{summary.length}/200</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Content <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.contentArea]}
              value={content}
              onChangeText={setContent}
              placeholder="Write your blog post content here..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={10}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{content.length} characters</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Image URL (Optional)</Text>
            <TextInput
              style={styles.input}
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor="#999"
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags (Optional)</Text>
            <TextInput
              style={styles.input}
              value={tags}
              onChangeText={setTags}
              placeholder="habits, motivation, wellness (separate with commas)"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Publish</Text>
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
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  contentArea: {
    height: 200,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});