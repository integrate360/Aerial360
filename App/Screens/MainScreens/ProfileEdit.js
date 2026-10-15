import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { GetUsers } from '../Api/Allapi';
import UserContext from '../../context/UserContext';
import ImagePicker from 'react-native-image-crop-picker'; // Import ImagePicker
import Icon from 'react-native-vector-icons/FontAwesome5';
import { UpDateAllUser } from '../Api/Allapi';
import fonts from '../FontFamily/FontFamily';
import { Colors } from '../Config/Config';
import Toast from 'react-native-toast-message';

const ProfileEditScreen = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [medicalCondition, setMedicalCondition] = useState('');
  const [profileImage, setProfileImage] = useState(); // New state for profile image
  const navigation = useNavigation();
  const { userId, token, user, refreshData } = useContext(UserContext);

  const Updateusers = async () => {
    let validationErrors = {};

    if (!phone || phone.length !== 10) {
      validationErrors.phonenumber = "Phone number must be exactly 10 digits";
    }

    if (!emergencyContact || emergencyContact.length !== 10) {
      validationErrors.emergencyPhone = "Emergency contact must be exactly 10 digits";
    }

    if (Object.keys(validationErrors).length > 0) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: Object.values(validationErrors).join('\n'),
      });
      return;
    }

    UpDateAllUser(
      userId,
      token,
      fullName,
      email,
      phone,
      emergencyContact,
      medicalCondition,
      profileImage,
    )
      .then(async res => {
        if (res?.isError) {
          const errorMsg = res.errors
            ? Object.values(res.errors).join('\n')
            : res.message || 'Failed to update profile. Please try again.';
          Toast.show({
            type: 'error',
            text1: 'Update Failed',
            text2: errorMsg,
          });
        } else if (res) {
          Toast.show({
            type: 'success',
            text1: 'Profile Updated',
            text2: res.message || 'Your profile has been updated successfully',
          });
          await refreshData();
          navigation.goBack();
        } else {
          Toast.show({
            type: 'error',
            text1: 'Update Failed',
            text2: 'Failed to update profile. Please try again.',
          });
        }
      })
      .catch(err => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'An error occurred while updating profile',
        });
      });
  };

  useEffect(() => {
    GetUsers(userId, token).then(res => {
      // Set the state fields based on the API response
      setFullName(res?.name);
      setEmail(res?.email);
      setPhone(res?.phone);
      setEmergencyContact(res?.emergencyPhone);
      setMedicalCondition(res?.medicalCondition);
    });
  }, [userId, token]);

  const handleImagePick = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      mediaType: 'photo',
    }).then(image => {
      const randomName = `${Date.now()}.${image.mime.split('/').pop()}`;
      setProfileImage({
        uri: image.path,
        name: randomName,
        type: image.mime,
      });

      // ADD THIS SUCCESS TOAST:
      Toast.show({
        type: 'success',
        text1: 'Image Selected',
        text2: 'Profile image updated successfully',
      });
    }).catch(error => {
      if (error.code !== 'E_PICKER_CANCELLED') {
        // ADD THIS ERROR TOAST IF USER DIDN'T CANCEL:
        Toast.show({
          type: 'error',
          text1: 'Image Error',
          text2: 'Failed to select image',
        });
      }
    });
  };
  return (
    <LinearGradient
      colors={['#f8f8f8', '#f8f8f8', '#f8f8f8']}
      style={styles.gradientContainer}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#777" />
            {/* <Text style={styles.backButton}>←</Text> */}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={Updateusers}>
            <Text style={styles.saveButton}>SAVE</Text>
          </TouchableOpacity>
        </View>

        <ScrollView>
          <View style={styles.profileImageSection}>
            <View style={styles.profileImage}>
              {/* Display selected image or the existing image */}
              {profileImage?.uri || user?.image ? (
                <Image
                  source={{ uri: profileImage?.uri || user?.image }}
                  style={styles.profileImageContent}
                />
              ) : (
                <Icon name="camera" size={30} color="#fff" />
              )}
            </View>
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={handleImagePick}>
              <Text style={styles.changePhotoText}>CHANGE PHOTO</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            {/* Full Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <View style={styles.inputBlurContainer}>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter full name"
                  placeholderTextColor="#666"
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <View style={styles.inputBlurContainer}>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(text) => setEmail(text.toLowerCase())}
                  placeholder="Enter email"
                  placeholderTextColor="#666"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Phone Number Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <View style={styles.inputBlurContainer}>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={(text) => {
                    const numericText = text.replace(/[^0-9]/g, '');
                    setPhone(numericText);
                  }}
                  placeholder="Enter phone number"
                  placeholderTextColor="#666"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>

            {/* Emergency Contact Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Emergency Contact</Text>
              <View style={styles.inputBlurContainer}>
                <TextInput
                  style={styles.input}
                  value={emergencyContact}
                  onChangeText={(text) => {
                    const numericText = text.replace(/[^0-9]/g, '');
                    setEmergencyContact(numericText);
                  }}
                  placeholder="Enter emergency contact"
                  placeholderTextColor="#666"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>

            {/* Medical Conditions Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Medical Conditions</Text>
              <View style={styles.inputBlurContainer}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={medicalCondition}
                  onChangeText={setMedicalCondition}
                  placeholder="Describe any medical conditions..."
                  placeholderTextColor="#666"
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(124, 123, 123, 0.1)',
  },
  backButton: {
    color: 'black',
    fontSize: 24,
  },
  headerTitle: {
    color: '#000',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: fonts.regular,
  },
  saveButton: {
    color: '#FF6B6B',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: fonts.regular,
  },
  profileImageSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageContent: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  profileImageText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 12,
    backgroundColor: 'rgba(39, 39, 39, 0.8)',
  },
  changePhotoText: {
    color: 'white',
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#8E8E93',
    marginBottom: 8,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  inputBlurContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(210, 210, 211, 0.8)', // Added semi-transparent background
  },
  input: {
    padding: 12,
    color: 'black',
    fontSize: 16,
    backgroundColor: 'transparent',
    fontFamily: fonts.regular,
  },
});

export default ProfileEditScreen;
