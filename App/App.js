import React, { useEffect, useState } from 'react';
import {
  View,
  Platform,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
} from 'react-native';

import BottomNavigation from './Screens/BottomNav/BottomNavigation';
import { PaperProvider, DefaultTheme, Portal } from 'react-native-paper';
import FAQsection from './Screens/FAQsection';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Gifting from './Screens/Gifting';
import Our_Trainers from './Screens/Our_Trainers';
import TERMSCompnent from './Screens/MainScreens/TERMSCompnent';
import Login from './Screens/AuthScreen/Login';
import SignUp from './Screens/AuthScreen/SignUp';
import SplashScreen from './Screens/AuthScreen/SplashScreen';
import UBSeeAll from './Screens/UBSeeAll';
import BcDetails from './Screens/BcDetails';
import Packages from './Screens/Package/Packages';
import PackagesDetails from './Screens/Package/PackageDetails2';
import { UserProvider } from './context/UserContext';
import ProfileEdit from './Screens/MainScreens/ProfileEdit';
import CalendarDetails from './Screens/MainScreens/CalendarDetails';
import BookingCard from './Screens/BookingCard';
import Booking from './Screens/Bookings/Booking';
import SearchClasses from './Screens/SearchClasses/SearchClasses';
import How_it_Works from './Screens/MainScreens/How_it_Works';
import CalendarScreen from './Screens/MainScreens/Calendar';
import BookBatchelorette from './Screens/Book_A_Batchelorette/BookBatchelorette';
import Classes_Scheduls from './Screens/classes_schedule/Classes_Scheduls';
import ForgotPasswrod from './Screens/AuthScreen/ForgotPasswrod';
import OrderSummary from './Screens/Bookings/OrderSummary';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CategoryPackages from './Screens/Package/CategoryPackage';
import UserPackages from './Screens/UserPackages/UserPackages';
import PackageDetailsRemaining from './Screens/Package/PackageRemaining';
import StaticCategoryClasses from './Screens/StaticCategoryClasses';

import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import Toast from 'react-native-toast-message';
import { Colors } from './Screens/Config/Config';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';
import { BaseUrl } from './Screens/Api/BaseUrl';

const Stack = createStackNavigator();

/* ---------------- THEME ---------------- */

const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFFFFF',
    primary: Colors.primary,
    accent: Colors.secondary,
    text: '#000000',
    surface: '#FFFFFF',
  },
};

/* ---------------- VERSION COMPARATOR ---------------- */

const isVersionLower = (current, minimum) => {
  const c = current.split('.').map(Number);
  const m = minimum.split('.').map(Number);

  for (let i = 0; i < Math.max(c.length, m.length); i++) {
    const cv = c[i] || 0;
    const mv = m[i] || 0;
    if (cv < mv) return true;
    if (cv > mv) return false;
  }
  return false;
};

/* ---------------- FORCE UPDATE MODAL ---------------- */

const ForceUpdateModal = ({ visible, message, updateUrl }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.updateOverlay}>
      <View style={styles.updateBox}>
        <Text style={styles.updateTitle}>Update Required</Text>
        <Text style={styles.updateMessage}>
          {message || 'Please update the app to continue using it.'}
        </Text>

        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => Linking.openURL(updateUrl)}
        >
          <Text style={styles.updateButtonText}>Update App</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

/* ---------------- TOAST ---------------- */

const ToastPortal = () => (
  <Portal>
    <View style={styles.toastAbsoluteContainer}>
      <Toast position="top" topOffset={80} />
    </View>
  </Portal>
);

/* ---------------- APP ---------------- */

