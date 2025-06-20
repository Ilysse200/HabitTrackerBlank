import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const [userData, setUserData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem("userData");
      if (data) {
        const parsed = JSON.parse(data);
        setUserData(parsed);

        if (parsed.role === "admin") {
          const res = await fetch("http://192.168.1.119:3000/users");
          const json = await res.json();
          if (json.success) {
            setAllUsers(json.data);
          }
        }
      }
    } catch (error) {
      console.log("Error loading user data or users:", error);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("userData");
            console.log("Logout successful - tokens removed");
          } catch (error) {
            console.log("Error during logout:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={50} color="#007AFF" />
        </View>
        <Text style={styles.name}>
          {userData ? `${userData.name}`.trim() : "User"}
        </Text>
        <Text style={styles.email}>
          {userData ? userData.email : "user@example.com"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={24} color="#666" />
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color="#666" />
          <Text style={styles.menuText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="information-circle-outline" size={24} color="#666" />
          <Text style={styles.menuText}>About</Text>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* 👇 Admin-only panel */}
      {userData?.role === "admin" && allUsers.length > 0 && (
        <View style={styles.adminPanel}>
          <Text style={styles.adminTitle}>All Registered Users</Text>
          {allUsers.map((user) => (
            <View key={user.id} style={styles.userRow}>
              <Ionicons name="person-circle" size={20} color="#007AFF" />
              <Text style={styles.userName}>{user.name}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#ff4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  profileHeader: {
    backgroundColor: "white",
    alignItems: "center",
    paddingVertical: 30,
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 20,
    paddingBottom: 10,
    color: "#333",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
    color: "#333",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 10,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: "#ff4444",
  },
  logoutText: {
    fontSize: 16,
    color: "#ff4444",
    fontWeight: "bold",
    marginLeft: 10,
  },
  adminPanel: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderColor: "#e0e0e0",
    borderWidth: 1,
  },
  adminTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  userName: {
    marginLeft: 10,
    fontSize: 15,
    color: "#444",
  },
});
