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
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState("user");

  const fetchBlogs = async () => {
    try {
      const [userDataRaw, response] = await Promise.all([
        AsyncStorage.getItem("userData"),
        fetch("http://172.20.10.2:3000/blog/getBlogs"),
      ]);

      // Handle role
      if (userDataRaw) {
        const user = JSON.parse(userDataRaw);
        console.log("Parsed user role:", user.role);
        setUserRole(user.role || "user");
      }

      const data = await response.json();
      if (data && Array.isArray(data.data)) {
        setBlogs(data.data);
      } else {
        console.warn("Unexpected blog response:", data);
        setBlogs([]);
      }
    } catch (error) {
      console.error("Error loading blog posts or user role:", error);
      Alert.alert("Error", "Something went wrong while loading data.");
      setBlogs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBlogs();
  };

  useEffect(() => {
  const initializeScreen = async () => {
    setLoading(true); // ensures proper loading indicator

    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log("✅ ROLE:", parsedUser.role);
        setUserRole(parsedUser.role || "user");
      }
    } catch (error) {
      console.log("❌ Error reading user data:", error);
      setUserRole("user");
    }

    try {
      const res = await fetch("http://172.20.10.2:3000/blog/getBlogs");
      const data = await res.json();

      if (data && Array.isArray(data.data)) {
        setBlogs(data.data);
      } else {
        console.warn("Unexpected blog response:", data);
        setBlogs([]);
      }
    } catch (error) {
      console.error("❌ Blog fetch error:", error);
      Alert.alert("Error", "Something went wrong while loading blogs.");
      setBlogs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  initializeScreen();
}, []);


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
          {item.summary || item.body?.substring(0, 100) + "..."}
        </Text>
        <View style={styles.blogMeta}>
          <View style={styles.authorInfo}>
            <Ionicons name="person-circle" size={16} color="#666" />
            <Text style={styles.authorName}>
              {item.author?.name || "Unknown"}
            </Text>
          </View>
          <Text style={styles.blogDate}>
            {new Date(item.createdAt).toLocaleDateString()}
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

      {blogs.length > 0 ? (
        <FlatList
          data={blogs}
          renderItem={renderBlogItem}
          keyExtractor={(item) => item.id || Math.random().toString()}
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
            Check back later for habit-building insights!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: { marginTop: 10, fontSize: 16, color: "#666" },
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
  listContainer: { padding: 16 },
  blogCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
  blogContent: { padding: 16 },
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
