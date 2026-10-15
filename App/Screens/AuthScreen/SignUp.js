import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert, // Keep Alert for some cases
  Animated,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Colors } from '../Config/Config';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Register } from '../Api/Allapi';
import ImagePicker from 'react-native-image-crop-picker';
import fonts from '../FontFamily/FontFamily';
import Toast from 'react-native-toast-message'; // Import Toast

const { width, height } = Dimensions.get('window');

const TextInputField = ({
  placeholder,
  value,
  onChangeText,
  iconName,
  secureTextEntry,
  error,
  keyboardType = 'default',
  togglePasswordVisibility,
  isPasswordVisible,
  maxLength,
}) => (
  <View style={{ position: 'relative', marginBottom: 10 }}>
    <View style={styles.inputContainer}>
      <Icon name={iconName} style={styles.inputIcon} size={18} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#777"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        maxLength={maxLength}
      />
      {togglePasswordVisibility && (
        <TouchableOpacity
          style={styles.passwordToggle}
          onPress={togglePasswordVisibility}>
          <Icon
            name={isPasswordVisible ? 'eye' : 'eye-slash'}
            size={20}
            color="#777"
          />
        </TouchableOpacity>
      )}
    </View>
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>
);

const SignUp = () => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phonenumber, setPhonenumber] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState({});
  const [medicalcondition, setMedicalCondition] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add loading state

  const navigation = useNavigation();

  const cardPosition = useRef(new Animated.Value(300)).current;
  const imagePosition = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    Animated.timing(imagePosition, {
      toValue: 0,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    Animated.timing(cardPosition, {
      toValue: 0,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, []);

  const validateAndSignUp = async () => {
    if (isSubmitting) return;

    setError({});
    
    let validationErrors = {};

    if (!phonenumber || phonenumber.length !== 10) {
      validationErrors.phonenumber = "Phone number must be exactly 10 digits";
    }

    if (!emergencyPhone || emergencyPhone.length !== 10) {
      validationErrors.emergencyPhone = "Emergency contact must be exactly 10 digits";
    }

    // Check password match
    if (password !== confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: Object.values(validationErrors).join('\n'),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await Register(
        fullname,
        email,
        phonenumber,
        password,
        emergencyPhone,
        medicalcondition,
        imageUri,
      );

      // Backend validation errors
      // Backend validation errors
      if (res?.errors) {
        setError(res.errors);

        const backendErrorText = Object.values(res.errors).join(", ");

        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: backendErrorText,
        });

        setIsSubmitting(false);
        return;
      }


      // Backend messages (duplicate, etc.)
      if (res?.message && res.message !== "User registered successfully") {
        Toast.show({
          type: 'error',
          text1: 'Sign Up Failed',
          text2: res.message,
        });
        setIsSubmitting(false);
        return;
      }

      // Success
      if (res?.message === "User registered successfully") {
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Sign Up Completed Successfully',
          onHide: () => navigation.goBack(), // Navigate after toast hides
        });

        // Optional: Add a small delay before navigating
        setTimeout(() => {
          navigation.goBack();
        }, 1500);

        return;
      }

    } catch (error) {
      console.error("Unexpected Error:", error);

      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Please check your internet and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pickImage = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      includeBase64: false,
      mediaType: 'photo',
    })
      .then(image => {
        setImageUri(image?.path);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Image added successfully',
        });
      })
      .catch(error => {
        if (error.code === 'E_PICKER_CANCELLED') {
          console.log('User cancelled image picker');
        } else {
          Toast.show({
            type: 'error',
            text1: 'Image Error',
            text2: 'Failed to select image',
          });
        }
      });
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 40 }}
      style={styles.container}>
      <Animated.View
        style={[styles.header, { transform: [{ translateY: imagePosition }] }]}>
        <Image
          source={require('../../assets/Airbound-Logo-.png')}
          style={styles.logo}
        />
      </Animated.View>

      <Animated.View style={{ transform: [{ translateY: cardPosition }] }}>
        <Card style={styles.card}>
          <TouchableOpacity onPress={pickImage} style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 100,
                height: 100,
                backgroundColor: Colors.primary,
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: 100, height: 100, borderRadius: 8 }}
                />
              ) : (
                <Icon name="camera" size={30} color="#fff" />
              )}
            </View>
            <Text
              style={{
                alignSelf: 'center',
                marginTop: 5,
                color: '#777',
                fontFamily: fonts.regular,
              }}>
              Add Image
            </Text>
          </TouchableOpacity>

          <TextInputField
            placeholder="Full Name"
            value={fullname}
            onChangeText={setFullname}
            iconName="user"
            error={error?.fullname}
          />
          <TextInputField
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text.toLowerCase())}
            iconName="envelope"
            error={error?.email}
          />
          <TextInputField
            placeholder="Phone Number"
            value={phonenumber}
            onChangeText={(text) => {
              const numericText = text.replace(/[^0-9]/g, '');
              setPhonenumber(numericText);
            }}
            iconName="phone-volume"
            keyboardType="numeric"
            maxLength={10}
            error={error?.phonenumber}
          />
          <TextInputField
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            iconName="key"
            secureTextEntry={!isPasswordVisible}
            togglePasswordVisibility={() =>
              setIsPasswordVisible(!isPasswordVisible)
            }
            isPasswordVisible={isPasswordVisible}
            error={error?.password}
          />
          <TextInputField
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            iconName="key"
            secureTextEntry={!isPasswordVisible}
            error={error?.confirmPassword}
          />

          <TextInputField
            placeholder="Emergency Contact"
            value={emergencyPhone}
            onChangeText={(text) => {
              const numericText = text.replace(/[^0-9]/g, '');
              setEmergencyPhone(numericText);
            }}
            iconName="phone-volume"
            keyboardType="numeric"
            maxLength={10}
            error={error?.emergencyPhone}
          />

          <View style={styles.inputBlurContainer}>
            <TextInput
              style={[styles.inputs, styles.textArea]}
              value={medicalcondition}
              onChangeText={setMedicalCondition}
              placeholder="Describe any medical conditions..."
              placeholderTextColor="#666"
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          {error?.medicalcondition ? (
            <Text style={styles.error}>{error?.medicalcondition}</Text>
          ) : null}

          <TouchableOpacity
            style={{ marginTop: 10, opacity: isSubmitting ? 0.7 : 1 }}
            onPress={validateAndSignUp}
            disabled={isSubmitting}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0.0, y: 0.0 }}
              end={{ x: 1.0, y: 1.0 }}
              style={styles.gradient}
            >
              {isSubmitting ? (
                <Text style={styles.buttonText}>Creating Account...</Text>
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={{ color: '#1A1D25', fontFamily: fonts.regular }}>
              Already A Member? &nbsp;
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={{ color: Colors.secondary, fontWeight: 'bold', fontFamily: fonts.regular }}>
                Sign in
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('BottomNavigation')}>
              <Text style={{ color: Colors.primary, fontFamily: fonts.regular }}>
                Skip For Now
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    height: height * 0.25,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.02,
  },
  logo: {
    width: width * 0.45,
    height: height * 0.2,
    resizeMode: 'contain',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: width * 0.04,
    marginTop: 0,
    marginHorizontal: width * 0.05,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  inputContainer: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderRadius: 40,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: width * 0.05,
    marginTop: 10,
  },
  input: {
    flex: 1,
    fontSize: width * 0.04,
    paddingLeft: width * 0.1,
    color: 'black',
    fontFamily: fonts.regular,
  },
  inputIcon: {
    color: '#aaa',
    position: 'absolute',
    left: 15,
  },
  passwordToggle: {
    position: 'absolute',
    right: 10,
    top: 15,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 15,
  },
  gradient: {
    borderRadius: 30,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.1,
    marginVertical: height * 0.02,
  },
  buttonText: {
    color: '#fff',
    fontSize: width * 0.05,
    textAlign: 'center',
    fontFamily: fonts.regular,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  inputBlurContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
    marginTop: 10,
  },
  inputs: {
    padding: 12,
    color: 'black',
    fontSize: 16,
    backgroundColor: 'transparent',
    fontFamily: fonts.regular,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
});

export default SignUp;