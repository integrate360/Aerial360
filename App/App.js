// import React, { useEffect } from 'react';
// import { View } from 'react-native';
// import BottomNavigation from './Screens/BottomNav/BottomNavigation';
// import { PaperProvider, DefaultTheme } from 'react-native-paper';
// import FAQsection from './Screens/FAQsection';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import Gifting from './Screens/Gifting';
// import Our_Trainers from './Screens/Our_Trainers';
// import TERMSCompnent from './Screens/MainScreens/TERMSCompnent';
// import Login from './Screens/AuthScreen/Login';
// import SignUp from './Screens/AuthScreen/SignUp';
// import SplashScreen from './Screens/AuthScreen/SplashScreen';
// import UBSeeAll from './Screens/UBSeeAll';
// import BcDetails from './Screens/BcDetails';
// import Packages from './Screens/Package/Packages';
// import PackagesDetails from './Screens/Package/PackageDetails2';
// import { UserProvider } from './context/UserContext';
// import ProfileEdit from './Screens/MainScreens/ProfileEdit';
// import CalendarDetails from './Screens/MainScreens/CalendarDetails';
// import BookingCard from './Screens/BookingCard';
// import Booking from './Screens/Bookings/Booking';
// import SearchClasses from './Screens/SearchClasses/SearchClasses';
// import How_it_Works from './Screens/MainScreens/How_it_Works';
// import CalendarScreen from './Screens/MainScreens/Calendar';
// const Stack = createStackNavigator();
// import BookBatchelorette from './Screens/Book_A_Batchelorette/BookBatchelorette';
// import Classes_Scheduls from './Screens/classes_schedule/Classes_Scheduls';
// import ForgotPasswrod from './Screens/AuthScreen/ForgotPasswrod';
// import OrderSummary from './Screens/Bookings/OrderSummary';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import CategoryPackages from './Screens/Package/CategoryPackage';
// import UserPackages from './Screens/UserPackages/UserPackages';
// import PackageDetailsRemaining from './Screens/Package/PackageRemaining';
// import StaticCategoryClasses from './Screens/StaticCategoryClasses';
// import messaging from '@react-native-firebase/messaging'; // ADD THIS IMPORT
// import { Platform } from 'react-native'; // ADD THIS IMPORT

// const lightTheme = {
//   ...DefaultTheme,
//   colors: {
//     ...DefaultTheme.colors,
//     background: '#FFFFFF',
//     primary: '#6200ee',
//     accent: '#03dac4',
//     text: '#000000',
//     surface: '#FFFFFF',
//   },
// };

// // Notification functions directly in App.js
// const requestUserPermission = async () => {
//   if (Platform.OS === 'ios') {
//     try {
//       const authStatus = await messaging().requestPermission();
//       const enabled =
//         authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//         authStatus === messaging.AuthorizationStatus.PROVISIONAL;

//       console.log('Notification Authorization status:', authStatus);
//       return enabled;
//     } catch (error) {
//       console.error('Permission request error:', error);
//       return false;
//     }
//   }
//   return true;
// };

// const getFCMToken = async () => {
//   try {
//     if (!messaging().isDeviceRegisteredForRemoteMessages) {
//       await messaging().registerDeviceForRemoteMessages();
//     }

//     const token = await messaging().getToken();
//     console.log('FCM Token:', token);
//     return token;
//   } catch (error) {
//     console.error('Error getting FCM token:', error);
//     return null;
//   }
// };

// const setupNotificationHandlers = () => {
//   // Setup foreground message handler
//   messaging().onMessage(async remoteMessage => {
//     console.log('Foreground notification received:', remoteMessage);
//   });

//   // Setup background message handler
//   messaging().setBackgroundMessageHandler(async remoteMessage => {
//     console.log('Background notification received:', remoteMessage);
//   });

//   // Setup notification opened handler
//   messaging().onNotificationOpenedApp(remoteMessage => {
//     console.log('Notification opened app from background:', remoteMessage);
//   });

//   messaging().getInitialNotification().then(remoteMessage => {
//     if (remoteMessage) {
//       console.log('Notification opened app from quit state:', remoteMessage);
//     }
//   });
// };

// const initializeNotifications = async () => {
//   try {
//     setupNotificationHandlers();

//     const hasPermission = await requestUserPermission();
//     if (hasPermission) {
//       const token = await getFCMToken();
//       return token;
//     }
//     return null;
//   } catch (error) {
//     console.error('Notification initialization error:', error);
//     return null;
//   }
// };

