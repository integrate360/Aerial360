// import React, { useContext, useEffect, useState } from 'react';
// import RazorpayCheckout from 'react-native-razorpay';
// import fonts from '../FontFamily/FontFamily';
// import { RAZORPAY_KEY_ID } from '../Config/Config';
// import { Calendar } from 'react-native-calendars';
// import { Colors } from '../Config/Config';
// import {
//   ActivityIndicator,
//   Button,
// } from 'react-native-paper';
// import BookingSuccessModal from '../Bookings/SucessfullModa';
// import moment from 'moment';
// import { showAvailability } from '../Api/Allapi';
// import UserContext from '../../context/UserContext';
// import { Checkbox } from 'react-native-paper';
// import { useNavigation } from '@react-navigation/native';
// import {
//   Text,
//   View,
//   StyleSheet,
//   Modal,
//   TouchableOpacity,
//   Alert,
//   ToastAndroid,
// } from 'react-native';
// import { ScrollView } from 'react-native-gesture-handler';
// import axios from 'axios';
// import { BaseUrl } from '../Api/BaseUrl';

// const ClassBookingCalendarModal = ({ modal, closeModal, item }) => {
//   const { userId, user } = useContext(UserContext);
//   const navigation = useNavigation();
//   const [markedDates, setMarkedDates] = useState({});
//   const [locations, setLocations] = useState([]);
//   const [menuVisible, setMenuVisible] = useState(false);
//   const [selectedLocation, setSelectedLocation] = useState(null);
//   const [selectedTimes, setSelectedTimes] = useState([]);
//   const [durations, setDurations] = useState('');
//   const [isTnc, setIsTnc] = useState(false);
//   const [processingPayment, setProcessingPayment] = useState(false);

//   const today = moment()?.format('YYYY-MM-DD');
//   const [loading, setLoading] = useState(false);
//   const [showAvailabilitys, setShowAvailability] = useState(null);
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [overviewModal, setOverviewModal] = useState(false);
//   const [fullyBookedDates, setFullyBookedDates] = useState({}); // New state for fully booked dates

//     const calendarLegends = [
//     { name: 'Available', color: Colors?.primary },
//     { name: 'Fully Booked', color: 'pink' },
//     { name: 'Not Available', color: 'lightgray' },
//   ];


// useEffect(() => {
//   if (selectedLocation) {
//     console.log('Current Selected Location START:', {
//       id: selectedLocation?.key,
//       name: selectedLocation?.value,
//       fullLocationObject: selectedLocation
//     });

//     // Log selected data when location changes
//     logSelectedData();
//   }
// }, [selectedLocation]);

//   useEffect(() => {
//     if (item) {
//       markCalendarDates(item?.availability);
//       // Fetch fully booked dates when component loads
//       fetchFullyBookedDates();
//     }
//   }, [item]);


//   const logSelectedData = () => {
//     const selectedData = {
//       classId: item?._id,
//       className: item?.name,
//       selectedDate: selectedDate,
//       selectedTime: selectedTimes[0],
//       selectedLocation: {
//         id: selectedLocation?.key,
//         name: selectedLocation?.value
//       },
//       duration: durations,
//       price: item?.price
//     };

//     console.log('=== ALL SELECTED DATA ===', selectedData);

//     // Fetch fully booked dates whenever selection changes
//     if (selectedData.selectedDate && selectedData.selectedTime && selectedData.selectedLocation.id) {
//       fetchFullyBookedDates();
//     }
//   };

//   // Function to check slot availability for a specific date, time, and location
//   const checkSlotAvailability = async (date, time, locationId) => {
//     try {
//       console.log('Checking slot availability for:', { date, time, locationId });

//       const response = await axios.get(`${BaseUrl}getAllBookingsdatestest`, {
//         params: {
//           date: date,
//           classId: item?._id,
//           time: time,
//           locationId: locationId
//         },
//       });

//       console.log('Slot availability response:', response.data);
//       return response.data;
//     } catch (error) {
//       console.error('Error checking slot availability:', error);
//       console.log('Error details:', error.response?.data || error.message);
//       return null;
//     }
//   };

//   // Function to fetch and mark fully booked dates
//   const fetchFullyBookedDates = async () => {
//     try {
//       if (!item?._id || !selectedLocation?.key || !selectedTimes[0]) {
//         console.log('Missing required data to fetch fully booked dates');
//         return;
//       }

//       const currentDate = moment().startOf('day');
//       const validityTill = moment().add(60, 'days');
//       const fullyBookedDatesData = {};

//       // Check availability for each date in the range
//       while (currentDate.isSameOrBefore(validityTill)) {
//         const dateString = currentDate.format('YYYY-MM-DD');

//         // Only check dates that are available (not disabled)
//         const validDays = new Set(item?.availability?.map(avail => avail?.day));
//         if (validDays.has(currentDate.day())) {
//           try {
//             const availabilityData = await checkSlotAvailability(
//               dateString,
//               selectedTimes[0],
//               selectedLocation?.key
//             );

//             if (availabilityData?.specificAvailability?.isFull) {
//               fullyBookedDatesData[dateString] = {
//                 customStyles: {
//                   container: {
//                     backgroundColor: 'pink', // Pink background for fully booked
//                   },
//                   text: {
//                     color: 'white',
//                     fontWeight: 'bold',
//                   },
//                 },
//                 disabled: false, // Keep it clickable but show it's full
//               };
//               console.log(`Date ${dateString} is fully booked`);
//             }
//           } catch (error) {
//             console.log(`Error checking availability for ${dateString}:`, error);
//           }
//         }

//         currentDate.add(1, 'day');
//       }

//       setFullyBookedDates(fullyBookedDatesData);
//       console.log('Fully booked dates:', fullyBookedDatesData);

//     } catch (error) {
//       console.error('Error fetching fully booked dates:', error);
//     }
//   };


//  const markCalendarDates = (availability, fullyBookedDatesData = {}) => {
//     const availabilityData = {};
//     const currentDate = moment().startOf('day');
//     const validityTill = moment().add(60, 'days');

//     const validDays = new Set(availability?.map(item => item?.day));
//     while (currentDate.isSameOrBefore(validityTill)) {
//       const dateString = currentDate.format('YYYY-MM-DD');

//       // Check if date is fully booked first
//       if (fullyBookedDatesData[dateString]) {
//         availabilityData[dateString] = fullyBookedDatesData[dateString];
//       } 
//       // Then check if it's a valid day
//       else if (validDays.has(currentDate.day())) {
//         availabilityData[dateString] = {
//           customStyles: {
//             container: {
//               backgroundColor: Colors?.primary,
//             },
//             text: {
//               color: 'white',
//             },
//           },
//         };
//       } else {
//         availabilityData[dateString] = {
//           customStyles: {
//             container: {
//               backgroundColor: '#f0f0f0',
//             },
//             text: {
//               color: '#d0d0d0',
//             },
//           },
//           disabled: true,
//           disableTouchEvent: true,
//         };
//       }

//       currentDate.add(1, 'day');
//     }

//     setMarkedDates(availabilityData);
//   };

//   if (!item) {
//     return (
//       <View style={styles.container}>
//         <Text>No data available</Text>
//       </View>
//     );
//   }

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

//   const handleLocationSelect = location => {
//     console.log('Selected Location:', {
//       id: location?.key,
//       name: location?.value,
//       fullLocationObject: location
//     });
//     setSelectedLocation(location);
//     setMenuVisible(false);

//     // Log selected data
//     setTimeout(() => {
//       logSelectedData();
//     }, 100);
//   };

// const handleDateSelect = date => {
//   setSelectedDate(date);

//   const newDateDuration = new Date(date)?.getDay();
//   const duration =
//     item?.availability?.filter(res => newDateDuration === res?.day) || [];
//   setDurations(duration?.duration);
//   setLoading(true);
//   setSelectedTimes([]);
//   Showdate(date);

//   // Log selected data
//   setTimeout(() => {
//     logSelectedData();
//   }, 100);
// };

//   const Showdate = date => {
//     showAvailability(moment(date).format('DD-MM-YYYY'), item?._id)
//       .then(res => {
//         setShowAvailability(res);
//         processAvailabilityData(res);
//         setLoading(false);
//       })
//       .catch(() => setLoading(false));
//   };

// const processAvailabilityData = availability => {
//   if (availability && availability.slots) {
//     const availableSlots = availability.slots.map(slot => ({
//       time: slot.time,
//       locations: slot.locations.map(location => ({
//         key: location._id,
//         value: location.name,
//       })),
//     }));

//     if (availableSlots.length > 0) {
//       const firstSlot = availableSlots[0];
//       setSelectedTimes([firstSlot?.time]);
//       setSelectedLocation(firstSlot?.locations[0]);
//       setLocations(firstSlot?.locations);

//       // Log the initially selected location from API data
//       if (firstSlot?.locations[0]) {
//         console.log('Initial Location from API:', {
//           id: firstSlot?.locations[0]?.key,
//           name: firstSlot?.locations[0]?.value,
//           fullLocationObject: firstSlot?.locations[0]
//         });
//       }
//     }
//   }
// };

//   const handleTimeSelect = (time, location) => {
//     if (!time || !location) return;
//     const newData = location?.map(loc => ({
//       ...loc,
//       key: loc?._id,
//       value: loc?.name,
//     }));
//     console.log('Available Locations for time:', time, newData);
//     setLocations(newData);
//     setSelectedLocation(newData[0] || {});
//     setSelectedTimes([time]);

//     // Also log the initially selected location
//     if (newData[0]) {
//       console.log('Initially Selected Location:', {
//         id: newData[0]?.key,
//         name: newData[0]?.value,
//         fullLocationObject: newData[0]
//       });
//     }

//     // Log selected data
//     setTimeout(() => {
//       logSelectedData();
//     }, 100);
//   };

//   const startRazorpayPayment = async () => {
//     if (!userId) {
//       ToastAndroid.show("User not authenticated", ToastAndroid.SHORT);
//       return;
//     }

//     if (!selectedDate || !selectedTimes.length || !selectedLocation) {
//       ToastAndroid.show("Please select date, time and location", ToastAndroid.SHORT);
//       return;
//     }

//     try {
//       setProcessingPayment(true);

//       // Prepare payload for class booking - matching backend expectations
//       const payload = {
//         class: item?._id,
//         user: userId,
//         dates: [selectedDate],
//         location: selectedLocation?.key,
//         amount: item?.price,
//         time: selectedTimes[0],
//         duration: durations,
//         people: 1
//       };

//       console.log('Creating class order with payload:', payload);

//       // 1) Call backend to create Razorpay order
//       const createRes = await axios.post(`${BaseUrl}create-class-order`, payload, {
//         headers: { "Content-Type": "application/json" },
//       });

//       if (!createRes?.data?.success) {
//         throw new Error(createRes?.data?.message || "Failed to create order");
//       }

//       const orderId = createRes.data.orderId;
//       const orderAmount = createRes.data.amount;

//       console.log('Order created:', orderId, 'Amount:', orderAmount);

