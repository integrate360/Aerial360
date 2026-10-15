import React, {createContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMe } from '../Screens/Api/Allapi';

const UserContext = createContext({
  email: null,
  password: null,
  userId: null,
  token: null,
  user: null,
  locations: null,
  saveEmail: () => {},
  saveUser: () => {},
  savePassword: () => {},
  saveUserId: () => {},
  saveToken: () => {},
  getToken: () => {},
  getUserId: () => {},
  logout: () => {},
  saveLocation: () => {},
  refreshData: () => {}, // Add refreshData function
});

export const UserProvider = ({children}) => {
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [locations, setLocations] = useState(null);

  useEffect(() => {
    loadUserDataFromStorage();
  }, []);

  const loadUserDataFromStorage = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      console.log('storedToken', storedToken);
      const storedLocations = await AsyncStorage.getItem('locations');

      if (storedLocations) setLocations(storedLocations);

      if (storedToken) {
        setToken(storedToken);
        // Dynamically fetch user if token exists
        try {
          const userData = await getMe(storedToken);
          if (userData) {
            setUser(userData);
            setEmail(userData.email);
            setUserId(userData._id);
            // Optionally, we could set phone, emergencyContact or other properties
          }
        } catch (fetchErr) {
          console.error("Failed to fetch dynamic user data:", fetchErr);
        }
      }
    } catch (error) {
      console.error('Error loading data from AsyncStorage:', error);
    }
  };

  // New refreshData function
  const refreshData = async () => {
    await loadUserDataFromStorage(); // Refresh data by calling loadUserDataFromStorage
  };

  const saveEmail = async newEmail => {
    try {
      setEmail(newEmail);
    } catch (error) {
      console.error('Error saving email:', error);
    }
  };

  const saveUser = async newUser => {
    try {
      setUser(newUser);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const savePassword = async newPassword => {
    try {
      setPassword(newPassword);
    } catch (error) {
      console.error('Error saving password:', error);
    }
  };

  const saveLocation = async newLocation => {
    try {
      await AsyncStorage.setItem('locations', newLocation);
      setLocations(newLocation);
    } catch (error) {
      console.error('Error saving location to AsyncStorage:', error);
    }
  };

  const saveUserId = async newUserId => {
    try {
      setUserId(newUserId);
    } catch (error) {
      console.error('Error saving userId:', error);
    }
  };

  const saveToken = async newToken => {
    try {
      await AsyncStorage.setItem('token', newToken);
      setToken(newToken);
    } catch (error) {
      console.error('Error saving token to AsyncStorage:', error);
    }
  };

  const getToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      return storedToken;
    } catch (error) {
      console.error('Error fetching token from AsyncStorage:', error);
      return null;
    }
  };

  const getUserId = async () => {
    try {
      return userId;
    } catch (error) {
      console.error('Error fetching userId:', error);
      return null;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      // Clean up legacy storage items as well to ensure full logout
      await AsyncStorage.removeItem('email');
      await AsyncStorage.removeItem('password');
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('user');
      
      setEmail(null);
      setPassword(null);
      setUser(null);
      setUserId(null);
      setToken(null);
    } catch (error) {
      console.error('Error removing data from AsyncStorage:', error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        email,
        password,
        userId,
        user,
        token,
        locations,
        saveLocation,
        saveEmail,
        saveUser,
        savePassword,
        saveUserId,
        saveToken,
        getToken,
        getUserId,
        logout,
        refreshData, // Provide refreshData in context
      }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