// const App = () => {
//   useEffect(() => {
//     console.log('Initializing push notifications...');

//     const initNotifications = async () => {
//       const token = await initializeNotifications();
//       if (token) {
//         console.log('FCM Token obtained successfully');
//         // You can send this token to your backend here
//       }
//     };

//     initNotifications();
//   }, []);

//   return (
//     <View style={{ flex: 1, backgroundColor: lightTheme.colors.background }}>
//       <NavigationContainer>
//         <GestureHandlerRootView style={{ flex: 1 }}>
//           <PaperProvider theme={lightTheme}>
//             <Stack.Navigator>
//               <Stack.Screen
//                 name="SplashScreen"
//                 component={SplashScreen}
//                 options={{ title: '', headerShown: false }}
//               />
//               <Stack.Screen
//                 name="Login"
//                 component={Login}
//                 options={{ title: '', headerShown: false }}
//               />
//               <Stack.Screen
//                 name="Forgot"
//                 component={ForgotPasswrod}
//                 options={{ title: '', headerShown: false }}
//               />
//               <Stack.Screen
//                 name="BookBatchelorette"
//                 component={BookBatchelorette}
//                 options={{ title: '', headerShown: false }}
//               />
//               <Stack.Screen
//                 name="SearchClasses"
//                 component={SearchClasses}
//                 options={{ title: '', headerShown: false }}
//               />
//               <Stack.Screen
//                 name="How_it_Works"
//                 component={How_it_Works}
//                 options={{ title: '', headerShown: false }}
//               />
//               <Stack.Screen
//                 name="CalendarScreen"
//                 component={CalendarScreen}
//                 options={{ title: '', headerShown: false }}
//               />
//               <Stack.Screen
//                 name="SignUp"
//                 component={SignUp}
//                 options={{ title: '', headerShown: false }}
//               />
//               <Stack.Screen
//                 name="Classes_Scheduls"
//                 component={Classes_Scheduls}
//                 options={{ title: '', headerShown: false }}
//               />
//               <Stack.Screen
//                 name="Booking"
//                 component={Booking}
//                 options={{ title: '', headerShown: false }}
//               />
//               <Stack.Screen
//                 name="UserPackages"
//                 component={UserPackages}
//                 options={{ title: '', headerShown: false }}
//               />
//               <Stack.Screen
//                 name="OrderSummary"
//                 component={OrderSummary}
//                 options={{ title: '', headerShown: false }}
//               />
//               <Stack.Screen
//                 name="BottomNavigation"
//                 component={BottomNavigation}
//                 options={{ title: '', headerShown: false }}
//               />
//               <Stack.Screen
//                 name="BookingCard"
//                 component={BookingCard}
//                 options={{ title: '', headerShown: false }}
//               />
//               <Stack.Screen
//                 name="StaticBookingCard"
//                 component={StaticCategoryClasses}
//                 options={{ title: '', headerShown: false }}
//               />
//               <Stack.Screen
//                 name="CategoryPackages"
//                 component={CategoryPackages}
//                 options={{ title: '', headerShown: false }}
//               />
//               <Stack.Screen
//                 name="CalendarDetails"
//                 component={CalendarDetails}
//                 options={{ title: '', headerShown: false }}
//               />
//               <Stack.Screen
//                 name="ProfileEdit"
//                 component={ProfileEdit}
//                 options={{ title: '', headerShown: false }}
//               />
//               <Stack.Screen
//                 name="PackagesDetails"
//                 component={PackagesDetails}
//                 options={{ title: '', headerShown: false }}
//               />
//               <Stack.Screen
//                 name="RemainigPackage"
//                 component={PackageDetailsRemaining}
//                 options={{ title: '', headerShown: false }}
//               />
//               <Stack.Screen
//                 name="Packages"
//                 component={Packages}
//                 options={{ title: '', headerShown: false }}
//               />
//               <Stack.Screen
//                 name="BcDetails"
//                 component={BcDetails}
//                 options={{ title: '', headerShown: false }}
//               />
//               <Stack.Screen
//                 name="UBSeeAll"
//                 component={UBSeeAll}
//                 options={{ title: '', headerShown: false }}
//               />
//               <Stack.Screen
//                 name="FAQsection"
//                 component={FAQsection}
//                 options={{ title: '', headerShown: false }}
//               />
//               <Stack.Screen
//                 name="TERMSCompnent"
//                 component={TERMSCompnent}
//                 options={{ title: '', headerShown: false }}
//               />
//               <Stack.Screen
//                 name="Gifting"
//                 component={Gifting}
//                 options={{ title: '', headerShown: false }}
//               />
//               <Stack.Screen
//                 name="Our_Trainers"
//                 component={Our_Trainers}
//                 options={{ title: '', headerShown: false }}
//               />
//             </Stack.Navigator>
//           </PaperProvider>
//         </GestureHandlerRootView>
//       </NavigationContainer>
//     </View>
//   );
// };

