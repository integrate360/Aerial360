import React, {useEffect, useRef, useContext} from 'react';
import {View, StyleSheet, Image, Animated, Text} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '../Config/Config';
import UserContext from '../../context/UserContext';
import useDoubleBackExit from '../UseDoubleBackExit';
const SplashScreen = ({navigation}) => {
  const popupTranslateY = useRef(new Animated.Value(200)).current; // Initial position off-screen
  const {email} = useContext(UserContext);
  useDoubleBackExit();
  useEffect(() => {
    // Animate the popup into view
    Animated.timing(popupTranslateY, {
      toValue: 0, // Target position (on-screen)
      duration: 500, // Animation duration
      useNativeDriver: true, // Use native driver for better performance
    }).start();

    // Navigate to the next screen after a delay
    // const timer = setTimeout(() => {
    //   if (!email) {
    //     navigation.navigate('Login');
    //   } else {
    //     navigation.navigate('BottomNavigation');
    //   }
    // }, 500);

    const timer = setTimeout(() => {
      navigation.navigate('BottomNavigation');
    }, 500);

    return () => clearTimeout(timer);
  }, [navigation, email]);

  return (
    <LinearGradient
      style={styles.gradient}
      colors={['#1A0E7D', Colors.secondary]}
      start={{x: 0.0, y: 0.2}}
      end={{x: 0.7, y: 1.0}}>
      <Animated.View
        style={[
          styles.container,
          {transform: [{translateY: popupTranslateY}]},
        ]}>
        <Image
          source={require('../../assets/AirLogo.png')}
          style={styles.logo}
        />
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1, // Ensures the gradient covers the entire screen
  },
  container: {
    flex: 1,
    justifyContent: 'center', // Centers content vertically
    alignItems: 'center', // Centers content horizontally
  },
  logo: {
    borderRadius: 20,
    width: '60%',
    height: '31%',
  },
  popup: {
    position: 'absolute',
    bottom: 0, // Start at the bottom
    width: '100%',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
  },
  popupText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
});

export default SplashScreen;

// import React, { useEffect, useRef, useContext, useState } from 'react';
// import {
//   View,
//   StyleSheet,
//   Image,
//   Animated,
//   Text,
//   Modal,
//   TouchableOpacity,
//   Linking,
//   BackHandler,
//   Platform,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import DeviceInfo from 'react-native-device-info';
// import axios from 'axios';

// import { Colors } from '../Config/Config';
// import UserContext from '../../context/UserContext';
// import { BaseUrl } from '../Api/BaseUrl';

// const SplashScreen = ({ navigation }) => {
//   const popupTranslateY = useRef(new Animated.Value(200)).current;
//   const { email } = useContext(UserContext);
//   const [forceUpdateData, setForceUpdateData] = useState(null);

//   /* ---------------- VERSION COMPARE ---------------- */
//   const isVersionLower = (current, minimum) => {
//     const c = current.split('.').map(Number);
//     const m = minimum.split('.').map(Number);

//     for (let i = 0; i < m.length; i++) {
//       if ((c[i] || 0) < m[i]) return true;
//       if ((c[i] || 0) > m[i]) return false;
//     }
//     return false;
//   };

//   /* ---------------- CHECK VERSION ---------------- */
//   const checkAppVersion = async () => {
//     try {
//       const res = await axios.get(
//         `${BaseUrl}app-version` // ✅ use full URL
//       );
//       console.log('====================================');
//       console.log("Our App Version: ",res.data);
//       console.log('====================================');
//       const platformData =
//         Platform.OS === 'ios' ? res.data.ios : res.data.android;

//       const currentVersion = DeviceInfo.getVersion();

//       console.log('====================================');
//       console.log("Current Version: ",currentVersion);
//       console.log('====================================');

//       if (
//         platformData.forceUpdate &&
//         isVersionLower(currentVersion, platformData.minimumVersion)
//       ) {
//         setForceUpdateData(platformData); // 🔒 BLOCK APP
//         return;
//       }

//       navigation.replace('BottomNavigation');
//     } catch (error) {
//       // Fail-safe: allow app to open
//       navigation.replace('BottomNavigation');
//     }
//   };

//   /* ---------------- SPLASH ANIMATION ---------------- */
//   useEffect(() => {
//     Animated.timing(popupTranslateY, {
//       toValue: 0,
//       duration: 500,
//       useNativeDriver: true,
//     }).start();

//     checkAppVersion();
//   }, []);

//   /* ---------------- DISABLE BACK BUTTON ---------------- */
//   useEffect(() => {
//     if (!forceUpdateData) return;

//     const backHandler = BackHandler.addEventListener(
//       'hardwareBackPress',
//       () => true // 🚫 block back
//     );

//     return () => backHandler.remove();
//   }, [forceUpdateData]);

//   /* ---------------- ACTIONS ---------------- */
//   const handleCancel = () => {
//     if (Platform.OS === 'android') {
//       BackHandler.exitApp(); // Android only
//     }
//   };

//   const handleUpdate = () => {
//     Linking.openURL(forceUpdateData.updateUrl);
//   };

//   return (
//     <>
//       {/* SPLASH UI */}
//       <LinearGradient
//         style={styles.gradient}
//         colors={['#1A0E7D', Colors.secondary]}
//         start={{ x: 0.0, y: 0.2 }}
//         end={{ x: 0.7, y: 1.0 }}
//       >
//         <Animated.View
//           style={[
//             styles.container,
//             { transform: [{ translateY: popupTranslateY }] },
//           ]}
//         >
//           <Image
//             source={require('../../assets/AirLogo.png')}
//             style={styles.logo}
//           />
//         </Animated.View>
//       </LinearGradient>

//       {/* 🔒 FORCE UPDATE MODAL */}
//       {forceUpdateData && (
//         <Modal transparent visible animationType="fade">
//           <View style={styles.overlay}>
//             <View style={styles.updateBox}>
//               <Text style={styles.title}>Update Required</Text>
//               <Text style={styles.message}>
//                 {forceUpdateData.message ||
//                   'Please update the app to continue.'}
//               </Text>

//               <View style={styles.actions}>
//                 {Platform.OS === 'android' && (
//                   <TouchableOpacity onPress={handleCancel}>
//                     <Text style={styles.cancel}>Cancel</Text>
//                   </TouchableOpacity>
//                 )}

//                 <TouchableOpacity onPress={handleUpdate}>
//                   <Text style={styles.update}>Update</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </Modal>
//       )}
//     </>
//   );
// };

// export default SplashScreen;

// /* ---------------- STYLES ---------------- */
// const styles = StyleSheet.create({
//   gradient: {
//     flex: 1,
//   },
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   logo: {
//     borderRadius: 20,
//     width: '60%',
//     height: '31%',
//   },

//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.85)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   updateBox: {
//     width: '85%',
//     backgroundColor: '#fff',
//     borderRadius: 14,
//     padding: 20,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   message: {
//     marginVertical: 12,
//     fontSize: 14,
//     color: '#444',
//   },
//   actions: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//   },
//   cancel: {
//     marginRight: 20,
//     color: 'red',
//     fontWeight: '600',
//   },
//   update: {
//     color: 'green',
//     fontWeight: '600',
//   },
// });
