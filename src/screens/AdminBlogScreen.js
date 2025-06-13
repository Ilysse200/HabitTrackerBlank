import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminBlogScreen({ navigation }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBlogs();
  }, []);

  // Reload blogs when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadBlogs();
    });
    return unsubscribe;
  }, [navigation]);

  const loadBlogs = async () => {
    try {
      const savedBlogs = await AsyncStorage.getItem('blogPosts');
      if (savedBlogs) {
        const blogData = JSON.parse(savedBlogs);
        const sortedBlogs = blogData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBlogs(sortedBlogs);
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.log('Error loading blogs:', error);
      Alert.alert('Error', 'Failed to load blog posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBlogs();
  };

  const handleDeleteBlog = (blogId, blogTitle) => {
    Alert.alert(
      'Delete Blog Post',
      `Are you sure you want to delete "${blogTitle}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteBlog(blogId),
        },
      ]
    );
  };

  const deleteBlog = async (blogId) => {
    try {
      const updatedBlogs = blogs.filter(blog => blog.id !== blogId);
      await AsyncStorage.setItem('blogPosts', JSON.stringify(updatedBlogs));
      setBlogs(updatedBlogs);
      Alert.alert('Success', 'Blog post deleted successfully');
    } catch (error) {
      console.log('Error deleting blog:', error);
      Alert.alert('Error', 'Failed to delete blog post');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateTitle = (title, maxLength = 40) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  const renderBlogItem = ({ item }) => (
    <View style={styles.blogCard}>
      <View style={styles.blogHeader}>
        <View style={styles.blogInfo}>
          <Text style={styles.blogTitle}>{truncateTitle(item.title)}</Text>
          <Text style={styles.blogDate}>Created: {formatDate(item.createdAt)}</Text>
          <Text style={styles.blogAuthor}>By: {item.author}</Text>
        </View>
        <View style={styles.blogActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => navigation.navigate('BlogDetail', { blog: item })}
          >
            <Ionicons name="eye" size={18} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigation.navigate('EditBlog', { blog: item })}
          >
            <Ionicons name="create" size={18} color="#FF9500" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteBlog(item.id, item.title)}
          >
            <Ionicons name="trash" size={18} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading blog posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateBlog')}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.createButtonText}>Create New Post</Text>
      </TouchableOpacity>

      {blogs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="library-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No Blog Posts</Text>
          <Text style={styles.emptySubtitle}>
            Create your first blog post to share valuable insights about habit building!
          </Text>
        </View>
      ) : (
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Manage Blog Posts ({blogs.length})</Text>
          <FlatList
            data={blogs}
            renderItem={renderBlogItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C759',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  listHeader: {
    flex: 1,
    paddingTop: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  blogCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  blogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  blogInfo: {
    flex: 1,
    marginRight: 16,
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  blogDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  blogAuthor: {
    fontSize: 12,
    color: '#666',
  },
  blogActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  viewButton: {
    backgroundColor: '#f0f8ff',
  },
  editButton: {
    backgroundColor: '#fff5e6',
  },
  deleteButton: {
    backgroundColor: '#ffe6e6',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
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