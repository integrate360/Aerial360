import React, { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Appbar, Avatar, Divider, List, Button, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderComponent from '../Header/HeaderComponent';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import fonts from '../FontFamily/FontFamily';
import { GetUsers, DeleteUser } from '../Api/Allapi'; // Import the DeleteUser function
import UserContext from '../../context/UserContext';
import Toast from 'react-native-toast-message';

const ProfileScreen = ({ hide }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigation = useNavigation();
  const { userId, token, email, logout } = useContext(UserContext); // Assuming you have a logout function in context
  const [fullName, setFullName] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [medicalCondition, setMedicalCondition] = useState('');
  const [image, setImage] = useState('');

  // Fetch user data on focus
  useFocusEffect(
    useCallback(() => {
      // Avoid fetching if userId or token is missing
      if (userId && token) {
        getUserData();
      }
    }, [userId, token])
  );

  const getUserData = () => {
    setRefreshing(true);
    GetUsers(userId, token)
      .then(res => {
        setFullName(res?.name || 'N/A');
        setImage(res?.image || '');
        setEmergencyContact(res?.emergencyPhone || 'N/A');
        setMedicalCondition(res?.medicalCondition || 'N/A');
      })
      .finally(() => setRefreshing(false));
  };

  const handleDeleteAccount = async () => {
    // Show confirmation dialog first
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            Toast.show({
              type: 'info',
              text1: 'Cancelled',
              text2: 'Account deletion was cancelled',
            });
          }
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              const response = await DeleteUser(userId, token);

              if (response.message === "User removed") {
                // Show success toast
                Toast.show({
                  type: 'success',
                  text1: 'Account Deleted',
                  text2: 'Your account has been successfully deleted.',
                });

                // Wait for toast to show, then navigate
                setTimeout(() => {
                  // Clear any stored data and logout
                  AsyncStorage.clear();
                  logout(); // Call your logout function
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  });
                }, 1500);
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Deletion Failed',
                  text2: 'Failed to delete account. Please try again.',
                });
              }
            } catch (error) {
              console.error("Delete error:", error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || "Failed to delete account. Please try again.",
              });
            } finally {
              setIsDeleting(false);
              setDeleteModalVisible(false);
            }
          }
        }
      ]
    );
  };

  const userProfile = useMemo(
    () => (
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={getUserData} />
        }>
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <View>
            <Avatar.Image
              size={110}
              style={{
                elevation: 10,
                backgroundColor: '#fff',
              }}
              source={{
                uri:
                  image ||
                  'https://thumbs.dreamstime.com/b/default-avatar-profile-image-vector-social-media-user-icon-potrait-182347582.jpg',
              }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: -10,
                borderRadius: 15,
                padding: 3,
              }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ProfileEdit')}>
                <Avatar.Icon
                  size={30}
                  icon="pencil"
                  style={{
                    backgroundColor: '#fff',
                  }}
                  color="#6200EE"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <Text style={styles.userName}>{fullName}</Text>
        <Text
          style={{
            fontSize: 12,
            color: '#000',
            textAlign: 'center',
            marginBottom: 10,
            bottom: 10,
            fontFamily: fonts.regular,
          }}>
          {email}
        </Text>
        <List.Item
          style={styles.listItem}
          title="Medical Condition"
          description={medicalCondition}
          descriptionStyle={{ fontSize: 16, fontFamily: fonts.regular }}
          titleStyle={{ fontFamily: fonts.regular, fontSize: 18 }}
          left={() => (
            <Avatar.Icon size={40} icon="medical-bag" style={{ left: 10 }} />
          )}
        />
        <List.Item
          style={styles.listItem}
          title="Emergency Contact Number"
          titleStyle={{ fontFamily: fonts.regular, fontSize: 18 }}
          descriptionStyle={{ fontSize: 16, fontFamily: fonts.regular }}
          description={emergencyContact}
          left={() => (
            <Avatar.Icon size={40} icon="phone-alert" style={{ left: 10 }} />
          )}
        />
        <List.Item
          style={styles.listItem}
          title="Bookings"
          onPress={() => navigation.navigate('Booking')}
          titleStyle={{ fontFamily: fonts.regular, fontSize: 18 }}
          left={() => (
            <Avatar.Icon size={40} icon="calendar-check" style={{ left: 10 }} />
          )}
        />
        <List.Item
          style={styles.listItem}
          title="Packages"
          onPress={() => navigation.navigate('UserPackages')}
          titleStyle={{ fontFamily: fonts.regular, fontSize: 18 }}
          left={() => (
            <Avatar.Icon size={40} icon="package" style={{ left: 10 }} />
          )}
        />
        <List.Item
          style={styles.listItem}
          title="Delete My Account"
          onPress={() => setDeleteModalVisible(true)}
          titleStyle={{ fontFamily: fonts.regular, fontSize: 18, color: '#FF3B30' }}
          left={() => (
            <Avatar.Icon
              size={40}
              icon="delete"
              style={{ left: 10, backgroundColor: 'rgba(255, 59, 48, 0.1)' }}
              color="#FF3B30"
            />
          )}
        />

        {/* Delete Account Confirmation Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={deleteModalVisible}
          onRequestClose={() => !isDeleting && setDeleteModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Delete Account</Text>
              </View>
              <View style={styles.modalContent}>
                <Avatar.Icon
                  size={60}
                  icon="alert-circle"
                  style={styles.warningIcon}
                  color="#FF9500"
                />
                <Text style={styles.warningText}>
                  Are you sure you want to delete your account?
                </Text>
                <Text style={styles.subText}>
                  This action cannot be undone. All your data will be permanently deleted.
                </Text>
              </View>
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  style={[styles.modalButton, styles.cancelButton]}
                  labelStyle={styles.cancelButtonText}
                  onPress={() => setDeleteModalVisible(false)}
                  disabled={isDeleting}>
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  style={[styles.modalButton, styles.deleteButton]}
                  labelStyle={styles.deleteButtonText}
                  onPress={handleDeleteAccount}
                  disabled={isDeleting}>
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    "Delete Account"
                  )}
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    ),
    [refreshing, fullName, medicalCondition, emergencyContact, deleteModalVisible, isDeleting],
  );

  return (
    <>
      <HeaderComponent hide={hide} />
      <View style={{ flex: 1 }}>{userProfile}</View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    color: '#000',
    textAlign: 'center',
    marginTop: 5,
    bottom: 10,
    fontFamily: fonts.regular,
  },
  listItem: {
    marginHorizontal: 10,
    backgroundColor: '#fff',
    elevation: 2,
    borderRadius: 10,
    marginVertical: 5,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.medium,
    color: '#000',
  },
  modalContent: {
    padding: 20,
    alignItems: 'center',
  },
  warningIcon: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    marginBottom: 15,
  },
  warningText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    textAlign: 'center',
    marginBottom: 10,
    color: '#000',
  },
  subText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    textAlign: 'center',
    color: '#666',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  cancelButton: {
    borderColor: '#6200EE',
  },
  cancelButtonText: {
    color: '#6200EE',
    fontFamily: fonts.medium,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    color: 'white',
    fontFamily: fonts.medium,
  },
});

export default ProfileScreen;