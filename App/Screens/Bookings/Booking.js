// import React, {useEffect, useState, useContext} from 'react';
// import {
//   Text,
//   View,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
//   Dimensions,
//   Image,
//   Button,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import {Appbar} from 'react-native-paper';
// import {useNavigation} from '@react-navigation/native';
// const {width} = Dimensions.get('window');
// import {Colors} from '../Config/Config';
// import UserContext from '../../context/UserContext';
// import axios from 'axios';
// import {BaseUrl} from '../Api/BaseUrl';
// import fonts from '../FontFamily/FontFamily'; // Assuming you have a fonts file
// import moment from 'moment';
// import RescheduleModal from './RescheduleModal';

// const Booking = () => {
//   const [activeTab, setActiveTab] = useState('Current');
//   const navigation = useNavigation();
//   const {userId, token} = useContext(UserContext);
//   const [currentBookings, setCurrentBookings] = useState([]);
//   const [previousBookings, setPreviousBookings] = useState([]);
//   const [loader, setLoader] = useState(false);
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [modal, setModal] = useState(false);

//   useEffect(() => {
//     getAllBookings();
//   }, []);

//   const getAllBookings = async () => {
//     setLoader(true);
//     try {
//       const response = await axios.get(`${BaseUrl}/booking/user/${userId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       if (response?.data?.data) {
//         let upcommingBook = [];
//         let previousBook = [];
//         const now = moment();
//         response?.data?.data?.filter?.(e =>
//           e?.dates.forEach(date => {
//             const dateMoment = moment(date);
//             if (dateMoment.isBefore(now, 'day')) {
//               previousBook.push(e);
//             } else if (dateMoment.isSameOrAfter(now, 'day')) {
//               upcommingBook.push(e);
//             }
//           }),
//         );
//         setCurrentBookings(upcommingBook);
//         setPreviousBookings(previousBook);
//       } else {
//         setCurrentBookings([]);
//         setPreviousBookings([]);
//       }
//     } catch (error) {
//       console.error(
//         'Error fetching bookings:',
//         error.response?.data || error.message,
//       );
//     } finally {
//       setLoader(false);
//     }
//   };

//   const convertTo12HourFormat = time24 => {
//     if (!time24 || typeof time24 !== 'string') {
//       return 'Invalid time';
//     }

//     const [hours, minutes] = time24.split(':').map(Number);
//     const period = hours >= 12 ? 'PM' : 'AM';
//     const adjustedHours = hours % 12 || 12;
//     const formattedMinutes = minutes.toString().padStart(2, '0');

