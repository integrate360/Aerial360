import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { Colors } from '../Config/Config';
import UserContext from '../../context/UserContext';
import { forgot } from '../Api/Allapi';

const { width, height } = Dimensions.get('window');

const ForgotPasswrod = () => {
  const navigation = useNavigation();
  const { email } = useContext(UserContext);

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState({ otp: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cardPosition = useRef(new Animated.Value(height)).current;
  const imagePosition = useRef(new Animated.Value(-height / 2)).current;

  useEffect(() => {
    Animated.timing(imagePosition, {
      toValue: 0,
      duration: 450,
      useNativeDriver: true,
    }).start();

    Animated.timing(cardPosition, {
      toValue: 0,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, []);

  const changePassword = async () => {
    if (isSubmitting) return;

    let isValid = true;

    if (!otp) {
      isValid = false;
      setError(prev => ({ ...prev, otp: 'OTP is required' }));
    } else {
      setError(prev => ({ ...prev, otp: '' }));
    }

    if (!password) {
      isValid = false;
      setError(prev => ({ ...prev, password: 'Password is required' }));
    } else {
      setError(prev => ({ ...prev, password: '' }));
    }

    if (!isValid) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill all required fields',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await forgot({ email, otp, password });

      if (res?.status !== 200) {
        Toast.show({
          type: 'error',
          text1: 'Failed',
          text2: res?.message || 'Invalid OTP',
        });
        return;
      }

      Toast.show({
        type: 'success',
        text1: 'Password Updated',
        text2: 'Please login with your new password',
        visibilityTime: 2500,
        onHide: () => navigation.replace('Login'),
      });

    } catch (err) {
      console.log(err);
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          { transform: [{ translateY: imagePosition }] },
        ]}
      >
        <Image
          source={require('../../assets/Airbound-Logo-.png')}
          style={styles.logo}
        />
      </Animated.View>

      <Animated.View style={{ transform: [{ translateY: cardPosition }] }}>
        <Card style={styles.card}>
          <View style={styles.formContainer}>
            {/* OTP */}
            <View>
              <TextInput
                style={styles.input}
                placeholder="Enter OTP"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                placeholderTextColor="#777"
              />
              <Icon name="lock" style={styles.icon} size={18} />
              {error.otp ? <Text style={styles.error}>{error.otp}</Text> : null}
            </View>

            {/* Password */}
            <View>
              <TextInput
                style={styles.input}
                placeholder="New Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#777"
              />
              <Icon name="key" style={styles.icon} size={18} />
              {error.password ? (
                <Text style={styles.error}>{error.password}</Text>
              ) : null}
            </View>

            {/* Submit */}
            <TouchableOpacity
              onPress={changePassword}
              disabled={isSubmitting}
              style={{ opacity: isSubmitting ? 0.7 : 1 }}
            >
              <LinearGradient
                style={styles.loginButton}
                colors={[Colors.secondary, Colors.secondary]}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Card>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    height: height * 0.28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.03,
  },

  logo: {
    width: width * 0.5,
    height: height * 0.22,
    resizeMode: 'contain',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 20,
    elevation: 4,
    marginTop: 0,
    marginHorizontal: width * 0.05,
    marginBottom: 20,
  },

  formContainer: {
    marginTop: height * 0.03,
  },

  input: {
    height: height * 0.06,
    borderRadius: 40,
    marginBottom: height * 0.02,
    paddingHorizontal: 10,
    backgroundColor: '#f8f8f8',
    color: 'black',
    paddingLeft: width * 0.12,
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
  },

  loginButton: {
    paddingVertical: '4%',
    borderRadius: 50,
    alignItems: 'center',
    width: '60%',
    alignSelf: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    fontSize: width * 0.05,
    fontWeight: 'bold',
  },
});

export default ForgotPasswrod;
