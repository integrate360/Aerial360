import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { Card, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import UserContext from '../../context/UserContext';
import { Colors } from '../Config/Config';
import fonts from '../FontFamily/FontFamily';
import { emailOtp, login, saveDeviceToken } from '../Api/Allapi';
import messaging from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message'; // Add this import

// Get screen dimensions
const { width, height } = Dimensions.get('window');

const Login = () => {
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState({ email: '', password: '' });
  const navigation = useNavigation();
  const cardPosition = useRef(new Animated.Value(height)).current;
  const imagePosition = useRef(new Animated.Value(-height / 2)).current;
  const { saveEmail, saveUserId, saveToken, saveUser } = useContext(UserContext);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [message, setMessage] = useState('');
  const [fcmToken, setFcmToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add loading state
  const [isForgotFlow, setIsForgotFlow] = useState(false);


  const closeForgotModal = () => {
    setIsModalVisible(false);
    setIsForgotFlow(false);
  };


  useEffect(() => {
    // Get FCM token
    const getFCMToken = async () => {
      try {
        if (!messaging().isDeviceRegisteredForRemoteMessages) {
          await messaging().registerDeviceForRemoteMessages();
        }

        const token = await messaging().getToken();
        setFcmToken(token);
        console.log('FCM Token:', token);
      } catch (error) {
        console.error('Error getting FCM token:', error);
      }
    };

    getFCMToken();
  }, []);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(imagePosition, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.timing(cardPosition, {
      toValue: 0,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, []);

  const validateAndLogin = async () => {
    if (isSubmitting) return;

    let isValid = true;

    // if (!Email) {
    //   isValid = false;
    //   setError(prevState => ({ ...prevState, email: 'Email is required' }));
    // } else if (!/\S+@\S+\.\S+/.test(Email)) {
    //   isValid = false;
    //   setError(prevState => ({ ...prevState, email: 'Enter a valid email' }));
    // } else {
    //   setError(prevState => ({ ...prevState, email: '' }));
    // }

    // if (!Password) {
    //   isValid = false;
    //   setError(prevState => ({
    //     ...prevState,
    //     password: 'Password is required',
    //   }));
    // } else {
    //   setError(prevState => ({ ...prevState, password: '' }));
    // }

    // if (!isValid) {
    //   Toast.show({
    //     type: 'error',
    //     text1: 'Validation Error',
    //     text2: 'Please fill all required fields correctly',
    //   });
    //   return;
    // }

    setIsSubmitting(true);

    try {
      const res = await login(Email, Password);
      console.log('====================================');
      console.log(res);
      console.log('====================================');

      if (res?.token) {
        saveEmail(res.email);
        saveUserId(res?._id);
        saveUser(res);
        saveToken(res?.token);

        // Send FCM token to backend if available
        if (fcmToken) {
          try {
            const deviceTokenResponse = await saveDeviceToken(res.token, fcmToken);
            console.log('Device token saved successfully:', deviceTokenResponse);
          } catch (error) {
            console.error('Failed to save device token:', error);
            // Don't block login if device token saving fails
          }
        }

        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Login Completed Successfully',
          visibilityTime: 3000,
          onHide: () => {
            if (!isForgotFlow) {
              navigation.navigate('BottomNavigation');
            }
          },
        });

      } else if (res?.message) {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: res.message,
          visibilityTime: 4000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Error',
          text2: res || 'An error occurred during login',
          visibilityTime: 4000,
        });
      }
    } catch (error) {
      console.error('Unexpected Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Please check your internet connection and try again',
        visibilityTime: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendEmailOtp = async () => {
    if (!Email) {
      setError(prevState => ({ ...prevState, email: 'Email is required' }));
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter your email address',
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(Email)) {
      setError(prevState => ({ ...prevState, email: 'Enter a valid email' }));
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a valid email address',
      });
      return;
    }

    try {
      const res = await emailOtp(Email);
      console.log('====================================');
      console.log("Login Resp[onse: ", res);
      console.log('====================================');
      if (res.status !== 200) {
        setErrorMessage(res.data.message);
        Toast.show({
          type: 'error',
          text1: 'Failed to Send OTP',
          text2: res.data.message || 'Could not send OTP to your email',
        });
        return;
      }

      saveEmail(Email);
      setMessage(res.message);

      Toast.show({
        type: 'success',
        text1: 'OTP Sent!',
        text2: 'Verification code has been sent to your email',
        visibilityTime: 3000,
        onHide: () => {
          setIsModalVisible(false);
          navigation.replace('Forgot');
        },
      });

    } catch (error) {
      console.error('Error sending email OTP:', error);
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Failed to send OTP. Please try again.',
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            transform: [{ translateY: imagePosition }],
          },
        ]}>
        <Image
          source={require('../../assets/Airbound-Logo-.png')}
          style={styles.logo}
        />
      </Animated.View>

      <Animated.View
        style={{
          transform: [{ translateY: cardPosition }],
        }}>
        <Card style={styles.card}>
          <View style={styles.formContainer}>
            <View>
              <TextInput
                style={styles.input}
                placeholder="Enter Your Email"
                value={Email}
                onChangeText={setEmail}
                placeholderTextColor="#777"
              />
              <Icon name="envelope" style={styles.icon} size={18} />
              {error.email ? (
                <Text style={styles.error}>{error?.email}</Text>
              ) : null}
            </View>

            <View>
              <View style={{ position: 'relative' }}>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#777"
                  secureTextEntry={!isPasswordVisible}
                  value={Password}
                  onChangeText={setPassword}
                />
                <Icon name="key" style={styles.icon} size={15} />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                  <Icon
                    name={isPasswordVisible ? 'eye' : 'eye-slash'}
                    size={20}
                    color="#777"
                  />
                </TouchableOpacity>
              </View>
              {error.password ? (
                <Text style={styles.error}>{error.password}</Text>
              ) : null}
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => {
                  setIsForgotFlow(true);
                  setIsModalVisible(true);
                }}
              >
                <Text
                  style={{
                    fontWeight: '600',
                    color: '#777',
                    fontFamily: fonts.regular,
                  }}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: height * 0.05 }}>
              <TouchableOpacity
                onPress={() => validateAndLogin()}
                disabled={isSubmitting}
                style={{ opacity: isSubmitting ? 0.7 : 1 }}
              >
                <LinearGradient
                  style={styles.loginButton}
                  colors={[Colors.secondary, Colors.secondary]}
                  start={{ x: 0.1, y: 1.0 }}
                  end={{ x: 0.5, y: 1.0 }}>
                  {isSubmitting ? (
                    <Text style={styles.buttonText}>Logging in...</Text>
                  ) : (
                    <Text style={styles.buttonText}>Login</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              <View style={styles.registerContainer}>
                <Text style={{ color: 'black', fontFamily: fonts.regular }}>
                  Don't have an Account? &nbsp;
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                  <Text style={{ color: 'blue', fontFamily: fonts.regular }}>
                    Register
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.registerContainer}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('BottomNavigation')}>
                  <Text style={{ color: 'blue', fontFamily: fonts.regular }}>
                    Skip For Now
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Card>
      </Animated.View>

      <Modal
        transparent={true}
        animationType="fade"
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(!isModalVisible)}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
          <View
            style={{
              width: '90%',
              maxHeight: '80%',
              backgroundColor: '#fff',
              padding: 20,
              borderRadius: 10,
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}>
              <Text
                style={{
                  fontSize: 18,
                  color: '#777',
                  fontFamily: fonts.regular,
                }}>
                Forgot Password
              </Text>
              <IconButton
                icon="close"
                size={20}
                // onPress={() => setIsModalVisible(!isModalVisible)}
                onPress={closeForgotModal}
                iconColor="#777"
              />
            </View>
            <View>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={Email}
                onChangeText={setEmail}
                placeholderTextColor="#777"
              />
              <Icon name="envelope" style={styles.icon} size={18} />
              {error.email ? (
                <Text style={styles.error}>{error?.email}</Text>
              ) : null}
            </View>
            {errorMessage && (
              <Text style={{ color: 'red', marginBottom: 10 }}>
                {errorMessage}
              </Text>
            )}
            {message && <Text style={{ marginBottom: 10 }}>{message}</Text>}
            <TouchableOpacity onPress={() => sendEmailOtp()}>
              <LinearGradient
                style={styles.loginButton}
                colors={[Colors.secondary, Colors.secondary]}
                start={{ x: 0.1, y: 1.0 }}
                end={{ x: 0.5, y: 1.0 }}>
                <Text style={styles.buttonText}>Send Email</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: height * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '120%',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    marginTop: -10,
    marginHorizontal: width * 0.05,
  },
  formContainer: {
    marginTop: height * 0.03,
  },
  input: {
    height: height * 0.06,
    borderColor: '#ddd',
    borderRadius: 40,
    marginBottom: height * 0.02,
    paddingHorizontal: 10,
    backgroundColor: '#f8f8f8',
    color: 'black',
    paddingLeft: width * 0.12,
    fontFamily: fonts.regular,
  },
  icon: {
    position: 'absolute',
    left: width * 0.05,
    top: height * 0.021,
    color: '#777',
  },
  error: {
    color: 'red',
    fontSize: width * 0.03,
    marginLeft: width * 0.05,
    bottom: 10,
    fontFamily: fonts.regular,
  },
  passwordToggle: {
    position: 'absolute',
    right: width * 0.04,
    top: height * 0.02,
  },
  forgotPassword: {
    marginLeft: width * 0.07,
  },
  loginButton: {
    paddingVertical: '4%',
    borderRadius: 50,
    alignItems: 'center',
    width: '60%',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: width * 0.05,
    fontFamily: fonts.regular,
  },
  registerContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: height * 0.02,
  },
});

export default Login;