//       // 2) Open Razorpay checkout with the order_id from backend
//       const options = {
//         description: `Payment for class ${item?.name}`,
//         image: item?.image[0] ?? '',
//         currency: "INR",
//         key: RAZORPAY_KEY_ID,
//         amount: orderAmount,
//         order_id: orderId, // Use order_id from backend
//         name: item?.name || "Class Booking",
//         prefill: {
//           email: user?.email || "",
//           contact: user?.phone || "",
//           name: user?.name || "",
//         },
//         theme: { color: Colors.primary || "#528FF0" },
//       };

//       console.log('Opening Razorpay with options:', options);

//       RazorpayCheckout.open(options)
//         .then(async (paymentResult) => {
//           console.log('Razorpay payment result:', paymentResult);

//           const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = paymentResult;

//           // 3) Verify payment at backend
//           try {
//             const verifyRes = await axios.post(`${BaseUrl}verify-class-order`, {
//               razorpay_order_id,
//               razorpay_payment_id,
//               razorpay_signature,
//             }, {
//               headers: { "Content-Type": "application/json" },
//             });

//             console.log('Verification response:', verifyRes.data);

//             if (verifyRes.data && verifyRes.data.success) {
//               ToastAndroid.show("Payment successful! Booking confirmed.", ToastAndroid.SHORT);
//               setOverviewModal(true);

//               setTimeout(() => {
//                 setProcessingPayment(false);
//                 closeModal();
//               }, 2000);
//             } else {
//               throw new Error(verifyRes.data?.message || "Payment verification failed");
//             }
//           } catch (verifyErr) {
//             console.error("Verification error:", verifyErr?.response?.data || verifyErr.message);
//             ToastAndroid.show("Payment verification failed. Please contact support.", ToastAndroid.LONG);
//             setProcessingPayment(false);
//           }
//         })
//         .catch((err) => {
//           console.error("Razorpay checkout error:", err);
//           if (err.code === 1) {
//             ToastAndroid.show("Payment cancelled", ToastAndroid.SHORT);
//           } else {
//             ToastAndroid.show("Payment failed: " + (err.description || "Unknown error"), ToastAndroid.LONG);
//           }
//           setProcessingPayment(false);
//         });
//     } catch (err) {
//       console.error("Payment initialization error:", err?.response?.data || err.message);
//       ToastAndroid.show("Failed to initialize payment: " + (err?.message || "Error"), ToastAndroid.LONG);
//       setProcessingPayment(false);
//     }
//   };

//   const handlePayment = () => {
//     if (!isTnc) {
//       ToastAndroid.show("Please accept terms and conditions", ToastAndroid.SHORT);
//       return;
//     }

//     if (!selectedDate) {
//       ToastAndroid.show("Please select a date", ToastAndroid.SHORT);
//       return;
//     }

//     if (!selectedTimes.length) {
//       ToastAndroid.show("Please select a time", ToastAndroid.SHORT);
//       return;
//     }

//     if (!selectedLocation) {
//       ToastAndroid.show("Please select a location", ToastAndroid.SHORT);
//       return;
//     }
//  console.log('=== FINAL SELECTED DATA BEFORE PAYMENT ===');
//   logSelectedData();

//     startRazorpayPayment();
//   };

//   return (
//     <>
//       <BookingSuccessModal
//         isVisible={overviewModal}
//         isPackage={false}
//         onClose={() => setOverviewModal(false)}
//       />

//       <Modal
//         visible={modal}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={closeModal}>
//         <View style={styles.modalBackdrop}>
//           <ScrollView
//             style={{
//               padding: 20,
//               backgroundColor: 'white',
//               margin: 'auto',
//               height: 'auto',
//               width: '90%',
//               marginVertical: selectedDate && showAvailabilitys ? '20%' : '45%',
//               borderWidth: 1,
//               borderRadius: 10,
//             }}>
//             <TouchableOpacity onPress={closeModal}>
//               <Text
//                 style={{ color: 'red', textAlign: 'right', marginVertical: 5 }}>
//                 Close
//               </Text>
//             </TouchableOpacity>

//             <Calendar
//               style={styles.calendar}
//               markedDates={markedDates}
//               markingType={'custom'}
//               onDayPress={day => handleDateSelect(day?.dateString)}
//               current={today}
//               minDate={moment()?.format('YYYY-MM-DD')}
//               maxDate={moment()?.add(60, 'days').format('YYYY-MM-DD')}
//               hideExtraDays={true}
//               disableMonthChange={true}
//               theme={{
//                 textDayFontFamily: fonts.regular,
//                 textMonthFontFamily: fonts.regular,
//                 textDayHeaderFontFamily: fonts.regular,
//               }}
//             />

//             <View style={{ display: 'flex', flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
//               {calendarLegends.map(e => (
//                 <View
//                   style={{ display: 'flex', flexDirection: 'row', gap: 5, alignItems: 'center' }}
//                   key={e?.name}>
//                   <View
//                     style={{
//                       height: 20,
//                       width: 20,
//                       borderRadius: 50,
//                       backgroundColor: e?.color,
//                     }}></View>
//                   <Text style={{ color: 'black', fontSize: 12 }}>{e?.name}</Text>
//                 </View>
//               ))}
//             </View>

//             {loading ? (
//               <ActivityIndicator
//                 size="large"
//                 color={Colors.primary}
//                 style={styles.loader}
//               />
//             ) : (
//               selectedDate &&
//               showAvailabilitys && (
//                 <>
//                   <Text style={styles.dateText}>
//                     Selected Date: {selectedDate}
//                   </Text>

//                   <View style={styles.timeContainer}>
//                     {showAvailabilitys?.slots?.map((slot, index) => (
//                       <Button
//                         key={index}
//                         mode={
//                           selectedTimes?.includes(slot?.time)
//                             ? 'contained'
//                             : 'outlined'
//                         }
//                         onPress={() =>
//                           handleTimeSelect(slot?.time, slot?.locations)
//                         }
//                         style={styles.timeButton}>
//                         <Text
//                           style={{
//                             color: selectedTimes?.includes(slot?.time)
//                               ? '#fff'
//                               : 'black',
//                             fontFamily: fonts.regular,
//                           }}>
//                           {convertTo12HourFormat(slot?.time)}
//                         </Text>
//                       </Button>
//                     ))}
//                   </View>

//                   <Button
//                     mode="outlined"
//                     style={{ marginBottom: 10 }}
//                     onPress={() => setMenuVisible(true)}>
//                     {selectedLocation?.value ?? 'Select Location'}
//                   </Button>

//                   {menuVisible && (
//                     <View
//                       style={{
//                         elevation: 3,
//                         backgroundColor: 'white',
//                         borderRadius: 10,
//                         marginBottom: 10,
//                         borderWidth: 1,
//                         borderColor: 'lightgray',
//                       }}>
//                       {locations.map((location, i) => (
//                         <TouchableOpacity
//                           key={location.key}
//                           onPress={() => handleLocationSelect(location)}
//                           style={{
//                             padding: 10,
//                             width: '90%',
//                             alignSelf: 'center',
//                             borderBottomWidth: i == locations?.length - 1 ? 0 : 1,
//                             borderColor: 'lightgray',
//                           }}>
//                           <Text style={{ color: 'black' }}>
//                             {selectedLocation?.key === location.key
//                               ? `✓ ${location.value}`
//                               : location.value}
//                           </Text>
//                         </TouchableOpacity>
//                       ))}
//                     </View>
//                   )}

//                   <View style={styles.checkboxContainer}>
//                     <TouchableOpacity
//                       style={[
//                         styles.customCheckbox,
//                         isTnc && styles.customCheckboxChecked
//                       ]}
//                       onPress={() => setIsTnc(!isTnc)}
//                     >
//                       {isTnc && <Text style={styles.checkmark}>✓</Text>}
//                     </TouchableOpacity>
//                     <View style={{ alignContent: 'center', flex: 1 }}>
//                       <Text variant="bodyMedium" style={styles.checkboxLabel}>
//                         I accept the terms and conditions
//                       </Text>
//                       <Text
//                         variant="bodyMedium"
//                         style={styles.link}
//                         onPress={() => {
//                           navigation?.navigate('TERMSCompnent');
//                           closeModal();
//                         }}>
//                         Read full Terms & Conditions
//                       </Text>
//                     </View>
//                   </View>

//                   <Button
//                     mode="contained"
//                     disabled={!isTnc || processingPayment}
//                     onPress={handlePayment}
//                     style={{
//                       backgroundColor: isTnc && !processingPayment ? Colors.primary : 'gray',
//                       opacity: isTnc && !processingPayment ? 1 : 0.5,
//                       marginBottom: 40,
//                     }}>
//                     <Text style={{ color: '#fff', fontFamily: fonts.regular }}>
//                       {processingPayment ? 'Processing Payment...' : `Pay ₹${item?.price}`}
//                     </Text>
//                   </Button>
//                 </>
//               )
//             )}
//           </ScrollView>
//         </View>
//       </Modal>
//     </>
//   );
// };

// // ... keep the same styles object as before ...
// const styles = StyleSheet.create({
//   modalBackdrop: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   calendar: {
//     marginBottom: 20,
//   },
//   dateText: {
//     fontSize: 14,
//     color: '#777',
//     alignSelf: 'center',
//     fontFamily: fonts.regular,
//   },
//   timeContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginVertical: 10,
//   },
//   timeButton: {
//     borderRadius: 5,
//     marginHorizontal: 5,
//     marginVertical: 5,
//   },
//   loader: {
//     marginTop: 20,
//   },
//   checkboxContainer: {
//     flexDirection: 'row',
//     alignItems: 'flex-start', // Changed to flex-start for better alignment
//     marginVertical: 10,
//   },
//   checkboxLabel: {
//     color: 'black',
//     marginLeft: 8, // Add some spacing
//   },
//   link: {
//     color: '#6200ee',
//     marginBottom: 15,
//     textDecorationLine: 'underline',
//     marginLeft: 8, // Add some spacing
//   },
//   // Custom checkbox styles (if using the enhanced version)
//   customCheckbox: {
//     width: 22,
//     height: 22,
//     borderWidth: 2,
//     borderColor: Colors.primary,
//     borderRadius: 4,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 2, // Adjust for better alignment with text
//   },
//   customCheckboxChecked: {
//     backgroundColor: Colors.primary,
//   },
//   checkmark: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },

// });

// export default ClassBookingCalendarModal;

// import React, { useContext, useEffect, useState } from 'react';
// import RazorpayCheckout from 'react-native-razorpay';
// import fonts from '../FontFamily/FontFamily';
// import { RAZORPAY_KEY_ID } from '../Config/Config';
// import { Calendar } from 'react-native-calendars';
// import { Colors } from '../Config/Config';
// import {
//   ActivityIndicator,
//   Button,
// } from 'react-native-paper';
// import BookingSuccessModal from '../Bookings/SucessfullModa';
// import moment from 'moment';
// import { showAvailability } from '../Api/Allapi';
// import UserContext from '../../context/UserContext';
// import { Checkbox } from 'react-native-paper';
// import { useNavigation } from '@react-navigation/native';
// import {
//   Text,
//   View,
//   StyleSheet,
//   Modal,
//   TouchableOpacity,
//   Alert,
//   ToastAndroid,
// } from 'react-native';
// import { ScrollView } from 'react-native-gesture-handler';
// import axios from 'axios';
// import { BaseUrl } from '../Api/BaseUrl';

