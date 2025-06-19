import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function BlogScreen({ navigation }) {
  const [blogs, setBlogs] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState("user");

  const fetchBlogs = async () => {
    try {
      const response = await fetch("http://192.168.1.119:3000/blog/getBlogs");
      //Response check to prevent parsing an error 
      if(!response.ok){
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(JSON.stringify(data, null, 2));

      // Add safety checks for the API response
      if (data && Array.isArray(data.data)) {
        setBlogs(data.data);
      } else if (data && Array.isArray(data)) {
        setBlogs(data);
      } else {
        console.log("API response doesn't contain expected blog array");
        setBlogs([]); // Set to empty array if no valid data
      }
    } catch (error) {
      console.log("Failed to fetch blogs:", error);
      setBlogs([]); // Set to empty array on error
      Alert.alert("Error", "Failed to load blog posts. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    checkUserRole();
    fetchBlogs();
  }, []);

  const checkUserRole = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        setUserRole(user.role || "user");
      }
    } catch (error) {
      console.log("Error checking user role:", error);
    }
  };

  // const loadBlogs = async () => {
  //   try {
  //     const savedBlogs = await AsyncStorage.getItem("blogPosts");
  //     if (savedBlogs) {
  //       const blogData = JSON.parse(savedBlogs);
  //       // Sort by creation date (newest first)
  //       const sortedBlogs = blogData.sort(
  //         (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  //       );
  //       setBlogs(Array.isArray(sortedBlogs) ? sortedBlogs : []);
  //     } else {
  //       // Initialize with sample blog posts
  //       const sampleBlogs = [
  //         {
  //           id: "1",
  //           title: "Building Better Habits: A Beginner's Guide",
  //           content:
  //             "Starting a new habit can be challenging, but with the right approach, you can make lasting changes. The key is to start small and be consistent...",
  //           author: "Katrina",
  //           createdAt: new Date().toISOString(),
  //           image: null,
  //           summary:
  //             "Learn the fundamentals of habit formation and how to build lasting positive changes in your life.",
  //         },
  //         {
  //           id: "2",
  //           title: "The Science Behind Habit Formation",
  //           content:
  //             "Research shows that habits are formed through a neurological loop consisting of a cue, routine, and reward. Understanding this process can help you...",
  //           author: "Katrina",
  //           createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
  //           image: null,
  //           summary:
  //             "Discover the psychological and neurological processes that drive habit formation.",
  //         },
  //       ];
  //       await AsyncStorage.setItem("blogPosts", JSON.stringify(sampleBlogs));
  //       setBlogs(sampleBlogs);
  //     }
  //   } catch (error) {
  //     console.log("Error loading blogs:", error);
  //     Alert.alert("Error", "Failed to load blog posts");
  //     setBlogs([]); // Set to empty array on error
  //   } finally {
  //     setLoading(false);
  //     setRefreshing(false);
  //   }
  // };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBlogs().then(()=> setRefreshing(false)); // 
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateContent = (content, maxLength = 120) => {
    if (!content || content.length <= maxLength) return content || "";
    return content.substring(0, maxLength) + "...";
  };

  const renderBlogItem = ({ item }) => (
    <TouchableOpacity
      style={styles.blogCard}
      onPress={() => navigation.navigate("BlogDetail", { blog: item })}
    >
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.blogImage} />
      )}
      <View style={styles.blogContent}>
        <Text style={styles.blogTitle}>{item.title || "Untitled"}</Text>
        <Text style={styles.blogSummary}>
          {item.summary || truncateContent(item.body || item.content)}
        </Text>
        <View style={styles.blogMeta}>
          <View style={styles.authorInfo}>
            <Ionicons name="person-circle" size={16} color="#666" />
            <Text style={styles.authorName}>
              {item.author?.name || "Unknown"}
            </Text>
          </View>
          <Text style={styles.blogDate}>
            {item.createdAt ? formatDate(item.createdAt) : "No date"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
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
      {userRole === "admin" && (
        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => navigation.navigate("AdminBlog")}
        >
          <Ionicons name="settings" size={20} color="#fff" />
          <Text style={styles.adminButtonText}>Manage Blog</Text>
        </TouchableOpacity>
      )}

      {/* Simplified condition - blogs is always an array now */}
      {blogs.length > 0 ? (
        <FlatList
          data={blogs}
          renderItem={renderBlogItem}
          keyExtractor={(item) => item.id || item._id || Math.random().toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="library-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No Blog Posts Yet</Text>
          <Text style={styles.emptySubtitle}>
            Check back later for helpful habit-building tips and insights!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  adminButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  adminButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  blogCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  blogImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  blogContent: {
    padding: 16,
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    lineHeight: 24,
  },
  blogSummary: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  blogMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorName: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
    fontWeight: "500",
  },
  blogDate: {
    fontSize: 12,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
});