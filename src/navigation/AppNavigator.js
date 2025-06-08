import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AddHabitScreen from '../screens/AddHabitScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Protected Tab Navigator (after login)
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'AddHabit') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ title: 'My Habits' }}
      />
      <Tab.Screen 
        name="AddHabit" 
        component={AddHabitScreen} 
        options={{ title: 'Add Habit' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// Main App Navigator with Authentication Flow
export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef(null);
  const isCheckingRef = useRef(false); // Prevent multiple simultaneous checks

  // Check authentication status on app start and periodically
  useEffect(() => {
    checkAuthStatus();
    
    // Check auth status every 2 seconds to detect logout
    intervalRef.current = setInterval(checkAuthStatus, 2000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Clear interval when user logs out to prevent unnecessary checks
  useEffect(() => {
    if (!isAuthenticated && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else if (isAuthenticated && !intervalRef.current) {
      // Restart interval when user logs back in
      intervalRef.current = setInterval(checkAuthStatus, 2000);
    }
  }, [isAuthenticated]);

  const checkAuthStatus = async () => {
    // Prevent multiple simultaneous checks
    if (isCheckingRef.current) {
      return;
    }
    
    isCheckingRef.current = true;
    
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const isAuth = !!userToken;
      
      console.log('Checking auth status:', { 
        currentAuth: isAuthenticated, 
        isAuth: isAuth, 
        userToken: userToken || null 
      });
      
      if (isAuth !== isAuthenticated) {
        console.log('Auth status changed, updating...');
        setIsAuthenticated(isAuth);
      }
    } catch (error) {
      console.log('Error checking auth status:', error);
    } finally {
      if (isLoading) {
        setIsLoading(false);
      }
      isCheckingRef.current = false;
    }
  };

  // Handle login
  const handleLogin = async (userData) => {
    try {
      await AsyncStorage.setItem('userToken', 'authenticated');
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setIsAuthenticated(true);
    } catch (error) {
      console.log('Error saving auth data:', error);
    }
  };

  // Handle logout - this function isn't used but kept for compatibility
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setIsAuthenticated(false);
    } catch (error) {
      console.log('Error during logout:', error);
    }
  };

  if (isLoading) {
    return null; // You could add a loading screen here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Authentication Stack
          <Stack.Screen name="Login">
            {props => <LoginScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        ) : (
          // Main App Stack (Protected Routes)
          <Stack.Screen name="Main">
            {props => <MainTabNavigator {...props} onLogout={handleLogout} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}