// const ClassBookingCalendarModal = ({ modal, closeModal, item }) => {
//   const { userId, user } = useContext(UserContext);
//   const navigation = useNavigation();
//   const [markedDates, setMarkedDates] = useState({});
//   const [locations, setLocations] = useState([]);
//   const [menuVisible, setMenuVisible] = useState(false);
//   const [selectedLocation, setSelectedLocation] = useState(null);
//   const [selectedTimes, setSelectedTimes] = useState([]);
//   const [durations, setDurations] = useState('');
//   const [isTnc, setIsTnc] = useState(false);
//   const [processingPayment, setProcessingPayment] = useState(false);

//   const today = moment()?.format('YYYY-MM-DD');
//   const [loading, setLoading] = useState(false);
//   const [showAvailabilitys, setShowAvailability] = useState(null);
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [overviewModal, setOverviewModal] = useState(false);
//   const [fullyBookedDates, setFullyBookedDates] = useState({}); // New state for fully booked dates
//   const [isSelectedDateFull, setIsSelectedDateFull] = useState(false); // New state to track if selected date is full

//   const calendarLegends = [
//     { name: 'Available', color: Colors?.primary },
//     { name: 'Fully Booked', color: 'pink' },
//     { name: 'Not Available', color: 'lightgray' },
//   ];

//   useEffect(() => {
//     if (selectedLocation) {
//       console.log('Current Selected Location START:', {
//         id: selectedLocation?.key,
//         name: selectedLocation?.value,
//         fullLocationObject: selectedLocation
//       });

//       // Log selected data when location changes
//       logSelectedData();
//     }
//   }, [selectedLocation]);

//   // Update the useEffect that calls markCalendarDates
//   useEffect(() => {
//     if (item) {
//       // Initially mark dates with just availability
//       markCalendarDates(item?.availability);
//     }
//   }, [item]);

//   // Add a new useEffect to update marked dates when fullyBookedDates changes
//   useEffect(() => {
//     if (Object.keys(fullyBookedDates).length > 0) {
//       console.log('Updating calendar with fully booked dates:', fullyBookedDates);
//       // Re-mark dates with both availability and fully booked data
//       markCalendarDates(item?.availability, fullyBookedDates);
//     }
//   }, [fullyBookedDates]);

//   // Check if selected date is fully booked
//   useEffect(() => {
//     if (selectedDate && fullyBookedDates[selectedDate]) {
//       console.log(`Selected date ${selectedDate} is fully booked`);
//       setIsSelectedDateFull(true);
//     } else {
//       setIsSelectedDateFull(false);
//     }
//   }, [selectedDate, fullyBookedDates]);

//   const logSelectedData = () => {
//     const selectedData = {
//       classId: item?._id,
//       className: item?.name,
//       selectedDate: selectedDate,
//       selectedTime: selectedTimes[0],
//       selectedLocation: {
//         id: selectedLocation?.key,
//         name: selectedLocation?.value
//       },
//       duration: durations,
//       price: item?.price
//     };

//     console.log('=== ALL SELECTED DATA ===', selectedData);

//     // Fetch fully booked dates whenever selection changes
//     if (selectedData.selectedDate && selectedData.selectedTime && selectedData.selectedLocation.id) {
//       console.log('Triggering fully booked dates fetch...');
//       fetchFullyBookedDates();
//     }
//   };

//   // Function to check slot availability for a specific date, time, and location
//   const checkSlotAvailability = async (date, time, locationId) => {
//     try {
//       console.log('Checking slot availability for:', { date, time, locationId });

//       const response = await axios.get(`${BaseUrl}getAllBookingsdatestest`, {
//         params: {
//           date: date,
//           classId: item?._id,
//           time: time,
//           locationId: locationId
//         },
//       });

//       console.log('Slot availability response:', response.data);
//       return response.data;
//     } catch (error) {
//       console.error('Error checking slot availability:', error);
//       console.log('Error details:', error.response?.data || error.message);
//       return null;
//     }
//   };

//   // Function to fetch and mark fully booked dates
//   const fetchFullyBookedDates = async () => {
//     try {
//       if (!item?._id || !selectedLocation?.key || !selectedTimes[0]) {
//         console.log('Missing required data to fetch fully booked dates');
//         return;
//       }

//       const currentDate = moment().startOf('day');
//       const validityTill = moment().add(60, 'days');
//       const fullyBookedDatesData = {};

//       // Check availability for each date in the range
//       while (currentDate.isSameOrBefore(validityTill)) {
//         const dateString = currentDate.format('YYYY-MM-DD');

//         // Only check dates that are available (not disabled)
//         const validDays = new Set(item?.availability?.map(avail => avail?.day));
//         if (validDays.has(currentDate.day())) {
//           try {
//             const availabilityData = await checkSlotAvailability(
//               dateString,
//               selectedTimes[0],
//               selectedLocation?.key
//             );

//             if (availabilityData?.specificAvailability?.isFull) {
//               fullyBookedDatesData[dateString] = {
//                 customStyles: {
//                   container: {
//                     backgroundColor: 'pink', // Pink background for fully booked
//                   },
//                   text: {
//                     color: 'white',
//                     fontWeight: 'bold',
//                   },
//                 },
//                 disabled: false, // Keep it clickable but show it's full
//               };
//               console.log(`Date ${dateString} is fully booked`);
//             }
//           } catch (error) {
//             console.log(`Error checking availability for ${dateString}:`, error);
//           }
//         }

//         currentDate.add(1, 'day');
//       }

//       setFullyBookedDates(fullyBookedDatesData);
//       console.log('Fully booked dates:', fullyBookedDatesData);

//     } catch (error) {
//       console.error('Error fetching fully booked dates:', error);
//     }
//   };

//   const markCalendarDates = (availability, fullyBookedDatesData = {}) => {
//     const availabilityData = {};
//     const currentDate = moment().startOf('day');
//     const validityTill = moment().add(60, 'days');

//     const validDays = new Set(availability?.map(item => item?.day));

//     while (currentDate.isSameOrBefore(validityTill)) {
//       const dateString = currentDate.format('YYYY-MM-DD');

//       // Priority 1: Check if date is fully booked
//       if (fullyBookedDatesData[dateString]) {
//         availabilityData[dateString] = fullyBookedDatesData[dateString];
//         console.log(`Marking ${dateString} as fully booked (pink)`);
//       } 
//       // Priority 2: Check if it's a valid available day
//       else if (validDays.has(currentDate.day())) {
//         availabilityData[dateString] = {
//           customStyles: {
//             container: {
//               backgroundColor: Colors?.primary, // Purple for available
//             },
//             text: {
//               color: 'white',
//             },
//           },
//         };
//         console.log(`Marking ${dateString} as available (purple)`);
//       } 
//       // Priority 3: Mark as not available
//       else {
//         availabilityData[dateString] = {
//           customStyles: {
//             container: {
//               backgroundColor: '#f0f0f0',
//             },
//             text: {
//               color: '#d0d0d0',
//             },
//           },
//           disabled: true,
//           disableTouchEvent: true,
//         };
//         console.log(`Marking ${dateString} as not available (gray)`);
//       }

//       currentDate.add(1, 'day');
//     }

//     setMarkedDates(availabilityData);
//     console.log('Final marked dates with pink:', Object.keys(availabilityData).filter(date => 
//       availabilityData[date].customStyles.container.backgroundColor === 'pink'
//     ));
//   };

//   if (!item) {
//     return (
//       <View style={styles.container}>
//         <Text>No data available</Text>
//       </View>
//     );
//   }

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

//   const handleLocationSelect = location => {
//     console.log('Selected Location:', {
//       id: location?.key,
//       name: location?.value,
//       fullLocationObject: location
//     });
//     setSelectedLocation(location);
//     setMenuVisible(false);

//     // Log selected data
//     setTimeout(() => {
//       logSelectedData();
//     }, 100);
//   };

//   const handleDateSelect = date => {
//     setSelectedDate(date);

//     const newDateDuration = new Date(date)?.getDay();
//     const duration =
//       item?.availability?.filter(res => newDateDuration === res?.day) || [];
//     setDurations(duration?.duration);
//     setLoading(true);
//     setSelectedTimes([]);
//     Showdate(date);

//     // Log selected data
//     setTimeout(() => {
//       logSelectedData();
//     }, 100);
//   };

//   const Showdate = date => {
//     showAvailability(moment(date).format('DD-MM-YYYY'), item?._id)
//       .then(res => {
//         setShowAvailability(res);
//         processAvailabilityData(res);
//         setLoading(false);
//       })
//       .catch(() => setLoading(false));
//   };

//   const processAvailabilityData = availability => {
//     if (availability && availability.slots) {
//       const availableSlots = availability.slots.map(slot => ({
//         time: slot.time,
//         locations: slot.locations.map(location => ({
//           key: location._id,
//           value: location.name,
//         })),
//       }));

//       if (availableSlots.length > 0) {
//         const firstSlot = availableSlots[0];
//         setSelectedTimes([firstSlot?.time]);
//         setSelectedLocation(firstSlot?.locations[0]);
//         setLocations(firstSlot?.locations);

//         // Log the initially selected location from API data
//         if (firstSlot?.locations[0]) {
//           console.log('Initial Location from API:', {
//             id: firstSlot?.locations[0]?.key,
//             name: firstSlot?.locations[0]?.value,
//             fullLocationObject: firstSlot?.locations[0]
//           });
//         }
//       }
//     }
//   };

//   const handleTimeSelect = (time, location) => {
//     if (!time || !location) return;
//     const newData = location?.map(loc => ({
//       ...loc,
//       key: loc?._id,
//       value: loc?.name,
//     }));
//     console.log('Available Locations for time:', time, newData);
//     setLocations(newData);
//     setSelectedLocation(newData[0] || {});
//     setSelectedTimes([time]);

//     // Also log the initially selected location
//     if (newData[0]) {
//       console.log('Initially Selected Location:', {
//         id: newData[0]?.key,
//         name: newData[0]?.value,
//         fullLocationObject: newData[0]
//       });
//     }

//     // Log selected data
//     setTimeout(() => {
//       logSelectedData();
//     }, 100);
//   };

//   const startRazorpayPayment = async () => {
//     if (!userId) {
//       ToastAndroid.show("User not authenticated", ToastAndroid.SHORT);
//       return;
//     }

//     if (!selectedDate || !selectedTimes.length || !selectedLocation) {
//       ToastAndroid.show("Please select date, time and location", ToastAndroid.SHORT);
//       return;
//     }

//     // Check if selected date is fully booked
//     if (isSelectedDateFull) {
//       ToastAndroid.show("Slots are full for this date. Please select another date.", ToastAndroid.LONG);
//       return;
//     }
//
//     // Ensure booking is at least 3 hours in advance
//     const selectedDateTime = moment(`${selectedDate} ${selectedTimes[0]}`, "YYYY-MM-DD HH:mm");
//     if (selectedDateTime.diff(moment(), 'minutes') < 180) {
//       ToastAndroid.show("Bookings must be made at least 3 hours before class start time.", ToastAndroid.LONG);
//       return;
//     }

