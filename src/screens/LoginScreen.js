import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
const { width, height } = Dimensions.get("window");

export default function LoginScreen({navigation, onLogin }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // useEffect(()=>{
  //   fetch('http://localhost:3000/auth/register')
  //   .then(res =>res.json())
  //   .then(data =>)
  // })

  // SIMPLE ADDITION: Define admin emails
  const adminEmails = [
    "admin@habittracker.com",
    "admin@example.com",
    "superadmin@habittracker.com",
    // Add more admin emails as needed
  ];

  // SIMPLE HELPER: Check if email is admin
  const isAdminEmail = (email) => {
    return adminEmails.includes(email.toLowerCase());
  };

  // Input validation (unchanged)
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Registration-specific validations
    if (!isLoginMode) {
      if (!formData.fullName) {
        newErrors.fullName = "Full Names is required";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit with admin check
  const handleSubmit = () => {
    if (!validateForm()) return;
    const { email, password, fullName } = formData;
    const url = isLoginMode
      ? "http://192.168.0.103:3000/users/login"
      : "http://192.168.0.103:3000/users/register";

    const body = isLoginMode
      ? { email, password }
      : { email, password, name: fullName };

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Something went wrong");
        }
        return res.json();
      })

      .then((data) => {
        const userRole = isAdminEmail(email) ? "admin" : "user";
        const userData = {
          email,
          fullName: data.fullName || fullName,
        };

        if (isLoginMode) {
          onLogin(userData);
        } else {
          toggleMode(); //Login after registration
        }

        Alert.alert(
          "Success!",
          `${isLoginMode ? "Logged in" : "Account created successfully"}`
        );
      })
      .catch((err) => {
        Alert.alert("Error", err.message);
      });
  };

  // Update form data (unchanged)
  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Toggle between login and registration (unchanged)
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setErrors({});
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>HabitTracker</Text>
          <Text style={styles.subtitle}>
            {isLoginMode ? "Welcome back!" : "Create your account"}
          </Text>
          {/* OPTIONAL: Show admin email hint */}
          {/* <View style={styles.adminHint}> */}
          {/* <Text style={styles.hintText}>
              💡 Use admin@habittracker.com to access admin features
            </Text> */}
        </View>
        {/* </View> */}

        <View style={styles.form}>
          {/* Registration Fields */}
          {!isLoginMode && (
            <>
              <View style={styles.row}>
                <View
                  style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}
                >
                  <TextInput
                    style={[styles.input, errors.fullName && styles.inputError]}
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChangeText={(text) => updateFormData("fullName", text)}
                    autoCapitalize="words"
                  />
                  {errors.fullName && (
                    <Text style={styles.errorText}>{errors.fullName}</Text>
                  )}
                </View>
              </View>
            </>
          )}

          {/* Email Input with admin indicator */}
          <View style={styles.inputContainer}>
            <View style={styles.emailContainer}>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Enter email"
                value={formData.email}
                onChangeText={(text) => updateFormData("email", text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              {/* SIMPLE ADDITION: Show admin indicator */}
              {formData.email && isAdminEmail(formData.email) && (
                <View style={styles.adminBadge}>
                  <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
                  <Text style={styles.adminBadgeText}>Admin</Text>
                </View>
              )}
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Password Input (unchanged) */}
          <View style={styles.inputContainer}>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  errors.password && styles.inputError,
                ]}
                placeholder="Password"
                value={formData.password}
                onChangeText={(text) => updateFormData("password", text)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
            {isLoginMode && (
              <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPassword")}
              >
                <Text style={styles.forgotPass}>Forgot Password?</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Confirm Password (Registration only, unchanged) */}
          {!isLoginMode && (
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  errors.confirmPassword && styles.inputError,
                ]}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(text) => updateFormData("confirmPassword", text)}
                secureTextEntry={true}
                autoCapitalize="none"
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>
          )}

          {/* Submit Button (unchanged) */}
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>
              {isLoginMode ? "Login" : "Create Account"}
            </Text>
          </TouchableOpacity>

          {/* Toggle Mode (unchanged) */}
          <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
            <Text style={styles.toggleText}>
              {isLoginMode
                ? "Don't have an account? Sign up"
                : "Already have an account? Login"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    minHeight: height,
  },
  
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: width > 400 ? 32 : 28,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: width > 400 ? 18 : 16,
    color: "#666",
    textAlign: "center",
  },
  // NEW: Admin hint styles
  adminHint: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#fff3cd",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffeaa7",
  },
  hintText: {
    fontSize: 12,
    color: "#856404",
    textAlign: "center",
  },
  form: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  // NEW: Email container for admin badge
  emailContainer: {
    position: "relative",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  inputError: {
    borderColor: "#ff4444",
  },
  // NEW: Admin badge styles
  adminBadge: {
    position: "absolute",
    right: 15,
    top: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadgeText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
    marginLeft: 4,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 15,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  toggleButton: {
    marginTop: 20,
    alignItems: "center",
  },
  toggleText: {
    color: "#007AFF",
    fontSize: 16,
  },
  forgotPass: {
    marginTop: 7,
    color: "#007AFF",
    fontSize: 16,
  },
});