//     return `${adjustedHours}:${formattedMinutes} ${period}`;
//   };
//   const renderBookingItem = ({item}) => {
//     const isCurrentSame =
//       moment(item?.dates[0]).format('DD-MM-YYYY') !=
//       moment(Date.now()).format('DD-MM-YYYY');
//     const isThreeHoursBefore =
//       moment(item?.dates[0]).diff(moment(Date.now()), 'hours') > 3;
//     const isEditable = isCurrentSame && isThreeHoursBefore;
//     return (
//       <View style={styles.card}>
//         <Image source={{uri: item?.class?.image[0]}} style={styles.image} />
//         <View style={styles.content}>
//           <Text style={styles.cardTitle}>{item?.class?.name}</Text>
//           {item?.package?.name && (
//             <Text style={styles.cardSubtitle}>{item?.package?.name}</Text>
//           )}
//           <Text style={styles.cardDate}>
//             {moment(item?.dates[0]).format('DD MMM YYYY')}
//           </Text>
//           <Text style={styles.cardTime}>
//             Time: {convertTo12HourFormat(item?.time)}
//           </Text>
//           <View
//             style={{
//               flexDirection: 'row',
//               alignItems: 'center',
//               justifyContent: 'space-between',
//             }}>
//             <Text style={styles.cardLocation}>{item?.location?.name}</Text>
//             {isEditable && (
//               <TouchableOpacity
//                 style={styles.button}
//                 onPress={() => {
//                   setModal(true);
//                   setSelectedBooking(item);
//                 }}>
//                 <Text style={styles.buttonText}>Reschedule</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <>
//       <LinearGradient
//         style={styles.gradient}
//         colors={[Colors.primary, Colors.secondary]}
//         start={{x: 0.0, y: 0.3}}
//         end={{x: 0.7, y: 0.4}}>
//         <Appbar.Header style={styles.appbarHeader}>
//           <Appbar.BackAction
//             size={30}
//             color="#fff"
//             onPress={() => navigation.goBack()}
//           />
//           <Text style={styles.headerTitle}>My Bookings</Text>
//         </Appbar.Header>
//       </LinearGradient>
//       <View style={styles.container}>
//         <View style={styles.tabContainer}>
//           <TouchableOpacity
//             style={[styles.tab, activeTab === 'Current' && styles.activeTab]}
//             onPress={() => setActiveTab('Current')}>
//             <Text
//               style={[
//                 styles.tabText,
//                 activeTab === 'Current' && styles.activeTabText,
//               ]}>
//               Upcomming
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.tab, activeTab === 'Previous' && styles.activeTab]}
//             onPress={() => setActiveTab('Previous')}>
//             <Text
//               style={[
//                 styles.tabText,
//                 activeTab === 'Previous' && styles.activeTabText,
//               ]}>
//               Completed
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {loader ? (
//           <Text style={styles.emptyText}>Loading...</Text>
//         ) : (
//           <FlatList
//             data={activeTab === 'Current' ? currentBookings : previousBookings}
//             keyExtractor={(item, index) => index.toString()}
//             renderItem={renderBookingItem}
//             contentContainerStyle={styles.listContainer}
//             ListEmptyComponent={
//               <Text style={styles.emptyText}>No bookings available.</Text>
//             }
//           />
//         )}
//       </View>
//       {modal && (
//         <RescheduleModal
//           fetchData={() => getAllBookings()}
//           handleModalClose={() => setModal(false)}
//           selectedBooking={selectedBooking}
//           key={selectedBooking?._id}
//         />
//       )}
//     </>
//   );
// };

// // Styles for the UI with font family applied globally
// const styles = StyleSheet.create({
//   gradient: {},
//   appbarHeader: {
//     backgroundColor: 'transparent',
//   },
//   headerTitle: {
//     color: '#FFF',
//     fontWeight: '400',
//     fontSize: 21,
//     textAlign: 'left',
//     flex: 1,

//     fontFamily: fonts.regular, // Apply font family
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f8f8',
//     paddingHorizontal: 10,
//     paddingTop: 20,
//     fontFamily: fonts.regular, // Apply font family globally
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: 20,
//   },
//   tab: {
//     flex: 1,
//     paddingVertical: 10,
//     marginHorizontal: 5,
//     borderRadius: 25,
//     alignItems: 'center',
//     backgroundColor: '#ddd',
//     color: 'black',
//   },
//   activeTab: {
//     backgroundColor: Colors.primary,
//   },
//   tabText: {
//     fontSize: 16,
//     color: '#fff',
//     fontWeight: '500',
//     fontFamily: fonts.regular, // Apply font family
//   },
//   activeTabText: {
//     fontWeight: '700',
//     fontFamily: fonts.regular,
//   },
//   card: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     marginVertical: 8,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//     alignItems: 'center',
//   },
//   image: {
//     width: 140,
//     height: 150,
//     borderRadius: 10,
//     borderTopRightRadius: 0,
//     borderBottomRightRadius: 0,
//     marginRight: 6,
//   },
//   content: {
//     flex: 1,
//     flexDirection: 'column',
//     padding: 12,
//     justifyContent: 'center',
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 4,
//   },
//   cardSubtitle: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#555',
//     marginBottom: 4,
//   },
//   cardDate: {
//     fontSize: 14,
//     color: 'black',

//     marginBottom: 2,
//   },
//   cardTime: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 2,
//   },
//   cardLocation: {
//     fontSize: 14,
//     color: '#007bff',
//     fontWeight: '500',
//   },
//   cardPrice: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#27ae60',
//     marginTop: 6,
//   },
//   listContainer: {
//     paddingBottom: 20,
//   },
//   emptyText: {
//     textAlign: 'center',
//     color: '#555',
//     fontSize: 16,
//     marginTop: 20,
//     fontFamily: fonts.regular, // Apply font family
//   },
//   button: {
//     // backgroundColor: 'lightblue', // Blue color
//     paddingVertical: 6,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//   },
//   buttonText: {
//     color: '#007bff',
//     textDecorationLine: 'underline',
//     fontSize: 16,
//     textAlign: 'right',
//     fontWeight: 'bold',
//   },
// });

// export default Booking;

// import React, {useEffect, useState, useContext} from 'react';
// import {
//   Text,
//   View,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
//   Dimensions,
//   Image,
//   Button,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import {Appbar} from 'react-native-paper';
// import {useNavigation} from '@react-navigation/native';
// const {width} = Dimensions.get('window');
// import {Colors} from '../Config/Config';
// import UserContext from '../../context/UserContext';
// import axios from 'axios';
// import {BaseUrl} from '../Api/BaseUrl';
// import fonts from '../FontFamily/FontFamily'; // Assuming you have a fonts file
// import moment from 'moment';
// import RescheduleModal from './RescheduleModal';

// const Booking = () => {
//   const [activeTab, setActiveTab] = useState('Current');
//   const navigation = useNavigation();
//   const {userId, token} = useContext(UserContext);
//   const [currentBookings, setCurrentBookings] = useState([]);
//   const [previousBookings, setPreviousBookings] = useState([]);
//   const [loader, setLoader] = useState(false);
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [modal, setModal] = useState(false);

//   useEffect(() => {
//     getAllBookings();
//   }, []);

// const getAllBookings = async () => {
//   setLoader(true);
//   try {
//     const response = await axios.get(`${BaseUrl}/booking/user/${userId}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     console.log("Response of All Bookings: ", response.data);

//     if (response?.data?.data) {
//       const now = moment();
//       const upcommingBook = [];
//       const previousBook = [];

//       response.data.data.forEach(booking => {
//         // Check if ALL dates in this booking are in the past
//         const allDatesPast = booking.dates.every(date => 
//           moment(date).isBefore(now, 'day')
//         );

//         // Check if ANY date is upcoming (today or future)
//         const hasUpcomingDate = booking.dates.some(date => 
//           moment(date).isSameOrAfter(now, 'day')
//         );

//         if (hasUpcomingDate) {
//           // If any date is upcoming, it goes to Upcoming tab
//           upcommingBook.push(booking);
//         } else if (allDatesPast) {
//           // If all dates are past, it goes to Completed tab
//           previousBook.push(booking);
//         }
//       });

//       console.log('Upcoming bookings count:', upcommingBook.length);
//       console.log('Completed bookings count:', previousBook.length);
//       console.log('Completed bookings data:', previousBook);

//       setCurrentBookings(upcommingBook);
//       setPreviousBookings(previousBook);
//     } else {
//       setCurrentBookings([]);
//       setPreviousBookings([]);
//     }
//   } catch (error) {
//     console.error(
//       'Error fetching bookings:',
//       error.response?.data || error.message,
//     );
//   } finally {
//     setLoader(false);
//   }
// };

//   const convertTo12HourFormat = time24 => {
//     if (!time24 || typeof time24 !== 'string') {
//       return 'Invalid time';
//     }

//     const [hours, minutes] = time24.split(':').map(Number);
//     const period = hours >= 12 ? 'PM' : 'AM';
//     const adjustedHours = hours % 12 || 12;
//     const formattedMinutes = minutes.toString().padStart(2, '0');

//     return `${adjustedHours}:${formattedMinutes} ${period}`;
//   };

//   const renderBookingItem = ({item}) => {
//      console.log('Booking new item data:', item);
//   console.log('Class new item data:', item.class);
//   console.log('Class new item images:', Array.isArray(item.class) ? item.class[0]?.image : item.class?.image);
//     const bookingDateTime = moment(
//       `${item?.dates[0]} ${item?.time}`,
//       'YYYY-MM-DD HH:mm',
//     );
//     const isEditable = bookingDateTime.diff(moment(), 'hours') >= 3;

//     // Handle `class` being either a string or array
//     const classData = Array.isArray(item.class)
//       ? item.class[0]
//       : {name: item.class};

//     return (
//       <View style={styles.card}>
//         {classData?.image?.[0] && (
//           <Image source={{uri: classData.image[0]}} style={styles.image} />
//         )}

//         <View style={styles.content}>
//           <TouchableOpacity
//             onPress={() => {
//               const availability = classData?.availability;
//               // const class = classData?.availability;
//               console.log('Class Availability:', availability);
//               console.log('Class Id:', classData?._id);
//             }}>
//             <Text style={styles.cardTitle}>{classData?.name}</Text>
//           </TouchableOpacity>

//           {item?.package?.name && (
//             <Text style={styles.cardSubtitle}>{item.package.name}</Text>
//           )}

//           <Text style={styles.cardDate}>
//             {moment(item?.dates[0]).format('DD MMM YYYY')}
//           </Text>

//           <Text style={styles.cardTime}>
//             Time:{' '}
//             {Array.isArray(item?.time)
//               ? item.time.map((t, idx) => convertTo12HourFormat(t)).join(', ')
//               : convertTo12HourFormat(item?.time)}
//           </Text>

//           <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
//             <Text style={styles.cardLocation}>{item?.location?.name}</Text>

//             {isEditable && (
//               <TouchableOpacity
//                 style={styles.button}
//                 onPress={() => {
//                   setModal(true);
//                   setSelectedBooking({
//                     ...item,
//                     classData: classData,
//                     classId: classData?._id,
//                     classAvailability: classData?.availability, // Add availability to the selected booking
//                   });
//                 }}>
//                 <Text style={styles.buttonText}>Reschedule</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <>
//       <LinearGradient
//         style={styles.gradient}
//         colors={[Colors.primary, Colors.secondary]}
//         start={{x: 0.0, y: 0.3}}
//         end={{x: 0.7, y: 0.4}}>
//         <Appbar.Header style={styles.appbarHeader}>
//           <Appbar.BackAction
//             size={30}
//             color="#fff"
//             onPress={() => navigation.goBack()}
//           />
//           <Text style={styles.headerTitle}>My Bookings</Text>
//         </Appbar.Header>
//       </LinearGradient>
//       <View style={styles.container}>
//         <View style={styles.tabContainer}>
//           <TouchableOpacity
//             style={[styles.tab, activeTab === 'Current' && styles.activeTab]}
//             onPress={() => setActiveTab('Current')}>
//             <Text
//               style={[
//                 styles.tabText,
//                 activeTab === 'Current' && styles.activeTabText,
//               ]}>
//               Upcoming
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.tab, activeTab === 'Previous' && styles.activeTab]}
//             onPress={() => setActiveTab('Previous')}>
//             <Text
//               style={[
//                 styles.tabText,
//                 activeTab === 'Previous' && styles.activeTabText,
//               ]}>
//               Completed
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {loader ? (
//           <Text style={styles.emptyText}>Loading...</Text>
//         ) : (
//           <FlatList
//             data={activeTab === 'Current' ? currentBookings : previousBookings}
//             keyExtractor={(item, index) => index.toString()}
//             renderItem={renderBookingItem}
//             contentContainerStyle={styles.listContainer}
//             ListEmptyComponent={
//               <Text style={styles.emptyText}>No bookings available.</Text>
//             }
//           />
//         )}
//       </View>
//       {modal && (
//         <RescheduleModal
//           fetchData={() => getAllBookings()}
//           handleModalClose={() => setModal(false)}
//           selectedBooking={selectedBooking}
//           packageDuration={selectedBooking?.package?.duration}
//           classAvailability={selectedBooking?.classAvailability}
//           classId={selectedBooking?.classId} // ✅ Updated this
//           key={selectedBooking?._id}
//         />
//       )}
//     </>
//   );
// };

// // Styles for the UI with font family applied globally
// const styles = StyleSheet.create({
//   gradient: {},
//   appbarHeader: {
//     backgroundColor: 'transparent',
//   },
//   headerTitle: {
//     color: '#FFF',
//     fontWeight: '400',
//     fontSize: 21,
//     textAlign: 'left',
//     flex: 1,

//     fontFamily: fonts.regular, // Apply font family
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f8f8',
//     paddingHorizontal: 10,
//     paddingTop: 20,
//     fontFamily: fonts.regular, // Apply font family globally
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: 20,
//   },
//   tab: {
//     flex: 1,
//     paddingVertical: 10,
//     marginHorizontal: 5,
//     borderRadius: 25,
//     alignItems: 'center',
//     backgroundColor: '#ddd',
//     color: 'black',
//   },
//   activeTab: {
//     backgroundColor: Colors.primary,
//   },
//   tabText: {
//     fontSize: 16,
//     color: '#fff',
//     fontWeight: '500',
//     fontFamily: fonts.regular, // Apply font family
//   },
//   activeTabText: {
//     fontWeight: '700',
//     fontFamily: fonts.regular,
//   },
//   card: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     marginVertical: 8,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//     alignItems: 'center',
//   },
//   image: {
//     width: 140,
//     height: 150,
//     borderRadius: 10,
//     borderTopRightRadius: 0,
//     borderBottomRightRadius: 0,
//     marginRight: 6,
//   },
//   content: {
//     flex: 1,
//     flexDirection: 'column',
//     padding: 12,
//     justifyContent: 'center',
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 4,
//   },
//   cardSubtitle: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#555',
//     marginBottom: 4,
//   },
//   cardDate: {
//     fontSize: 14,
//     color: 'black',

//     marginBottom: 2,
//   },
//   cardTime: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 2,
//   },
//   cardLocation: {
//     fontSize: 14,
//     color: '#007bff',
//     fontWeight: '500',
//   },
//   cardPrice: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#27ae60',
//     marginTop: 6,
//   },
//   listContainer: {
//     paddingBottom: 20,
//   },
//   emptyText: {
//     textAlign: 'center',
//     color: '#555',
//     fontSize: 16,
//     marginTop: 20,
//     fontFamily: fonts.regular, // Apply font family
//   },
//   button: {
//     // backgroundColor: 'lightblue', // Blue color
//     paddingVertical: 6,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//   },
//   buttonText: {
//     color: '#007bff',
//     textDecorationLine: 'underline',
//     fontSize: 16,
//     textAlign: 'right',
//     fontWeight: 'bold',
//   },
// });

// export default Booking;

import React, { useEffect, useState, useContext } from 'react';
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Add this import
const { width } = Dimensions.get('window');
import { Colors } from '../Config/Config';
import UserContext from '../../context/UserContext';
import axios from 'axios';
import { BaseUrl } from '../Api/BaseUrl';
import fonts from '../FontFamily/FontFamily';
import moment from 'moment';
import RescheduleModal from './RescheduleModal';
import Toast from 'react-native-toast-message';

const Booking = () => {
  const [activeTab, setActiveTab] = useState('Current');
  const navigation = useNavigation();
  const { userId, token } = useContext(UserContext);
  const [currentBookings, setCurrentBookings] = useState([]);
  const [previousBookings, setPreviousBookings] = useState([]);
  const [loader, setLoader] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    getAllBookings();
  }, []);

  const getAllBookings = async () => {
    setLoader(true);
    try {
      const response = await axios.get(`${BaseUrl}/booking/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response of All Bookings: ", response.data);

      if (response?.data?.data) {
        const now = moment();
        const upcommingBook = [];
        const previousBook = [];

        response.data.data.forEach(booking => {
          const allDatesPast = booking.dates.every(date =>
            moment(date).isBefore(now, 'day')
          );

          const hasUpcomingDate = booking.dates.some(date =>
            moment(date).isSameOrAfter(now, 'day')
          );

          if (hasUpcomingDate) {
            upcommingBook.push(booking);
          } else if (allDatesPast) {
            previousBook.push(booking);
          }
        });

        console.log('Upcoming bookings count:', upcommingBook.length);
        console.log('Completed bookings count:', previousBook.length);

        setCurrentBookings(upcommingBook);
        setPreviousBookings(previousBook);
      } else {
        setCurrentBookings([]);
        setPreviousBookings([]);
      }
    } catch (error) {
      console.error(
        'Error fetching bookings:',
        error.response?.data || error.message,
      );
    } finally {
      setLoader(false);
    }
  };

  const deleteBookingFromPackage = async (bookingId) => {
    try {
      const response = await axios.delete(
        `${BaseUrl}/delete-booking-from-package/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if status code is 200 for success
      if (response.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Booking Cancelled',
          text2: response.data.message || 'Booking cancelled successfully',
        });        // Refresh the bookings list
        getAllBookings();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Cancellation Failed',
          text2: response.data.message || 'Failed to delete booking',
        });
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to delete booking',
      });
    }
  };

  const handleDeleteBooking = (booking) => {
    const bookingDateTime = moment(
      `${booking?.dates[0]} ${booking?.time}`,
      'YYYY-MM-DD HH:mm'
    );
    if (bookingDateTime.diff(moment(), 'hours', true) < 3) {
      Alert.alert(
        'Cancellation Not Allowed',
        'You can cancel a booking only at least 3 hours before the start time.'
      );
      return;
    }

    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => deleteBookingFromPackage(booking._id),
        },
      ]
    );
  };

  const convertTo12HourFormat = (time24) => {
    if (!time24 || typeof time24 !== 'string') {
      return 'Invalid time';
    }

    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const adjustedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');

    return `${adjustedHours}:${formattedMinutes} ${period}`;
  };

  // Enhanced function to detect package bookings
  const isPackageBooking = (booking) => {
    // Check multiple indicators of package booking
    return (
      booking.package !== null && booking.package !== undefined || // Direct package reference
      booking.uuid !== undefined && booking.uuid !== null || // UUID presence
      (booking.amount > 0 && booking.duration > 60) // Additional business logic indicators
    );
  };

  const renderBookingItem = ({ item }) => {
    console.log('Booking new item data:', item);
    console.log('Package data:', item.package);
    console.log('UUID:', item.uuid);
    console.log('Is package booking:', isPackageBooking(item));

    const bookingDateTime = moment(
      `${item?.dates[0]} ${item?.time}`,
      'YYYY-MM-DD HH:mm'
    );
    const isEditable = bookingDateTime.diff(moment(), 'hours') >= 3;

    // Use enhanced package booking detection
    const isPackage = isPackageBooking(item);

    // Check if delete option should be shown (package booking and within 3 hours)
    const showDeleteOption = isPackage && isEditable;

    // Handle `class` being either a string or array
    const classData = Array.isArray(item.class)
      ? item.class[0]
      : { name: item.class };

    return (
      <View style={styles.card}>
        {classData?.image?.[0] && (
          <Image source={{ uri: classData.image[0] }} style={styles.image} />
        )}

        <View style={styles.content}>
          <TouchableOpacity
            onPress={() => {
              const availability = classData?.availability;
              console.log('Class Availability:', availability);
              console.log('Class Id:', classData?._id);
            }}>
            <Text style={styles.cardTitle}>{classData?.name}</Text>
          </TouchableOpacity>

          {/* Show package name if available, otherwise show indicator */}
          {item?.package?.name ? (
            <Text style={styles.cardSubtitle}>{item.package.name}</Text>
          ) : null}

          <Text style={styles.cardDate}>
            {moment(item?.dates[0]).format('DD MMM YYYY')}
          </Text>

          <Text style={styles.cardTime}>
            Time:{' '}
            {Array.isArray(item?.time)
              ? item.time.map((t, idx) => convertTo12HourFormat(t)).join(', ')
              : convertTo12HourFormat(item?.time)}
          </Text>

          <View style={styles.actionButtonsContainer}>
            <Text style={styles.cardLocation}>{item?.location?.name}</Text>

            <View style={styles.buttonsRow}>
              {isEditable && (
                <TouchableOpacity
                  style={styles.rescheduleButton}
                  onPress={() => {
                    setModal(true);
                    setSelectedBooking({
                      ...item,
                      classData: classData,
                      classId: classData?._id,
                      classAvailability: classData?.availability,
                    });
                  }}>
                  <Icon name="calendar-edit" size={20} color="#007bff" />
                  {/* <Text style={styles.rescheduleButtonText}>Reschedule</Text> */}
                </TouchableOpacity>
              )}

              {showDeleteOption && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteBooking(item)}>
                  <Icon name="trash-can-outline" size={18} color="#fff" />
                  {/* <Text style={styles.deleteButtonText}>Cancel</Text> */}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <LinearGradient
        style={styles.gradient}
        colors={[Colors.primary, Colors.secondary]}
        start={{ x: 0.0, y: 0.3 }}
        end={{ x: 0.7, y: 0.4 }}>
        <Appbar.Header style={styles.appbarHeader}>
          <Appbar.BackAction
            size={30}
            color="#fff"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>My Bookings</Text>
        </Appbar.Header>
      </LinearGradient>
      <View style={styles.container}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Current' && styles.activeTab]}
            onPress={() => setActiveTab('Current')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'Current' && styles.activeTabText,
              ]}>
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Previous' && styles.activeTab]}
            onPress={() => setActiveTab('Previous')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'Previous' && styles.activeTabText,
              ]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        {loader ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : (
          <FlatList
            data={activeTab === 'Current' ? currentBookings : previousBookings}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderBookingItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No bookings available.</Text>
            }
          />
        )}
      </View>
      {modal && (
        <RescheduleModal
          fetchData={() => getAllBookings()}
          handleModalClose={() => setModal(false)}
          selectedBooking={selectedBooking}
          packageDuration={selectedBooking?.package?.duration}
          extendedValidityEndDate={selectedBooking?.package?.extendedValidityEndDate}
          userPackage={selectedBooking?.package}
          classAvailability={selectedBooking?.classAvailability}
          classId={selectedBooking?.classId}
          key={selectedBooking?._id}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  gradient: {},
  appbarHeader: {
    backgroundColor: 'transparent',
  },
  headerTitle: {
    color: '#FFF',
    fontWeight: '400',
    fontSize: 21,
    textAlign: 'left',
    flex: 1,
    fontFamily: fonts.regular,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 10,
    paddingTop: 20,
    fontFamily: fonts.regular,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 25,
    alignItems: 'center',
    backgroundColor: '#ddd',
    color: 'black',
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  activeTabText: {
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  image: {
    width: 140,
    height: 150,
    borderRadius: 10,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    marginRight: 6,
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    padding: 12,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 4,
  },
  packageIndicator: {
    fontSize: 12,
    fontWeight: '500',
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 14,
    color: 'black',
    marginBottom: 2,
  },
  cardTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  cardLocation: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rescheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007bff',
    backgroundColor: '#f0f8ff',
  },
  rescheduleButtonText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#ff4444',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#555',
    fontSize: 16,
    marginTop: 20,
    fontFamily: fonts.regular,
  },
});