//     try {
//       setProcessingPayment(true);

//       // Prepare payload for class booking - matching backend expectations
//       const payload = {
//         class: item?._id,
//         user: userId,
//         dates: [selectedDate],
//         location: selectedLocation?.key,
//         amount: item?.price,
//         time: selectedTimes[0],
//         duration: durations,
//         people: 1
//       };

//       console.log('Creating class order with payload:', payload);

//       // 1) Call backend to create Razorpay order
//       const createRes = await axios.post(`${BaseUrl}create-class-order`, payload, {
//         headers: { "Content-Type": "application/json" },
//       });

//       if (!createRes?.data?.success) {
//         throw new Error(createRes?.data?.message || "Failed to create order");
//       }

//       const orderId = createRes.data.orderId;
//       const orderAmount = createRes.data.amount;

//       console.log('Order created:', orderId, 'Amount:', orderAmount);

//       // 2) Open Razorpay checkout with the order_id from backend
//       const options = {
//         description: `Payment for class ${item?.name}`,
//         image: item?.image[0] ?? '',
//         currency: "INR",
//         key: RAZORPAY_KEY_ID,
//         amount: orderAmount,
//         order_id: orderId, // Use order_id from backend
//         name: item?.name || "Class Booking",
//         prefill: {
//           email: user?.email || "",
//           contact: user?.phone || "",
//           name: user?.name || "",
//         },
//         theme: { color: Colors.primary || "#528FF0" },
//       };

//       console.log('Opening Razorpay with options:', options);

//       RazorpayCheckout.open(options)
//         .then(async (paymentResult) => {
//           console.log('Razorpay payment result:', paymentResult);

//           const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = paymentResult;

//           // 3) Verify payment at backend
//           try {
//             const verifyRes = await axios.post(`${BaseUrl}verify-class-order`, {
//               razorpay_order_id,
//               razorpay_payment_id,
//               razorpay_signature,
//             }, {
//               headers: { "Content-Type": "application/json" },
//             });

//             console.log('Verification response:', verifyRes.data);

//             if (verifyRes.data && verifyRes.data.success) {
//               ToastAndroid.show("Payment successful! Booking confirmed.", ToastAndroid.SHORT);
//               setOverviewModal(true);

//               setTimeout(() => {
//                 setProcessingPayment(false);
//                 closeModal();
//               }, 2000);
//             } else {
//               throw new Error(verifyRes.data?.message || "Payment verification failed");
//             }
//           } catch (verifyErr) {
//             console.error("Verification error:", verifyErr?.response?.data || verifyErr.message);
//             ToastAndroid.show("Payment verification failed. Please contact support.", ToastAndroid.LONG);
//             setProcessingPayment(false);
//           }
//         })
//         .catch((err) => {
//           console.error("Razorpay checkout error:", err);
//           if (err.code === 1) {
//             ToastAndroid.show("Payment cancelled", ToastAndroid.SHORT);
//           } else {
//             ToastAndroid.show("Payment failed: " + (err.description || "Unknown error"), ToastAndroid.LONG);
//           }
//           setProcessingPayment(false);
//         });
//     } catch (err) {
//       console.error("Payment initialization error:", err?.response?.data || err.message);
//       ToastAndroid.show("Failed to initialize payment: " + (err?.message || "Error"), ToastAndroid.LONG);
//       setProcessingPayment(false);
//     }
//   };

//   const handlePayment = () => {
//     if (!isTnc) {
//       ToastAndroid.show("Please accept terms and conditions", ToastAndroid.SHORT);
//       return;
//     }

//     if (!selectedDate) {
//       ToastAndroid.show("Please select a date", ToastAndroid.SHORT);
//       return;
//     }

//     if (!selectedTimes.length) {
//       ToastAndroid.show("Please select a time", ToastAndroid.SHORT);
//       return;
//     }

//     if (!selectedLocation) {
//       ToastAndroid.show("Please select a location", ToastAndroid.SHORT);
//       return;
//     }

//     // Check if selected date is fully booked
//     if (isSelectedDateFull) {
//       ToastAndroid.show("Slots are full for this date. Please select another date.", ToastAndroid.LONG);
//       return;
//     }

//     console.log('=== FINAL SELECTED DATA BEFORE PAYMENT ===');
//     logSelectedData();

//     startRazorpayPayment();
//   };

//   return (
//     <>
//       <BookingSuccessModal
//         isVisible={overviewModal}
//         isPackage={false}
//         onClose={() => setOverviewModal(false)}
//       />

//       <Modal
//         visible={modal}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={closeModal}>
//         <View style={styles.modalBackdrop}>
//           <ScrollView
//             style={{
//               padding: 20,
//               backgroundColor: 'white',
//               margin: 'auto',
//               height: 'auto',
//               width: '90%',
//               marginVertical: selectedDate && showAvailabilitys ? '20%' : '45%',
//               borderWidth: 1,
//               borderRadius: 10,
//             }}>
//             <TouchableOpacity onPress={closeModal}>
//               <Text
//                 style={{ color: 'red', textAlign: 'right', marginVertical: 5 }}>
//                 Close
//               </Text>
//             </TouchableOpacity>

//             <Calendar
//               style={styles.calendar}
//               markedDates={markedDates}
//               markingType={'custom'}
//               onDayPress={day => handleDateSelect(day?.dateString)}
//               current={today}
//               minDate={moment()?.format('YYYY-MM-DD')}
//               maxDate={moment()?.add(60, 'days').format('YYYY-MM-DD')}
//               hideExtraDays={true}
//               disableMonthChange={true}
//               theme={{
//                 textDayFontFamily: fonts.regular,
//                 textMonthFontFamily: fonts.regular,
//                 textDayHeaderFontFamily: fonts.regular,
//               }}
//             />

//             <View style={{ display: 'flex', flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
//               {calendarLegends.map(e => (
//                 <View
//                   style={{ display: 'flex', flexDirection: 'row', gap: 5, alignItems: 'center' }}
//                   key={e?.name}>
//                   <View
//                     style={{
//                       height: 20,
//                       width: 20,
//                       borderRadius: 50,
//                       backgroundColor: e?.color,
//                     }}></View>
//                   <Text style={{ color: 'black', fontSize: 12 }}>{e?.name}</Text>
//                 </View>
//               ))}
//             </View>

//             {loading ? (
//               <ActivityIndicator
//                 size="large"
//                 color={Colors.primary}
//                 style={styles.loader}
//               />
//             ) : (
//               selectedDate &&
//               showAvailabilitys && (
//                 <>
//                   <Text style={styles.dateText}>
//                     Selected Date: {selectedDate}
//                   </Text>

//                   {/* Show slots full message if selected date is fully booked */}
//                   {isSelectedDateFull && (
//                     <View style={styles.slotsFullContainer}>
//                       <Text style={styles.slotsFullText}>
//                         ⚠️ Slots are full for this date. Please select another date.
//                       </Text>
//                     </View>
//                   )}

//                   <View style={styles.timeContainer}>
//                     {showAvailabilitys?.slots?.map((slot, index) => (
//                       <Button
//                         key={index}
//                         mode={
//                           selectedTimes?.includes(slot?.time)
//                             ? 'contained'
//                             : 'outlined'
//                         }
//                         onPress={() =>
//                           handleTimeSelect(slot?.time, slot?.locations)
//                         }
//                         style={styles.timeButton}>
//                         <Text
//                           style={{
//                             color: selectedTimes?.includes(slot?.time)
//                               ? '#fff'
//                               : 'black',
//                             fontFamily: fonts.regular,
//                           }}>
//                           {convertTo12HourFormat(slot?.time)}
//                         </Text>
//                       </Button>
//                     ))}
//                   </View>

//                   <Button
//                     mode="outlined"
//                     style={{ marginBottom: 10 }}
//                     onPress={() => setMenuVisible(true)}>
//                     {selectedLocation?.value ?? 'Select Location'}
//                   </Button>

//                   {menuVisible && (
//                     <View
//                       style={{
//                         elevation: 3,
//                         backgroundColor: 'white',
//                         borderRadius: 10,
//                         marginBottom: 10,
//                         borderWidth: 1,
//                         borderColor: 'lightgray',
//                       }}>
//                       {locations.map((location, i) => (
//                         <TouchableOpacity
//                           key={location.key}
//                           onPress={() => handleLocationSelect(location)}
//                           style={{
//                             padding: 10,
//                             width: '90%',
//                             alignSelf: 'center',
//                             borderBottomWidth: i == locations?.length - 1 ? 0 : 1,
//                             borderColor: 'lightgray',
//                           }}>
//                           <Text style={{ color: 'black' }}>
//                             {selectedLocation?.key === location.key
//                               ? `✓ ${location.value}`
//                               : location.value}
//                           </Text>
//                         </TouchableOpacity>
//                       ))}
//                     </View>
//                   )}

//                   <View style={styles.checkboxContainer}>
//                     <TouchableOpacity
//                       style={[
//                         styles.customCheckbox,
//                         isTnc && styles.customCheckboxChecked
//                       ]}
//                       onPress={() => setIsTnc(!isTnc)}
//                     >
//                       {isTnc && <Text style={styles.checkmark}>✓</Text>}
//                     </TouchableOpacity>
//                     <View style={{ alignContent: 'center', flex: 1 }}>
//                       <Text variant="bodyMedium" style={styles.checkboxLabel}>
//                         I accept the terms and conditions
//                       </Text>
//                       <Text
//                         variant="bodyMedium"
//                         style={styles.link}
//                         onPress={() => {
//                           navigation?.navigate('TERMSCompnent');
//                           closeModal();
//                         }}>
//                         Read full Terms & Conditions
//                       </Text>
//                     </View>
//                   </View>

//                   <Button
//                     mode="contained"
//                     disabled={!isTnc || processingPayment || isSelectedDateFull}
//                     onPress={handlePayment}
//                     style={{
//                       backgroundColor: isTnc && !processingPayment && !isSelectedDateFull ? Colors.primary : 'gray',
//                       opacity: isTnc && !processingPayment && !isSelectedDateFull ? 1 : 0.5,
//                       marginBottom: 40,
//                     }}>
//                     <Text style={{ color: '#fff', fontFamily: fonts.regular }}>
//                       {processingPayment ? 'Processing Payment...' : 
//                        isSelectedDateFull ? 'Slots Full' : `Pay ₹${item?.price}`}
//                     </Text>
//                   </Button>
//                 </>
//               )
//             )}
//           </ScrollView>
//         </View>
//       </Modal>
//     </>
//   );
// };