// export default () => {
//   return (
//     <UserProvider>
//       <App />
//     </UserProvider>
//   );
// };import React, { useEffect } from 'react';

// import React, { useEffect } from 'react';
// import {
//   View,
//   Platform,
//   Text,
//   StyleSheet
// } from 'react-native';
// import BottomNavigation from './Screens/BottomNav/BottomNavigation';
// import { PaperProvider, DefaultTheme, Portal } from 'react-native-paper';
// import FAQsection from './Screens/FAQsection';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import Gifting from './Screens/Gifting';
// import Our_Trainers from './Screens/Our_Trainers';
// import TERMSCompnent from './Screens/MainScreens/TERMSCompnent';
// import Login from './Screens/AuthScreen/Login';
// import SignUp from './Screens/AuthScreen/SignUp';
// import SplashScreen from './Screens/AuthScreen/SplashScreen';
// import UBSeeAll from './Screens/UBSeeAll';
// import BcDetails from './Screens/BcDetails';
// import Packages from './Screens/Package/Packages';
// import PackagesDetails from './Screens/Package/PackageDetails2';
// import { UserProvider } from './context/UserContext';
// import ProfileEdit from './Screens/MainScreens/ProfileEdit';
// import CalendarDetails from './Screens/MainScreens/CalendarDetails';
// import BookingCard from './Screens/BookingCard';
// import Booking from './Screens/Bookings/Booking';
// import SearchClasses from './Screens/SearchClasses/SearchClasses';
// import How_it_Works from './Screens/MainScreens/How_it_Works';
// import CalendarScreen from './Screens/MainScreens/Calendar';
// import BookBatchelorette from './Screens/Book_A_Batchelorette/BookBatchelorette';
// import Classes_Scheduls from './Screens/classes_schedule/Classes_Scheduls';
// import ForgotPasswrod from './Screens/AuthScreen/ForgotPasswrod';
// import OrderSummary from './Screens/Bookings/OrderSummary';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import CategoryPackages from './Screens/Package/CategoryPackage';
// import UserPackages from './Screens/UserPackages/UserPackages';
// import PackageDetailsRemaining from './Screens/Package/PackageRemaining';
// import StaticCategoryClasses from './Screens/StaticCategoryClasses';
// import messaging from '@react-native-firebase/messaging';
// import notifee, { AndroidImportance } from '@notifee/react-native';
// import Toast from 'react-native-toast-message';
// import { Colors } from './Screens/Config/Config'; // Import your Colors
// import DeviceInfo from 'react-native-device-info';

// const Stack = createStackNavigator();

// const lightTheme = {
//   ...DefaultTheme,
//   colors: {
//     ...DefaultTheme.colors,
//     background: '#FFFFFF',
//     primary: Colors.primary, // Using your primary color
//     accent: Colors.secondary, // Using your secondary color
//     text: '#000000',
//     surface: '#FFFFFF',
//   },
// };

// // Background message handler (outside component)
// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('Background notification received:', remoteMessage);
//   return Promise.resolve();
// });

// // Custom Toast configuration with higher z-index
// const toastConfig = {
//   success: (internalState) => (
//     <View style={[styles.toastContainer, styles.successToast, styles.toastZIndex]}>
//       <View style={styles.toastTextContainer}>
//         {internalState.text1 && (
//           <Text style={styles.toastTitle}>{internalState.text1}</Text>
//         )}
//         {internalState.text2 && (
//           <Text style={styles.toastMessage}>{internalState.text2}</Text>
//         )}
//       </View>
//     </View>
//   ),
//   error: (internalState) => (
//     <View style={[styles.toastContainer, styles.errorToast, styles.toastZIndex]}>
//       <View style={styles.toastTextContainer}>
//         {internalState.text1 && (
//           <Text style={styles.toastTitle}>{internalState.text1}</Text>
//         )}
//         {internalState.text2 && (
//           <Text style={styles.toastMessage}>{internalState.text2}</Text>
//         )}
//       </View>
//     </View>
//   ),
//   info: (internalState) => (
//     <View style={[styles.toastContainer, styles.infoToast, styles.toastZIndex]}>
//       <View style={styles.toastTextContainer}>
//         {internalState.text1 && (
//           <Text style={styles.toastTitle}>{internalState.text1}</Text>
//         )}
//         {internalState.text2 && (
//           <Text style={styles.toastMessage}>{internalState.text2}</Text>
//         )}
//       </View>
//     </View>
//   ),
// };

