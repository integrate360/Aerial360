// import React, {useState, useEffect} from 'react';
// import {Text, View, Button, StyleSheet, Alert} from 'react-native';
// import messaging from '@react-native-firebase/messaging';

// const PushNotifications = () => {
//   const [token, setToken] = useState(null);

//   const getToken = async () => {
//     try {
//       const fcmToken = await messaging().getToken();
//       setToken(fcmToken);
//     } catch (error) {
//       console.error('Error fetching FCM Token:', error);
//     }
//   };

//   useEffect(() => {
//     const unsubscribe = messaging().onMessage(async remoteMessage => {
//       Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
//     });

//     return unsubscribe;
//   }, []);

//   return (
//     <View style={styles.container}>
//       <Button title="Get FCM Token" onPress={getToken} />
//       {token && (
//         <View style={styles.tokenContainer}>
//           <Text style={styles.tokenLabel}>Your FCM Token:</Text>
//           <Text style={styles.token}>{token}</Text>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   tokenContainer: {
//     marginTop: 20,
//     alignItems: 'center',
//   },
//   tokenLabel: {
//     fontWeight: 'bold',
//   },
//   token: {
//     marginTop: 10,
//     textAlign: 'center',
//   },
// });

// export default PushNotifications;