// // ... keep the same styles object as before ...
// const styles = StyleSheet.create({
//   modalBackdrop: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   calendar: {
//     marginBottom: 20,
//   },
//   dateText: {
//     fontSize: 14,
//     color: '#777',
//     alignSelf: 'center',
//     fontFamily: fonts.regular,
//   },
//   timeContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginVertical: 10,
//   },
//   timeButton: {
//     borderRadius: 5,
//     marginHorizontal: 5,
//     marginVertical: 5,
//   },
//   loader: {
//     marginTop: 20,
//   },
//   checkboxContainer: {
//     flexDirection: 'row',
//     alignItems: 'flex-start', // Changed to flex-start for better alignment
//     marginVertical: 10,
//   },
//   checkboxLabel: {
//     color: 'black',
//     marginLeft: 8, // Add some spacing
//   },
//   link: {
//     color: '#6200ee',
//     marginBottom: 15,
//     textDecorationLine: 'underline',
//     marginLeft: 8, // Add some spacing
//   },
//   // Custom checkbox styles (if using the enhanced version)
//   customCheckbox: {
//     width: 22,
//     height: 22,
//     borderWidth: 2,
//     borderColor: Colors.primary,
//     borderRadius: 4,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 2, // Adjust for better alignment with text
//   },
//   customCheckboxChecked: {
//     backgroundColor: Colors.primary,
//   },
//   checkmark: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   // New styles for slots full message
//   slotsFullContainer: {
//     backgroundColor: '#ffebee',
//     padding: 10,
//     borderRadius: 8,
//     marginVertical: 10,
//     borderWidth: 1,
//     borderColor: '#f44336',
//   },
//   slotsFullText: {
//     color: '#d32f2f',
//     textAlign: 'center',
//     fontFamily: fonts.regular,
//     fontSize: 14,
//   },

// });

// export default ClassBookingCalendarModal;

// import React, { useContext, useEffect, useState } from 'react';
// import RazorpayCheckout from 'react-native-razorpay';
// import fonts from '../FontFamily/FontFamily';
// import { RAZORPAY_KEY_ID } from '../Config/Config';
// import { Calendar } from 'react-native-calendars';
// import { Colors } from '../Config/Config';
// import {
//   ActivityIndicator,
//   Button,
// } from 'react-native-paper';
// import BookingSuccessModal from '../Bookings/SucessfullModa';
// import moment from 'moment';
// import { showAvailability } from '../Api/Allapi';
// import UserContext from '../../context/UserContext';
// import { Checkbox } from 'react-native-paper';
// import { useNavigation } from '@react-navigation/native';
// import {
//   Text,
//   View,
//   StyleSheet,
//   Modal,
//   TouchableOpacity,
//   Alert,
// } from 'react-native';
// import { ScrollView } from 'react-native-gesture-handler';
// import axios from 'axios';
// import { BaseUrl } from '../Api/BaseUrl';
// import Toast from 'react-native-toast-message';

// const ClassBookingCalendarModal = ({ modal, closeModal, item }) => {
//   const { userId, user } = useContext(UserContext);
//   const navigation = useNavigation();
//   const [markedDates, setMarkedDates] = useState({});
//   const [locations, setLocations] = useState([]);
//   const [menuVisible, setMenuVisible] = useState(false);
//   const [selectedLocation, setSelectedLocation] = useState(null);
//   const [selectedTimes, setSelectedTimes] = useState([]);
//   const [durations, setDurations] = useState('');
//   const [isTnc, setIsTnc] = useState(false);
//   const [processingPayment, setProcessingPayment] = useState(false);

//   const today = moment()?.format('YYYY-MM-DD');
//   const [loading, setLoading] = useState(false);
//   const [showAvailabilitys, setShowAvailability] = useState(null);
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [overviewModal, setOverviewModal] = useState(false);
//   const [classFullDates, setClassFullDates] = useState({}); // Track class full dates
//   const [availableSlots, setAvailableSlots] = useState([]); // Store all available slots from API

//   const calendarLegends = [
//     { name: 'Available', color: Colors?.primary },
//     { name: 'Class Full', color: 'pink' },
//     { name: 'Not Available', color: 'lightgray' },
//   ];

//   // Function to check availability for all times and locations at once
//   const checkAllSlotsAvailability = async (classId, date) => {
//     try {
//       console.log('🔍 CHECKING ALL SLOTS AVAILABILITY:');
//       console.log("Class ID:", classId);
//       console.log("Date:", date);

//       // Extract all unique times and location IDs from class availability
//       const allTimes = [...new Set(item.availability.map(item => item.time))];

//       // Extract only location IDs (not the full objects)
//       const allLocationIds = [...new Set(item.availability.flatMap(item =>
//         item.locations.map(loc => typeof loc === 'object' ? loc._id : loc)
//       ))];

//       console.log("All Times:", allTimes);
//       console.log("All Location IDs:", allLocationIds);

//       const response = await axios.post(`${BaseUrl}preview-booking-class-availbality`, {
//         classId: classId,
//         date: date,
//         times: allTimes,
//         locationIds: allLocationIds
//       });

//       console.log('📊 ALL SLOTS AVAILABILITY RESPONSE:', response.data);
//       return response.data;
//     } catch (error) {
//       console.log('❌ ERROR CHECKING ALL SLOTS AVAILABILITY:', error);
//       return {
//         slots: [],
//         message: "Error checking availability"
//       };
//     }
//   };

//   useEffect(() => {
//     if (item) {
//       markCalendarDates(item?.availability);
//     }
//   }, [item, classFullDates]);

//   const markCalendarDates = (availability) => {
//     const availabilityData = {};
//     const currentDate = moment().startOf('day');
//     const validityTill = moment().add(60, 'days');

//     const validDays = new Set(availability?.map(item => item?.day));

//     while (currentDate.isSameOrBefore(validityTill)) {
//       const dateString = currentDate.format('YYYY-MM-DD');

//       // Priority 1: Check if date is class full
//       if (classFullDates[dateString]) {
//         availabilityData[dateString] = {
//           customStyles: {
//             container: {
//               backgroundColor: 'pink',
//             },
//             text: {
//               color: 'white',
//             },
//           },
//           disabled: true,
//           disableTouchEvent: true,
//         };
//       }
//       // Priority 2: Check if it's a valid available day
//       else if (validDays.has(currentDate.day())) {
//         availabilityData[dateString] = {
//           customStyles: {
//             container: {
//               backgroundColor: Colors?.primary,
//             },
//             text: {
//               color: 'white',
//             },
//           },
//         };
//       }
//       // Priority 3: Mark as not available
//       else {
//         availabilityData[dateString] = {
//           customStyles: {
//             container: {
//               backgroundColor: '#f0f0f0',
//             },
//             text: {
//               color: '#d0d0d0',
//             },
//           },
//           disabled: true,
//           disableTouchEvent: true,
//         };
//       }

//       currentDate.add(1, 'day');
//     }

//     setMarkedDates(availabilityData);
//   };

//   const handleDateSelect = async (date) => {
//     setSelectedDate(date);

//     const newDateDuration = new Date(date)?.getDay();
//     const duration = item?.availability?.filter(res => newDateDuration === res?.day) || [];
//     setDurations(duration?.duration);
//     setLoading(true);
//     setSelectedTimes([]);

//     // Call the API to check all slots availability
//     const availabilityResponse = await checkAllSlotsAvailability(item?._id, date);
//     setLoading(false);

//     if (availabilityResponse.slots && availabilityResponse.slots.length > 0) {
//       console.log('🎯 PROCESSING AVAILABLE SLOTS:');

//       // Filter only available slots
//       const availableSlotsData = availabilityResponse.slots.filter(slot => slot.bookingAvailable);

//       if (availableSlotsData.length === 0) {
//         Toast.show({
//           type: 'info',
//           text1: 'Class Full',
//           text2: 'All slots for this date are fully booked. Please select another date.',
//         });

//         // Mark this date as class full in the calendar IMMEDIATELY
//         setClassFullDates(prev => ({
//           ...prev,
//           [date]: true
//         }));

//         // Update calendar to show pink color for class full date IMMEDIATELY
//         markCalendarDates(item?.availability);

//         // RESET the selected date since it's class full
//         setSelectedDate(null);
//         setShowAvailability(null);
//         setAvailableSlots([]);
//         return; // IMPORTANT: Return here to prevent further processing
//       }

//       console.log("Available Slots:", availableSlotsData);
//       setAvailableSlots(availableSlotsData);

//       // Process the available slots to show in UI
//       processAvailableSlotsData(availableSlotsData);
//     } else {
//       Toast.show({
//         type: 'error',
//         text1: 'Error',
//         text2: 'No availability data received',
//       });      // Reset selection on error too
//       setSelectedDate(null);
//       setShowAvailability(null);
//       setAvailableSlots([]);
//     }
//   };

//   const processAvailableSlotsData = (slotsData) => {
//     // Create a mapping of location IDs to location names from the original class data
//     const locationMap = {};
//     item.availability.forEach(avail => {
//       avail.locations.forEach(loc => {
//         const locationId = typeof loc === 'object' ? loc._id : loc;
//         const locationName = typeof loc === 'object' ? loc.name : `Location ${loc}`;
//         locationMap[locationId] = locationName;
//       });
//     });

//     // Group slots by time and their locations
//     const slotsByTime = {};

//     slotsData.forEach(slot => {
//       if (!slotsByTime[slot.time]) {
//         slotsByTime[slot.time] = [];
//       }

//       // Use the location map to get the location name
//       const locationName = locationMap[slot.location] || `Location ${slot.location}`;

//       slotsByTime[slot.time].push({
//         _id: slot.location,
//         name: locationName,
//         key: slot.location,
//         value: locationName
//       });
//     });

//     // Convert to the format expected by the existing UI
//     const formattedSlots = Object.keys(slotsByTime).map(time => ({
//       time: time,
//       locations: slotsByTime[time]
//     }));

//     console.log('🔄 FORMATTED SLOTS FOR UI:', formattedSlots);

//     // Set the first available slot as selected by default
//     if (formattedSlots.length > 0) {
//       const firstSlot = formattedSlots[0];
//       setSelectedTimes([firstSlot.time]);
//       setSelectedLocation(firstSlot.locations[0]);
//       setLocations(firstSlot.locations);
//     }

//     setShowAvailability({ slots: formattedSlots });
//   };

//   const handleTimeSelect = (time, location) => {
//     if (!time || !location) return;

//     // Find the slot data for the selected time
//     const selectedSlotData = availableSlots.find(slot =>
//       slot.time === time && slot.location === location[0]?._id
//     );

//     if (selectedSlotData && !selectedSlotData.bookingAvailable) {
//       Toast.show({
//         type: 'error',
//         text1: 'Slot Unavailable',
//         text2: 'This slot is no longer available. Please select another time.',
//       }); return;
//     }

//     const newData = location?.map(loc => ({
//       ...loc,
//       key: loc?._id,
//       value: loc?.name,
//     }));
//     setLocations(newData);
//     setSelectedLocation(newData[0] || {});
//     setSelectedTimes([time]);
//   };

//   const handleLocationSelect = location => {
//     // Check if the selected location-time combination is available
//     const selectedSlot = availableSlots.find(slot =>
//       slot.time === selectedTimes[0] && slot.location === location._id
//     );

//     if (selectedSlot && !selectedSlot.bookingAvailable) {
//       Toast.show({
//         type: 'error',
//         text1: 'Location Unavailable',
//         text2: 'This location is no longer available for the selected time.',
//       }); return;
//     }

//     setSelectedLocation(location);
//     setMenuVisible(false);
//   };