export default Booking;
// const renderBookingItem = ({item}) => {
//   const bookingDateTime = moment(
//     `${item?.dates[0]} ${item?.time}`,
//     'YYYY-MM-DD HH:mm',
//   );

//   console.log('Booking Item: ', item);
//   const isEditable = bookingDateTime.diff(moment(), 'hours') >= 3;

//   return (
//     <View style={styles.card}>
//       {/* <Image source={{uri: item?.class?.image[0]}} style={styles.image} /> */}
//       {item?.class?.image?.[0] && (
//         <Image source={{uri: item.class.image[0]}} style={styles.image} />
//       )}

//       <View style={styles.content}>
//         <Text style={styles.cardTitle}>{item?.class?.name}</Text>
//         {item?.package?.name && (
//           <Text style={styles.cardSubtitle}>{item?.package?.name}</Text>
//         )}
//         <Text style={styles.cardDate}>
//           {moment(item?.dates[0]).format('DD MMM YYYY')}
//         </Text>
//         <Text style={styles.cardTime}>
//           Time: {convertTo12HourFormat(item?.time)}
//         </Text>
//         <View
//           style={{
//             flexDirection: 'row',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//           }}>
//           <Text style={styles.cardLocation}>{item?.location?.name}</Text>
//           {isEditable && (
//             <TouchableOpacity
//               style={styles.button}
//               onPress={() => {
//                 setModal(true);
//                 setSelectedBooking(item);
//               }}>
//               <Text style={styles.buttonText}>Reschedule</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>
//     </View>
//   );
// };