// // Create a ToastPortal component to render Toast in Paper Provider's Portal
// // In App.js - Make sure you have this
// const ToastPortal = () => {
//   return (
//     <Portal>
//       <View style={styles.toastAbsoluteContainer}>
//         <Toast
//           config={toastConfig}
//           ref={(ref) => Toast.setRef(ref)}
//           position="top"
//           topOffset={Platform.OS === 'ios' ? 80 : 60}
//           visibilityTime={4000}
//           autoHide={true}
//           keyboardOffset={Platform.OS === 'ios' ? 100 : 80}
//           onPress={() => Toast.hide()}
//         />
//       </View>
//     </Portal>
//   );
// };

// const App = () => {

//   const [showUpdateModal, setShowUpdateModal] = React.useState(false);
// const [updateMessage, setUpdateMessage] = React.useState('');
// const [updateUrl, setUpdateUrl] = React.useState('');


//     const currentVersion = DeviceInfo.getVersion();
//     const buildVersion = DeviceInfo.getBuildNumber();


//       console.log('====================================');
//       console.log("Current Version: ",currentVersion);
//       console.log('Build Version:', buildVersion);
//       console.log('====================================');

//   useEffect(() => {
//     const init = async () => {
//       console.log('Initializing push notifications...');

//       // Request iOS permissions
//       const requestUserPermission = async () => {
//         if (Platform.OS === 'ios') {
//           try {
//             const authStatus = await messaging().requestPermission();
//             const enabled =
//               authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//               authStatus === messaging.AuthorizationStatus.PROVISIONAL;
//             console.log('iOS Notification Authorization status:', authStatus);
//             return enabled;
//           } catch (error) {
//             console.error('Permission request error:', error);
//             return false;
//           }
//         }
//         return true;
//       };

//       // Create default Android channel
//       const createAndroidChannel = async () => {
//         if (Platform.OS === 'android') {
//           await notifee.createChannel({
//             id: 'default',
//             name: 'Default Channel',
//             importance: AndroidImportance.HIGH,
//           });
//         }
//       };

//       await createAndroidChannel();

//       const hasPermission = await requestUserPermission();
//       if (hasPermission) {
//         try {
//           if (!messaging().isDeviceRegisteredForRemoteMessages) {
//             await messaging().registerDeviceForRemoteMessages();
//           }
//           const token = await messaging().getToken();
//           console.log('FCM Token:', token);
//         } catch (error) {
//           console.error('Error getting FCM token:', error);
//         }
//       }

//       // Notification opened handlers
//       messaging().onNotificationOpenedApp(remoteMessage => {
//         console.log('Notification opened from background:', remoteMessage);
//       });

//       messaging().getInitialNotification().then(remoteMessage => {
//         if (remoteMessage) {
//           console.log('Notification opened from quit state:', remoteMessage);
//         }
//       });

//       // Foreground notification handler
//       const unsubscribe = messaging().onMessage(async remoteMessage => {
//         console.log('Foreground notification:', remoteMessage);
//         if (remoteMessage.notification) {
//           await notifee.displayNotification({
//             title: remoteMessage.notification.title,
//             body: remoteMessage.notification.body,
//             android: {
//               channelId: 'default',
//               smallIcon: 'ic_launcher',
//               importance: AndroidImportance.HIGH,
//             },
//             ios: {
//               foregroundPresentationOptions: {
//                 alert: true,
//                 badge: true,
//                 sound: true,
//               },
//             },
//           });
//         }
//       });

//       return unsubscribe;
//     };

//     const unsubscribePromise = init();

//     return () => {
//       unsubscribePromise.then(unsubscribe => {
//         if (unsubscribe) unsubscribe();
//       });
//     };
//   }, []);