//   const startRazorpayPayment = async () => {
//     if (!userId) {
//       Toast.show({
//         type: 'error',
//         text1: 'Authentication Error',
//         text2: 'User not authenticated',
//       }); return;
//     }

//     if (!selectedDate || !selectedTimes.length || !selectedLocation) {
//       Toast.show({
//         type: 'error',
//         text1: 'Selection Required',
//         text2: 'Please select date, time and location',
//       }); return;
//     }

//     // Double check availability from our stored available slots
//     const slotAvailability = availableSlots.find(slot =>
//       slot.time === selectedTimes[0] && slot.location === selectedLocation._id
//     );

//     if (!slotAvailability || !slotAvailability.bookingAvailable) {
//       Toast.show({
//         type: 'error',
//         text1: 'Slot Unavailable',
//         text2: 'This slot is no longer available. Please select another time or location.',
//       }); return;
//     }

//     try {
//       setProcessingPayment(true);

//       // Prepare payload for class booking - matching backend expectations
//       const payload = {
//         class: item?._id,
//         user: userId,
//         dates: [selectedDate],
//         location: selectedLocation?.key,
//         amount: item?.price,
//         time: selectedTimes[0],
//         duration: durations,
//         people: 1
//       };

//       console.log('Creating class order with payload:', payload);

//       // 1) Call backend to create Razorpay order
//       const createRes = await axios.post(`${BaseUrl}create-class-order`, payload, {
//         headers: { "Content-Type": "application/json" },
//       });

//       if (!createRes?.data?.success) {
//         throw new Error(createRes?.data?.message || "Failed to create order");
//       }

//       const orderId = createRes.data.orderId;
//       const orderAmount = createRes.data.amount;

//       console.log('Order created:', orderId, 'Amount:', orderAmount);

//       // 2) Open Razorpay checkout with the order_id from backend
//       const options = {
//         description: `Payment for class ${item?.name}`,
//         image: item?.image[0] ?? '',
//         currency: "INR",
//         key: RAZORPAY_KEY_ID,
//         amount: orderAmount,
//         order_id: orderId, // Use order_id from backend
//         name: item?.name || "Class Booking",
//         prefill: {
//           email: user?.email || "",
//           contact: user?.phone || "",
//           name: user?.name || "",
//         },
//         theme: { color: Colors.primary || "#528FF0" },
//       };

//       console.log('Opening Razorpay with options:', options);

//       RazorpayCheckout.open(options)
//         .then(async (paymentResult) => {
//           console.log('Razorpay payment result:', paymentResult);

//           const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = paymentResult;

//           // 3) Verify payment at backend
//           try {
//             const verifyRes = await axios.post(`${BaseUrl}verify-class-order`, {
//               razorpay_order_id,
//               razorpay_payment_id,
//               razorpay_signature,
//             }, {
//               headers: { "Content-Type": "application/json" },
//             });

//             console.log('Verification response:', verifyRes.data);

//             if (verifyRes.data && verifyRes.data.success) {
//               Toast.show({
//                 type: 'success',
//                 text1: 'Booking Confirmed!',
//                 text2: 'Payment successful! Your booking is confirmed.',
//               });
//               setOverviewModal(true);

//               setTimeout(() => {
//                 setProcessingPayment(false);
//                 closeModal();
//               }, 2000);
//             } else {
//               throw new Error(verifyRes.data?.message || "Payment verification failed");
//             }
//           } catch (verifyErr) {
//             console.error("Verification error:", verifyErr?.response?.data || verifyErr.message);
//             Toast.show({
//               type: 'error',
//               text1: 'Verification Failed',
//               text2: 'Payment verification failed. Please contact support.',
//             }); setProcessingPayment(false);
//           }
//         })
//         .catch((err) => {
//           console.error("Razorpay checkout error:", err);
//           if (err.code === 1) {
//             Toast.show({
//               type: 'info',
//               text1: 'Payment Cancelled',
//               text2: 'Payment process was cancelled',
//             });
//           } else {
//             Toast.show({
//               type: 'error',
//               text1: 'Payment Failed',
//               text2: err.description || 'Payment failed. Please try again.',
//             });
//           }
//           setProcessingPayment(false);
//         });
//     } catch (err) {
//       console.error("Payment initialization error:", err?.response?.data || err.message);
//       Toast.show({
//         type: 'error',
//         text1: 'Payment Error',
//         text2: 'Failed to initialize payment process',
//       }); setProcessingPayment(false);
//     }
//   };

//   const handlePayment = () => {
//     if (!isTnc) {
//       Toast.show({
//         type: 'error',
//         text1: 'Terms Required',
//         text2: 'Please accept terms and conditions',
//       }); return;
//     }

//     if (!selectedDate) {
//       Toast.show({
//         type: 'error',
//         text1: 'Date Required',
//         text2: 'Please select a date',
//       }); return;
//     }

//     if (!selectedTimes.length) {
//       Toast.show({
//         type: 'error',
//         text1: 'Time Required',
//         text2: 'Please select a time',
//       }); return;
//     }

//     if (!selectedLocation) {
//       Toast.show({
//         type: 'error',
//         text1: 'Location Required',
//         text2: 'Please select a location',
//       }); return;
//     }

//     // Double check availability before payment
//     const slotAvailability = availableSlots.find(slot =>
//       slot.time === selectedTimes[0] && slot.location === selectedLocation._id
//     );

//     if (!slotAvailability || !slotAvailability.bookingAvailable) {
//       Toast.show({
//         type: 'error',
//         text1: 'Slot Unavailable',
//         text2: 'This slot is no longer available. Please select another time or location.',
//       }); return;
//     }

//     startRazorpayPayment();
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

//   return (
//     <>
//       <BookingSuccessModal
//         isVisible={overviewModal}
//         isPackage={false}
//         onClose={() => setOverviewModal(false)}
//       />

//       <Modal
//         visible={modal}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={closeModal}>
//         <View style={styles.modalBackdrop}>
//           <ScrollView
//             style={{
//               padding: 20,
//               backgroundColor: 'white',
//               margin: 'auto',
//               height: 'auto',
//               width: '90%',
//               marginVertical: selectedDate && showAvailabilitys ? '20%' : '45%',
//               borderWidth: 1,
//               borderRadius: 10,
//             }}>
//             <TouchableOpacity onPress={closeModal}>
//               <Text
//                 style={{ color: 'red', textAlign: 'right', marginVertical: 5 }}>
//                 Close
//               </Text>
//             </TouchableOpacity>

//             <Calendar
//               style={styles.calendar}
//               markedDates={markedDates}
//               markingType={'custom'}
//               onDayPress={day => handleDateSelect(day?.dateString)}
//               current={today}
//               minDate={moment()?.format('YYYY-MM-DD')}
//               maxDate={moment()?.add(60, 'days').format('YYYY-MM-DD')}
//               hideExtraDays={true}
//               disableMonthChange={true}
//               theme={{
//                 textDayFontFamily: fonts.regular,
//                 textMonthFontFamily: fonts.regular,
//                 textDayHeaderFontFamily: fonts.regular,
//               }}
//             />

//             <View style={{ display: 'flex', flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
//               {calendarLegends.map(e => (
//                 <View
//                   style={{ display: 'flex', flexDirection: 'row', gap: 5, alignItems: 'center' }}
//                   key={e?.name}>
//                   <View
//                     style={{
//                       height: 20,
//                       width: 20,
//                       borderRadius: 50,
//                       backgroundColor: e?.color,
//                     }}></View>
//                   <Text style={{ color: 'black', fontSize: 12 }}>{e?.name}</Text>
//                 </View>
//               ))}
//             </View>

//             {loading ? (
//               <ActivityIndicator
//                 size="large"
//                 color={Colors.primary}
//                 style={styles.loader}
//               />
//             ) : (
//               selectedDate &&
//               showAvailabilitys && (
//                 <>
//                   <Text style={styles.dateText}>
//                     Selected Date: {selectedDate}
//                   </Text>

//                   <View style={styles.timeContainer}>
//                     {showAvailabilitys?.slots?.map((slot, index) => (
//                       <Button
//                         key={index}
//                         mode={
//                           selectedTimes?.includes(slot?.time)
//                             ? 'contained'
//                             : 'outlined'
//                         }
//                         onPress={() =>
//                           handleTimeSelect(slot?.time, slot?.locations)
//                         }
//                         style={styles.timeButton}>
//                         <Text
//                           style={{
//                             color: selectedTimes?.includes(slot?.time)
//                               ? '#fff'
//                               : 'black',
//                             fontFamily: fonts.regular,
//                           }}>
//                           {convertTo12HourFormat(slot?.time)}
//                         </Text>
//                       </Button>
//                     ))}
//                   </View>

//                   <Button
//                     mode="outlined"
//                     style={{ marginBottom: 10 }}
//                     onPress={() => setMenuVisible(true)}>
//                     {selectedLocation?.value ?? 'Select Location'}
//                   </Button>

//                   {menuVisible && (
//                     <View
//                       style={{
//                         elevation: 3,
//                         backgroundColor: 'white',
//                         borderRadius: 10,
//                         marginBottom: 10,
//                         borderWidth: 1,
//                         borderColor: 'lightgray',
//                       }}>
//                       {locations.map((location, i) => (
//                         <TouchableOpacity
//                           key={location.key}
//                           onPress={() => handleLocationSelect(location)}
//                           style={{
//                             padding: 10,
//                             width: '90%',
//                             alignSelf: 'center',
//                             borderBottomWidth: i == locations?.length - 1 ? 0 : 1,
//                             borderColor: 'lightgray',
//                           }}>
//                           <Text style={{ color: 'black' }}>
//                             {selectedLocation?.key === location.key
//                               ? `✓ ${location.value}`
//                               : location.value}
//                           </Text>
//                         </TouchableOpacity>
//                       ))}
//                     </View>
//                   )}

//                   <View style={styles.checkboxContainer}>
//                     <TouchableOpacity
//                       style={[
//                         styles.customCheckbox,
//                         isTnc && styles.customCheckboxChecked
//                       ]}
//                       onPress={() => setIsTnc(!isTnc)}
//                     >
//                       {isTnc && <Text style={styles.checkmark}>✓</Text>}
//                     </TouchableOpacity>
//                     <View style={{ alignContent: 'center', flex: 1 }}>
//                       <Text variant="bodyMedium" style={styles.checkboxLabel}>
//                         I accept the terms and conditions
//                       </Text>
//                       <Text
//                         variant="bodyMedium"
//                         style={styles.link}
//                         onPress={() => {
//                           navigation?.navigate('TERMSCompnent');
//                           closeModal();
//                         }}>
//                         Read full Terms & Conditions
//                       </Text>
//                     </View>
//                   </View>

//                   <Button
//                     mode="contained"
//                     disabled={!isTnc || processingPayment}
//                     onPress={handlePayment}
//                     style={{
//                       backgroundColor: isTnc && !processingPayment ? Colors.primary : 'gray',
//                       opacity: isTnc && !processingPayment ? 1 : 0.5,
//                       marginBottom: 40,
//                     }}>
//                     <Text style={{ color: '#fff', fontFamily: fonts.regular }}>
//                       {processingPayment ? 'Processing Payment...' : `Pay ₹${item?.price}`}
//                     </Text>
//                   </Button>
//                 </>
//               )
//             )}
//           </ScrollView>
//         </View>
//       </Modal>
//     </>
//   );
// };