const App = () => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateUrl, setUpdateUrl] = useState('');

  const currentVersion = DeviceInfo.getVersion();
  const buildVersion = DeviceInfo.getBuildNumber();

  console.log('==============================');
  console.log('Current Version:', currentVersion);
  console.log('Build Version:', buildVersion);
  console.log('==============================');

  /* -------- VERSION CHECK -------- */

  useEffect(() => {
    const checkAppVersion = async () => {
      try {
        if (Platform.OS !== 'ios') return;

        const response = await axios.get(
          `${BaseUrl}app-version/check`,
          {
            params: {
              platform: 'ios',
              version: currentVersion,
              buildVersion,
            },
          }
        );

        console.log('📦 App Version API Response:', response.data);

        const {
          minimumVersion,
          buildVersion: apiBuild,
          updateUrl,
          message,
        } = response.data;

        if (isVersionLower(currentVersion, minimumVersion)) {
          setUpdateMessage(message);
          setUpdateUrl(updateUrl);
          setShowUpdateModal(true);
          return;
        }

        if (Number(buildVersion) < Number(apiBuild)) {
          setUpdateMessage(message);
          setUpdateUrl(updateUrl);
          setShowUpdateModal(true);
          return;
        }

        console.log('✅ App version is valid');
      } catch (err) {
        console.log('❌ Version check failed:', err.message);
      }
    };

    checkAppVersion();
  }, []);

  /* -------- PUSH NOTIFICATIONS -------- */

  useEffect(() => {
    const init = async () => {
      if (Platform.OS === 'android') {
        await notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
          importance: AndroidImportance.HIGH,
        });
      }

      await messaging().requestPermission();

      messaging().onMessage(async remoteMessage => {
        if (remoteMessage.notification) {
          await notifee.displayNotification({
            title: remoteMessage.notification.title,
            body: remoteMessage.notification.body,
            android: { channelId: 'default' },
          });
        }
      });
    };

    init();
  }, []);

  /* -------- UI -------- */

  return (
    <>
      <ForceUpdateModal
        visible={showUpdateModal}
        message={updateMessage}
        updateUrl={updateUrl}
      />

      <View style={{ flex: 1 }}>
        <NavigationContainer>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <PaperProvider theme={lightTheme}>
              <UserProvider>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="SplashScreen" component={SplashScreen} />
                  <Stack.Screen name="Login" component={Login} />
                  <Stack.Screen name="SignUp" component={SignUp} />
                  <Stack.Screen name="Forgot" component={ForgotPasswrod} />
                  <Stack.Screen name="BottomNavigation" component={BottomNavigation} />
                  <Stack.Screen name="Booking" component={Booking} />
                  <Stack.Screen name="OrderSummary" component={OrderSummary} />
                  <Stack.Screen name="Packages" component={Packages} />
                  <Stack.Screen name="PackagesDetails" component={PackagesDetails} />
                  <Stack.Screen name="UserPackages" component={UserPackages} />
                  <Stack.Screen name="RemainigPackage" component={PackageDetailsRemaining} />
                  <Stack.Screen name="ProfileEdit" component={ProfileEdit} />
                  <Stack.Screen name="CalendarScreen" component={CalendarScreen} />
                  <Stack.Screen name="CalendarDetails" component={CalendarDetails} />
                  <Stack.Screen name="SearchClasses" component={SearchClasses} />
                  <Stack.Screen name="How_it_Works" component={How_it_Works} />
                  <Stack.Screen name="FAQsection" component={FAQsection} />
                  <Stack.Screen name="TERMSCompnent" component={TERMSCompnent} />
                  <Stack.Screen name="Gifting" component={Gifting} />
                  <Stack.Screen name="Our_Trainers" component={Our_Trainers} />
                  <Stack.Screen name="BookingCard" component={BookingCard} />
                  <Stack.Screen name="StaticBookingCard" component={StaticCategoryClasses} />
                  <Stack.Screen name="BookBatchelorette" component={BookBatchelorette} />
                </Stack.Navigator>
                <ToastPortal />
              </UserProvider>
            </PaperProvider>
          </GestureHandlerRootView>
        </NavigationContainer>
      </View>
    </>
  );
};

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  updateOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  updateTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  updateMessage: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20,
  },
  updateButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  toastAbsoluteContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999999,
  },
});

/* ---------------- EXPORT ---------------- */

export default App;