//   return (
//     <>
//       <View style={{ flex: 1, backgroundColor: lightTheme.colors.background }}>
//         <NavigationContainer>
//           <GestureHandlerRootView style={{ flex: 1 }}>
//             <PaperProvider theme={lightTheme}>
//               <UserProvider>
//                 <Stack.Navigator>
//                   {/* Keep all your existing screens */}
//                   <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} />
//                   <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
//                   <Stack.Screen name="Forgot" component={ForgotPasswrod} options={{ headerShown: false }} />
//                   <Stack.Screen name="BookBatchelorette" component={BookBatchelorette} options={{ headerShown: false }} />
//                   <Stack.Screen name="SearchClasses" component={SearchClasses} options={{ headerShown: false }} />
//                   <Stack.Screen name="How_it_Works" component={How_it_Works} options={{ headerShown: false }} />
//                   <Stack.Screen name="CalendarScreen" component={CalendarScreen} options={{ headerShown: false }} />
//                   <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
//                   <Stack.Screen name="Classes_Scheduls" component={Classes_Scheduls} options={{ headerShown: false }} />
//                   <Stack.Screen name="Booking" component={Booking} options={{ headerShown: false }} />
//                   <Stack.Screen name="UserPackages" component={UserPackages} options={{ headerShown: false }} />
//                   <Stack.Screen name="OrderSummary" component={OrderSummary} options={{ headerShown: false }} />
//                   <Stack.Screen name="BottomNavigation" component={BottomNavigation} options={{ headerShown: false }} />
//                   <Stack.Screen name="BookingCard" component={BookingCard} options={{ headerShown: false }} />
//                   <Stack.Screen name="StaticBookingCard" component={StaticCategoryClasses} options={{ headerShown: false }} />
//                   <Stack.Screen name="CategoryPackages" component={CategoryPackages} options={{ headerShown: false }} />
//                   <Stack.Screen name="CalendarDetails" component={CalendarDetails} options={{ headerShown: false }} />
//                   <Stack.Screen name="ProfileEdit" component={ProfileEdit} options={{ headerShown: false }} />
//                   <Stack.Screen name="PackagesDetails" component={PackagesDetails} options={{ headerShown: false }} />
//                   <Stack.Screen name="RemainigPackage" component={PackageDetailsRemaining} options={{ headerShown: false }} />
//                   <Stack.Screen name="Packages" component={Packages} options={{ headerShown: false }} />
//                   <Stack.Screen name="BcDetails" component={BcDetails} options={{ headerShown: false }} />
//                   <Stack.Screen name="UBSeeAll" component={UBSeeAll} options={{ headerShown: false }} />
//                   <Stack.Screen name="FAQsection" component={FAQsection} options={{ headerShown: false }} />
//                   <Stack.Screen name="TERMSCompnent" component={TERMSCompnent} options={{ headerShown: false }} />
//                   <Stack.Screen name="Gifting" component={Gifting} options={{ headerShown: false }} />
//                   <Stack.Screen name="Our_Trainers" component={Our_Trainers} options={{ headerShown: false }} />
//                 </Stack.Navigator>

//                 {/* Toast will be rendered in Portal above all content */}
//                 <Portal>
//                   <ToastPortal />
//                 </Portal>
//               </UserProvider>
//             </PaperProvider>
//           </GestureHandlerRootView>
//         </NavigationContainer>
//       </View>
//     </>
//   );
// };


// const styles = StyleSheet.create({
//   toastZIndex: {
//     zIndex: 999999, // Maximum z-index
//     elevation: 999999, // For Android
//   },
//  toastAbsoluteContainer: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     zIndex: 999999,
//     elevation: 999999,
//   },
//   toastContainer: {
//     width: '90%',
//     borderRadius: 25,
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     marginHorizontal: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 99999,
//     minHeight: 32,
//     justifyContent: 'center',
//     zIndex: 999999,
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.2)',
//   },
//   successToast: {
//     backgroundColor: Colors.secondary,
//   },
//   errorToast: {
//     backgroundColor: '#F44336',
//   },
//   infoToast: {
//     backgroundColor: Colors.primary,
//   },
//   toastTextContainer: {},
//   toastTitle: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//     textAlign: 'left',
//     marginBottom: 3,
//   },
//   toastMessage: {
//     color: 'rgba(255, 255, 255, 0.95)',
//     fontSize: 14,
//     textAlign: 'left',
//     lineHeight: 18,
//   },
// });


// // Main App export
// const MainApp = () => {
//   return <App />;
// };

// export default MainApp;

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