// // ... keep the same styles object as before ...
// const styles = StyleSheet.create({
//   modalBackdrop: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   calendar: {
//     marginBottom: 20,
//   },
//   dateText: {
//     fontSize: 14,
//     color: '#777',
//     alignSelf: 'center',
//     fontFamily: fonts.regular,
//   },
//   timeContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginVertical: 10,
//   },
//   timeButton: {
//     borderRadius: 5,
//     marginHorizontal: 5,
//     marginVertical: 5,
//   },
//   loader: {
//     marginTop: 20,
//   },
//   checkboxContainer: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     marginVertical: 10,
//   },
//   checkboxLabel: {
//     color: 'black',
//     marginLeft: 8,
//   },
//   link: {
//     color: '#6200ee',
//     marginBottom: 15,
//     textDecorationLine: 'underline',
//     marginLeft: 8,
//   },
//   customCheckbox: {
//     width: 22,
//     height: 22,
//     borderWidth: 2,
//     borderColor: Colors.primary,
//     borderRadius: 4,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 2,
//   },
//   customCheckboxChecked: {
//     backgroundColor: Colors.primary,
//   },
//   checkmark: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default ClassBookingCalendarModal;

import React, { useContext, useEffect, useState } from 'react';
import RazorpayCheckout from 'react-native-razorpay';
import fonts from '../FontFamily/FontFamily';
import { RAZORPAY_KEY_ID } from '../Config/Config';
import { Calendar } from 'react-native-calendars';
import { Colors } from '../Config/Config';
import {
  ActivityIndicator,
  Button,
} from 'react-native-paper';
import BookingSuccessModal from '../Bookings/SucessfullModa';
import moment from 'moment';
import { refreshAllData, showAvailability } from '../Api/Allapi';
import UserContext from '../../context/UserContext';
import { Checkbox } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import {
  Text,
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import axios from 'axios';
import { BaseUrl } from '../Api/BaseUrl';
// Remove Toast import since we're using Alert
// import Toast from 'react-native-toast-message';

const ClassBookingCalendarModal = ({ modal, closeModal, item }) => {
  const { userId, user } = useContext(UserContext);
  const navigation = useNavigation();
  const [markedDates, setMarkedDates] = useState({});
  const [locations, setLocations] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [durations, setDurations] = useState('');
  const [isTnc, setIsTnc] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const today = moment()?.format('YYYY-MM-DD');
  const [loading, setLoading] = useState(false);
  const [showAvailabilitys, setShowAvailability] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [overviewModal, setOverviewModal] = useState(false);
  const [classFullDates, setClassFullDates] = useState({}); // Track class full dates
  const [availableSlots, setAvailableSlots] = useState([]); // Store all available slots from API
  const [tempSelectedDate, setTempSelectedDate] = useState(null);


  // Helper function to show alerts
  const showAlert = (title, message, type = 'info') => {
    Alert.alert(
      title,
      message,
      [{ text: 'OK', onPress: () => console.log('Alert closed') }]
    );
  };

  const calendarLegends = [
    { name: 'Available', color: Colors?.primary },
    { name: 'Class Full', color: 'pink' },
    { name: 'Not Available', color: 'lightgray' },
  ];

  // Function to check availability for all times and locations at once
  const checkAllSlotsAvailability = async (classId, date) => {
    try {
      console.log('🔍 CHECKING ALL SLOTS AVAILABILITY:');
      console.log("Class ID:", classId);
      console.log("Date:", date);

      // Extract all unique times and location IDs from class availability
      const allTimes = [...new Set(item.availability.map(item => item.time))];

      // Extract only location IDs (not the full objects)
      const allLocationIds = [...new Set(item.availability.flatMap(item =>
        item.locations.map(loc => typeof loc === 'object' ? loc._id : loc)
      ))];

      console.log("All Times:", allTimes);
      console.log("All Location IDs:", allLocationIds);

      const response = await axios.post(`${BaseUrl}preview-booking-class-availbality`, {
        classId: classId,
        date: date,
        times: allTimes,
        locationIds: allLocationIds
      });

      console.log('📊 ALL SLOTS AVAILABILITY RESPONSE:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ ERROR CHECKING ALL SLOTS AVAILABILITY:', error);
      return {
        slots: [],
        message: "Error checking availability"
      };
    }
  };

  useEffect(() => {
    if (item) {
      markCalendarDates(item?.availability);
    }
  }, [item, classFullDates]);

  useEffect(() => {
    if (!item) return;

    const todayDate = moment().format('YYYY-MM-DD');

    // Only mark today as available, but don't automatically select it
    markCalendarDates(item.availability);

    // Load availability for today if needed
    // handleDateSelect(todayDate); // Remove this line
  }, [item]);


  const markCalendarDates = (availability, tempSelectedDate = null) => {
    const availabilityData = {};
    const currentDate = moment().startOf('day');
    const validityTill = moment().add(60, 'days');

    const validDays = new Set(availability?.map(item => item?.day));

    while (currentDate.isSameOrBefore(validityTill)) {
      const dateString = currentDate.format('YYYY-MM-DD');

      if (classFullDates[dateString]) {
        availabilityData[dateString] = {
          customStyles: {
            container: { backgroundColor: 'pink' },
            text: { color: 'white' },
          },
          disabled: true,
          disableTouchEvent: true,
        };
      } else if (validDays.has(currentDate.day())) {
        availabilityData[dateString] = {
          customStyles: {
            container: { backgroundColor: Colors.primary },
            text: { color: 'white' },
          },
        };
      } else {
        availabilityData[dateString] = {
          customStyles: {
            container: { backgroundColor: '#f0f0f0' },
            text: { color: '#d0d0d0' },
          },
          disabled: true,
          disableTouchEvent: true,
        };
      }

      currentDate.add(1, 'day');
    }

    // 🟠 Overlay TEMPORARY selected date (shows while checking availability)
    if (tempSelectedDate) {
      availabilityData[tempSelectedDate] = {
        customStyles: {
          container: { backgroundColor: 'orangered' },
          text: { color: 'white' },
        },
      };
    }

    setMarkedDates(availabilityData);
  };

  const isTimeAtLeast3HoursLater = (date, time) => {
    if (!date || !time) return false;

    const now = moment();
    const selectedDateTime = moment(
      `${date} ${time}`,
      'YYYY-MM-DD HH:mm'
    );

    // Future date → allowed
    if (selectedDateTime.isAfter(now, 'day')) {
      return true;
    }

    // Same day → check hour difference
    return selectedDateTime.diff(now, 'hours', true) >= 3;
  };



  const handleDateSelect = async (date) => {
    if (!item) return;

    // Set temporary selection for visual feedback
    setTempSelectedDate(date);
    markCalendarDates(item?.availability, date);

    const newDateDuration = new Date(date)?.getDay();
    const duration = item?.availability?.filter(res => newDateDuration === res?.day) || [];
    setDurations(duration?.duration);
    setLoading(true);
    setSelectedTimes([]);

    // Call the API to check all slots availability
    const availabilityResponse = await checkAllSlotsAvailability(item?._id, date);
    setLoading(false);

    if (availabilityResponse.slots && availabilityResponse.slots.length > 0) {
      console.log('🎯 PROCESSING AVAILABLE SLOTS:');

      // Filter only available slots
      const availableSlotsData = availabilityResponse.slots.filter(slot => slot.bookingAvailable);

      if (availableSlotsData.length === 0) {
        showAlert(
          'Class Full',
          'All slots for this date are fully booked. Please select another date.',
          'error'
        );

        // Mark this date as class full in the calendar IMMEDIATELY
        setClassFullDates(prev => ({
          ...prev,
          [date]: true
        }));

        // Update calendar to show pink color for class full date IMMEDIATELY
        markCalendarDates(item?.availability);

        // RESET everything since it's class full
        setTempSelectedDate(null);
        markCalendarDates(item?.availability);
        setSelectedDate(null);
        setShowAvailability(null);
        setAvailableSlots([]);
        return; // IMPORTANT: Return here to prevent further processing
      }

      console.log("Available Slots:", availableSlotsData);
      setAvailableSlots(availableSlotsData);

      // Only set selectedDate AFTER confirming there are available slots
      setSelectedDate(date);

      // Process the available slots to show in UI
      processAvailableSlotsData(availableSlotsData);
    } else {
      showAlert(
        'Error',
        'No availability data received',
        'error'
      );
      // Reset everything on error too
      setTempSelectedDate(null);
      markCalendarDates(item?.availability);
      setSelectedDate(null);
      setShowAvailability(null);
      setAvailableSlots([]);
    }
  };

  const processAvailableSlotsData = (slotsData) => {
    // Create a mapping of location IDs to location names from the original class data
    const locationMap = {};
    item.availability.forEach(avail => {
      avail.locations.forEach(loc => {
        const locationId = typeof loc === 'object' ? loc._id : loc;
        const locationName = typeof loc === 'object' ? loc.name : `Location ${loc}`;
        locationMap[locationId] = locationName;
      });
    });

    // Group slots by time and their locations
    const slotsByTime = {};

    slotsData.forEach(slot => {
      if (!slotsByTime[slot.time]) {
        slotsByTime[slot.time] = [];
      }

      // Use the location map to get the location name
      const locationName = locationMap[slot.location] || `Location ${slot.location}`;

      slotsByTime[slot.time].push({
        _id: slot.location,
        name: locationName,
        key: slot.location,
        value: locationName
      });
    });

    // Convert to the format expected by the existing UI
    const formattedSlots = Object.keys(slotsByTime).map(time => ({
      time: time,
      locations: slotsByTime[time]
    }));

    console.log('🔄 FORMATTED SLOTS FOR UI:', formattedSlots);

    // Set the first available slot as selected by default
    if (formattedSlots.length > 0) {
      const firstSlot = formattedSlots[0];
      setSelectedTimes([firstSlot.time]);
      setSelectedLocation(firstSlot.locations[0]);
      setLocations(firstSlot.locations);
    }

    setShowAvailability({ slots: formattedSlots });
  };

  const handleTimeSelect = (time, location) => {
    if (!time || !location) return;

    // Find the slot data for the selected time
    const selectedSlotData = availableSlots.find(slot =>
      slot.time === time && slot.location === location[0]?._id
    );

    if (selectedSlotData && !selectedSlotData.bookingAvailable) {
      showAlert(
        'Slot Unavailable',
        'This slot is no longer available. Please select another time.',
        'error'
      );
      return;
    }

    const newData = location?.map(loc => ({
      ...loc,
      key: loc?._id,
      value: loc?.name,
    }));
    setLocations(newData);
    setSelectedLocation(newData[0] || {});
    setSelectedTimes([time]);
  };

  const handleLocationSelect = location => {
    // Check if the selected location-time combination is available
    const selectedSlot = availableSlots.find(slot =>
      slot.time === selectedTimes[0] && slot.location === location._id
    );

    if (selectedSlot && !selectedSlot.bookingAvailable) {
      showAlert(
        'Location Unavailable',
        'This location is no longer available for the selected time.',
        'error'
      );
      return;
    }

    setSelectedLocation(location);
    setMenuVisible(false);
  };

  const startRazorpayPayment = async () => {
    if (!userId) {
      showAlert(
        'Authentication Error',
        'User not authenticated',
        'error'
      );
      return;
    }

    if (!selectedDate || !selectedTimes.length || !selectedLocation) {
      showAlert(
        'Selection Required',
        'Please select date, time and location',
        'error'
      );
      return;
    }

    // Double check availability from our stored available slots
    const slotAvailability = availableSlots.find(slot =>
      slot.time === selectedTimes[0] && slot.location === selectedLocation._id
    );

    if (!slotAvailability || !slotAvailability.bookingAvailable) {
      showAlert(
        'Slot Unavailable',
        'This slot is no longer available. Please select another time or location.',
        'error'
      );
      return;
    }

    try {
      setProcessingPayment(true);

      // Prepare payload for class booking - matching backend expectations
      const payload = {
        class: item?._id,
        user: userId,
        dates: [selectedDate],
        location: selectedLocation?.key,
        amount: item?.price,
        time: selectedTimes[0],
        duration: durations,
        people: 1
      };

      console.log('Creating class order with payload:', payload);

      // 1) Call backend to create Razorpay order
      const createRes = await axios.post(`${BaseUrl}create-class-order`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (!createRes?.data?.success) {
        throw new Error(createRes?.data?.message || "Failed to create order");
      }

      const orderId = createRes.data.orderId;
      const orderAmount = createRes.data.amount;

      console.log('Order created:', orderId, 'Amount:', orderAmount);

      // 2) Open Razorpay checkout with the order_id from backend
      const options = {
        description: `Payment for class ${item?.name}`,
        image: item?.image[0] ?? '',
        currency: "INR",
        key: RAZORPAY_KEY_ID,
        amount: orderAmount,
        order_id: orderId, // Use order_id from backend
        name: item?.name || "Class Booking",
        prefill: {
          email: user?.email || "",
          contact: user?.phone || "",
          name: user?.name || "",
        },
        theme: { color: Colors.primary || "#528FF0" },
      };

      console.log('Opening Razorpay with options:', options);

      RazorpayCheckout.open(options)
        .then(async (paymentResult) => {
          console.log('Razorpay payment result:', paymentResult);

          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = paymentResult;

          // 3) Verify payment at backend
          try {
            const verifyRes = await axios.post(`${BaseUrl}verify-class-order`, {
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
            }, {
              headers: { "Content-Type": "application/json" },
            });

            console.log('Verification response:', verifyRes.data);

            if (verifyRes.data && verifyRes.data.success) {
              // Refresh cached lists so availability/booked state updates immediately
              await refreshAllData();

              setOverviewModal(true);

              setProcessingPayment(false);
              closeModal();
            } else {
              throw new Error(verifyRes.data?.message || "Payment verification failed");
            }
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr?.response?.data || verifyErr.message);
            showAlert(
              'Verification Failed',
              'Payment verification failed. Please contact support.',
              'error'
            );
            setProcessingPayment(false);
          }
        })
        .catch((err) => {
          console.error("Razorpay checkout error:", err);
          if (err.code === 1) {
            showAlert(
              'Payment Cancelled',
              'Payment process was cancelled',
              'info'
            );
          } else {
            showAlert(
              'Payment Failed',
              err.description || 'Payment failed. Please try again.',
              'error'
            );
          }
          setProcessingPayment(false);
        });
    } catch (err) {
      console.error("Payment initialization error:", err?.response?.data || err.message);
      showAlert(
        'Payment Error',
        'Failed to initialize payment process',
        'error'
      );
      setProcessingPayment(false);
    }
  };

  const handlePayment = () => {
    if (!isTnc) {
      showAlert(
        'Terms Required',
        'Please accept terms and conditions',
        'error'
      );
      return;
    }

    if (!selectedDate) {
      showAlert(
        'Date Required',
        'Please select a date',
        'error'
      );
      return;
    }

    if (!selectedTimes.length) {
      showAlert(
        'Time Required',
        'Please select a time',
        'error'
      );
      return;
    }

    if (!selectedLocation) {
      showAlert(
        'Location Required',
        'Please select a location',
        'error'
      );
      return;
    }
    if (!isTimeAtLeast3HoursLater(selectedDate, selectedTimes[0])) {
      showAlert(
        'Booking Not Allowed',
        'You can book a class only at least 3 hours before the start time.',
        'error'
      );
      return;
    }


    // Double check availability before payment
    const slotAvailability = availableSlots.find(slot =>
      slot.time === selectedTimes[0] && slot.location === selectedLocation._id
    );

    if (!slotAvailability || !slotAvailability.bookingAvailable) {
      showAlert(
        'Slot Unavailable',
        'This slot is no longer available. Please select another time or location.',
        'error'
      );
      return;
    }

    startRazorpayPayment();
  };

  const convertTo12HourFormat = time24 => {
    if (!time24 || typeof time24 !== 'string') {
      return 'Invalid time';
    }

    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const adjustedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');

    return `${adjustedHours}:${formattedMinutes} ${period}`;
  };

  return (
    <>
      <BookingSuccessModal
        isVisible={overviewModal}
        isPackage={false}
        onClose={() => setOverviewModal(false)}
      />

      <Modal
        visible={modal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}>
        <View style={styles.modalBackdrop}>
          <ScrollView
            style={{
              padding: 20,
              backgroundColor: 'white',
              margin: 'auto',
              height: 'auto',
              width: '90%',
              marginVertical: selectedDate && showAvailabilitys ? '20%' : '45%',
              borderWidth: 1,
              borderRadius: 10,
            }}>
            <TouchableOpacity onPress={closeModal}>
              <Text
                style={{ color: 'red', textAlign: 'right', marginVertical: 5 }}>
                Close
              </Text>
            </TouchableOpacity>

            <Calendar
              style={styles.calendar}
              markedDates={markedDates}
              markingType={'custom'}
              onDayPress={day => handleDateSelect(day?.dateString)}
              current={today}
              minDate={moment()?.format('YYYY-MM-DD')}
              maxDate={moment()?.add(60, 'days').format('YYYY-MM-DD')}
              hideExtraDays={true}
              disableMonthChange={true}
              theme={{
                textDayFontFamily: fonts.regular,
                textMonthFontFamily: fonts.regular,
                textDayHeaderFontFamily: fonts.regular,
              }}
            />

            <View style={{ display: 'flex', flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              {calendarLegends.map(e => (
                <View
                  style={{ display: 'flex', flexDirection: 'row', gap: 5, alignItems: 'center' }}
                  key={e?.name}>
                  <View
                    style={{
                      height: 20,
                      width: 20,
                      borderRadius: 50,
                      backgroundColor: e?.color,
                    }}></View>
                  <Text style={{ color: 'black', fontSize: 12 }}>{e?.name}</Text>
                </View>
              ))}
            </View>

            {loading ? (
              <ActivityIndicator
                size="large"
                color={Colors.primary}
                style={styles.loader}
              />
            ) : (
              selectedDate &&
              showAvailabilitys && (
                <>
                  <Text style={styles.dateText}>
                    Selected Date: {selectedDate}
                  </Text>

                  <View style={styles.timeContainer}>
                    {showAvailabilitys?.slots?.map((slot, index) => {
                      const isAllowed = isTimeAtLeast3HoursLater(selectedDate, slot.time);

                      return (
                        <Button
                          key={index}
                          mode={selectedTimes.includes(slot.time) ? 'contained' : 'outlined'}
                          onPress={() => handleTimeSelect(slot.time, slot.locations)}
                          disabled={!isAllowed}
                          style={styles.timeButton}
                        >
                          <Text
                            style={{
                              color: selectedTimes.includes(slot.time)
                                ? '#fff'
                                : isAllowed ? 'black' : '#aaa',
                              fontFamily: fonts.regular,
                            }}
                          >
                            {convertTo12HourFormat(slot.time)}
                          </Text>
                        </Button>
                      );
                    })}

                  </View>

                  <Button
                    mode="outlined"
                    style={{ marginBottom: 10 }}
                    onPress={() => setMenuVisible(true)}>
                    {selectedLocation?.value ?? 'Select Location'}
                  </Button>

                  {menuVisible && (
                    <View
                      style={{
                        elevation: 3,
                        backgroundColor: 'white',
                        borderRadius: 10,
                        marginBottom: 10,
                        borderWidth: 1,
                        borderColor: 'lightgray',
                      }}>
                      {locations.map((location, i) => (
                        <TouchableOpacity
                          key={location.key}
                          onPress={() => handleLocationSelect(location)}
                          style={{
                            padding: 10,
                            width: '90%',
                            alignSelf: 'center',
                            borderBottomWidth: i == locations?.length - 1 ? 0 : 1,
                            borderColor: 'lightgray',
                          }}>
                          <Text style={{ color: 'black' }}>
                            {selectedLocation?.key === location.key
                              ? `✓ ${location.value}`
                              : location.value}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  <View style={styles.checkboxContainer}>
                    <TouchableOpacity
                      style={[
                        styles.customCheckbox,
                        isTnc && styles.customCheckboxChecked
                      ]}
                      onPress={() => setIsTnc(!isTnc)}
                    >
                      {isTnc && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                    <View style={{ alignContent: 'center', flex: 1 }}>
                      <Text variant="bodyMedium" style={styles.checkboxLabel}>
                        I accept the terms and conditions
                      </Text>
                      <Text
                        variant="bodyMedium"
                        style={styles.link}
                        onPress={() => {
                          navigation?.navigate('TERMSCompnent');
                          closeModal();
                        }}>
                        Read full Terms & Conditions
                      </Text>
                    </View>
                  </View>

                  <Button
                    mode="contained"
                    disabled={!isTnc || processingPayment}
                    onPress={handlePayment}
                    style={{
                      backgroundColor: isTnc && !processingPayment ? Colors.primary : 'gray',
                      opacity: isTnc && !processingPayment ? 1 : 0.5,
                      marginBottom: 40,
                    }}>
                    <Text style={{ color: '#fff', fontFamily: fonts.regular }}>
                      {processingPayment ? 'Processing Payment...' : `Pay ₹${item?.price}`}
                    </Text>
                  </Button>
                </>
              )
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendar: {
    marginBottom: 20,
  },
  dateText: {
    fontSize: 14,
    color: '#777',
    alignSelf: 'center',
    fontFamily: fonts.regular,
  },
  timeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  timeButton: {
    borderRadius: 5,
    marginHorizontal: 5,
    marginVertical: 5,
  },
  loader: {
    marginTop: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 10,
  },
  checkboxLabel: {
    color: 'black',
    marginLeft: 8,
  },
  link: {
    color: '#6200ee',
    marginBottom: 15,
    textDecorationLine: 'underline',
    marginLeft: 8,
  },
  customCheckbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  customCheckboxChecked: {
    backgroundColor: Colors.primary,
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ClassBookingCalendarModal;
