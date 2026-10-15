// import React, {useState, useEffect, useContext} from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   Dimensions,
// } from 'react-native';
// import {Calendar} from 'react-native-calendars';
// import {Modal} from 'react-native';
// import moment from 'moment';
// import fonts from '../FontFamily/FontFamily';
// import {rescheduleBooking, showAvailability} from '../Api/Allapi';
// import UserContext from '../../context/UserContext';
// import {useNavigation} from '@react-navigation/native';
// import {Button} from 'react-native-paper';
// import {convertTo12HourFormat} from '../utils/functions';
// import {Colors} from '../Config/Config';

// const RescheduleModal = ({selectedBooking, handleModalClose, fetchData}) => {
//   const [loading, setLoading] = useState(false);
//   const [dateLoading, setDateLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [selectedDate, setSelectedDate] = useState('');
//   const [enabledDays, setEnabledDays] = useState([]);
//   const [markedDates, setMarkedDates] = useState({});
//   const today = moment()?.format('YYYY-MM-DD');
//   const {token, userId, user} = useContext(UserContext);
//   const navigation = useNavigation();
//   const [isModalVisible, setIsModalVisible] = useState(false); // State to control modal visibility
//   const [locations, setLocations] = useState([]);
//   const [menuVisible, setMenuVisible] = useState(false);
//   const [selectedLocation, setSelectedLocation] = useState(null);
//   const [selectedTimes, setSelectedTimes] = useState([]);
//   const [durations, setDurations] = useState('');
//   const [isTnc, setIsTnc] = useState(false);
//   const [showAvailabilitys, setShowAvailability] = useState(null);
//   const [overviewModal, setOverviewModal] = useState(false);

//   useEffect(() => {
//     if (selectedBooking) {
//       markCalendarDates(selectedBooking?.class?.availability);
//     }
//   }, [selectedBooking]);

//   const markCalendarDates = availability => {
//     const availabilityData = {};
//     const currentDate = moment().startOf('day');
//     const validityTill = moment().add(60, 'days');

//     // Create a Set of valid days for O(1) lookup
//     const validDays = new Set(availability?.map(item => item?.day));
//     while (currentDate.isSameOrBefore(validityTill)) {
//       const dateString = currentDate.format('YYYY-MM-DD');

//       if (validDays.has(currentDate.day())) {
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
//               backgroundColor: '#f0f0f0', // Light gray for disabled dates
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

//   const handleReschedule = async () => {
//     if (!selectedDate) return;
//     try {
//       setLoading(true);
//       setError(null);
//       if (!selectedBooking?._id) throw new Error('Booking ID is undefined');
//       if (!selectedDate || !selectedLocation || !selectedTimes)
//         throw new Error('Please Selecet All The Fields');
//       const res = await rescheduleBooking(
//         new Date(selectedDate),
//         selectedBooking?._id,
//         selectedBooking?.dates[0],
//         token,
//         {location: selectedLocation?.key, time: selectedTimes[0]},
//       );
//       if (!res) throw new Error('Failed to reschedule booking');
//       fetchData();
//       handleModalClose();
//     } catch (err) {
//       console.error('Reschedule error:', err);
//       setError(
//         err instanceof Error ? err.message : 'Failed to reschedule booking',
//       );
//       Alert.alert('Error', err.message);
//     } finally {
//       setLoading(false);
//     }
//   };
//   const handleDateSelect = date => {
//     setSelectedDate(date);

//     // Get the day of the week for the selected date (0 for Sunday, 1 for Monday, etc.)
//     const newDateDuration = new Date(date)?.getDay();

//     // Filter the availability data based on the day
//     const duration =
//       selectedBooking?.class?.availability?.filter(
//         res => newDateDuration === res?.day,
//       ) || [];
//     setDurations(duration?.duration);
//     setDateLoading(true);
//     setSelectedTimes([]); // Reset selected times when selecting a new date
//     Showdate(date);
//   };
//   const Showdate = date => {
//     showAvailability(
//       moment(date).format('DD-MM-YYYY'),
//       selectedBooking?.class?._id,
//     )
//       .then(res => {
//         setShowAvailability(res);
//         processAvailabilityData(res);
//         setDateLoading(false);
//       })
//       .catch(() => setDateLoading(false));
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
//       }
//     }
//   };
//   const handleLocationSelect = location => {
//     setSelectedLocation(location);
//     setMenuVisible(false);
//   };
//   const handleTimeSelect = (time, location) => {
//     if (!time || !location) return;
//     const newData = location?.map(loc => ({
//       ...loc,
//       key: loc?._id,
//       value: loc?.name,
//     }));
//     setLocations(newData);
//     setSelectedLocation(newData[0] || {});
//     setSelectedTimes([time]);
//   };
//   return (
//     <Modal
//       transparent
//       visible={true}
//       animationType="fade"
//       onRequestClose={handleModalClose}>
//       <View style={styles.modalOverlay}>
//         <View style={styles.container}>
//           {loading ? (
//             <ActivityIndicator size="large" color="#0035D4" />
//           ) : (
//             <>
//               <Text style={styles.header}>Reschedule Booking</Text>
//               <Calendar
//                 style={styles.calendar}
//                 markedDates={markedDates}
//                 markingType={'custom'}
//                 onDayPress={day => handleDateSelect(day?.dateString)}
//                 current={today}
//                 minDate={moment()?.format('YYYY-MM-DD')} // Start of the current month
//                 maxDate={moment()?.add(60, 'days').format('YYYY-MM-DD')} // End of the current month
//                 hideExtraDays={true} // Hides the extra days of previous/next months
//                 disableMonthChange={true} // Disables navigation to other months
//                 theme={{
//                   textDayFontFamily: fonts.regular,
//                   textMonthFontFamily: fonts.regular,
//                   textDayHeaderFontFamily: fonts.regular,
//                 }}
//               />

//               <View style={{width: '100%'}}>
//                 <View style={{display: 'flex', flexDirection: 'row', gap: 10}}>
//                   {[
//                     {name: 'Available', color: Colors?.primary},
//                     {name: 'Not Available', color: 'lightgray'},
//                   ]?.map(e => (
//                     <View
//                       style={{display: 'flex', flexDirection: 'row', gap: 5}}
//                       key={e?.name}>
//                       <View
//                         style={{
//                           height: 20,
//                           width: 20,
//                           borderRadius: 50,
//                           backgroundColor: e?.color,
//                         }}></View>
//                       <Text style={{color: 'black'}}>{e?.name}</Text>
//                     </View>
//                   ))}
//                 </View>
//                 {dateLoading ? (
//                   <ActivityIndicator
//                     size="large"
//                     color={Colors.primary}
//                     style={styles.loader}
//                   />
//                 ) : (
//                   selectedDate &&
//                   showAvailabilitys && (
//                     <>
//                       <Text style={styles.dateText}>
//                         Selected Date: {selectedDate}
//                       </Text>
//                       <View style={styles.timeContainer}>
//                         {showAvailabilitys?.slots?.map((slot, index) => (
//                           <Button
//                             key={index}
//                             mode={
//                               selectedTimes?.includes(slot?.time)
//                                 ? 'contained'
//                                 : 'outlined'
//                             }
//                             onPress={() =>
//                               handleTimeSelect(slot?.time, slot?.locations)
//                             }
//                             style={styles.timeButton}>
//                             <Text
//                               style={{
//                                 color: selectedTimes?.includes(slot?.time)
//                                   ? '#fff'
//                                   : 'black',
//                                 fontFamily: fonts.regular,
//                               }}>
//                               {convertTo12HourFormat(slot?.time)}
//                             </Text>
//                           </Button>
//                         ))}
//                       </View>
//                       <Button
//                         mode="outlined"
//                         style={{marginBottom: 10}}
//                         onPress={() => setMenuVisible(true)} // Move onPress here
//                       >
//                         {selectedLocation?.value ?? 'Select Location'}
//                       </Button>
//                       {menuVisible && (
//                         <View
//                           style={{
//                             elevation: 3,
//                             backgroundColor: 'white',
//                             borderRadius: 10,
//                             marginBottom: 10,
//                             borderWidth: 1,
//                             borderColor: 'lightgray',
//                           }}>
//                           {locations.map((location, i) => (
//                             <TouchableOpacity
//                               key={location.key}
//                               onPress={() => handleLocationSelect(location)}
//                               style={{
//                                 padding: 10,
//                                 width: '90%',
//                                 //   alignItems:'center',
//                                 alignSelf: 'center',
//                                 borderBottomWidth:
//                                   i == locations?.length - 1 ? 0 : 1,
//                                 borderColor: 'lightgray',
//                               }}>
//                               <Text style={{color: 'black'}}>
//                                 {selectedLocation?.key === location.key
//                                   ? `✓ ${location.value}`
//                                   : location.value}
//                               </Text>
//                             </TouchableOpacity>
//                           ))}
//                         </View>
//                       )}
//                     </>
//                   )
//                 )}
//               </View>
//               <View style={styles.buttonContainer}>
//                 <TouchableOpacity
//                   style={styles.cancelButton}
//                   onPress={handleModalClose}>
//                   <Text style={{...styles.buttonText, color: 'black'}}>
//                     Cancel
//                   </Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[
//                     styles.submitButton,
//                     !selectedDate && styles.submitButtonDisabled,
//                   ]}
//                   onPress={handleReschedule}
//                   disabled={
//                     !selectedDate || !selectedLocation || !selectedTimes
//                   }>
//                   <Text style={styles.buttonText}>Confirm Reschedule</Text>
//                 </TouchableOpacity>
//               </View>
//             </>
//           )}
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   dateText: {
//     fontSize: 14,
//     color: '#777',
//     // alignSelf: 'center',
//     marginTop: 10,
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
//   selectedLocation: {
//     marginTop: 10,
//   },
//   container: {
//     width: '90%',
//     backgroundColor: '#ffffff',
//     padding: 20,
//     borderRadius: 15,
//     alignItems: 'center',
//   },
//   header: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#000',
//     marginBottom: 20,
//   },
//   calendarHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     width: '100%',
//     marginBottom: 15,
//   },
//   monthButton: {
//     padding: 10,
//     borderRadius: 8,
//     backgroundColor: '#f0f0f0',
//   },
//   monthButtonText: {
//     fontSize: 18,
//     color: '#000',
//   },
//   monthText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   calendar: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     width: '100%',
//   },
//   dayHeader: {
//     width: `${100 / 7}%`,
//     padding: 10,
//     alignItems: 'center',
//   },
//   dayHeaderText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#666',
//   },
//   day: {
//     width: `${100 / 7}%`,
//     aspectRatio: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     margin: 1,
//   },
//   enabledDay: {
//     backgroundColor: '#e6f4ea',
//     borderRadius: 100,
//   },
//   selectedDay: {
//     backgroundColor: '#34a853',
//     borderRadius: 100,
//   },
//   disabledDay: {
//     opacity: 0.3,
//   },
//   dayText: {
//     fontSize: 16,
//     color: '#000',
//   },
//   selectedDayText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   disabledDayText: {
//     color: '#999',
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     width: '100%',
//     marginTop: 20,
//   },
//   cancelButton: {
//     backgroundColor: '#f0f0f0',
//     padding: 12,
//     borderRadius: 8,
//     marginRight: 10,
//   },
//   submitButton: {
//     backgroundColor: '#34a853',
//     padding: 12,
//     borderRadius: 8,
//   },
//   submitButtonDisabled: {
//     backgroundColor: '#ccc',
//   },
//   buttonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   calendar: {
//     marginBottom: 20,
//   },
// });

// export default RescheduleModal;

import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Modal } from 'react-native';
import moment from 'moment';
import fonts from '../FontFamily/FontFamily';
import { rescheduleBooking, showAvailability } from '../Api/Allapi';
import UserContext from '../../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { convertTo12HourFormat } from '../utils/functions';
import { Colors } from '../Config/Config';
import Toast from 'react-native-toast-message';

const RescheduleModal = ({
  selectedBooking,
  packageDuration,
  handleModalClose,
  fetchData,
  classAvailability,
  classId,
  extendedValidityEndDate,
  userPackage,
}) => {
  const [loading, setLoading] = useState(false);
  const [dateLoading, setDateLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const today = moment().format('YYYY-MM-DD');
  const { token, userId, user } = useContext(UserContext);
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [locations, setLocations] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [durations, setDurations] = useState('');
  const [isTnc, setIsTnc] = useState(false);
  const [showAvailabilitys, setShowAvailability] = useState(null);
  const [overviewModal, setOverviewModal] = useState(false);

  const getValidityDate = () => {
    const todayStr = moment().format('YYYY-MM-DD');

    // 1. Check direct prop
    if (extendedValidityEndDate) return moment(extendedValidityEndDate).format('YYYY-MM-DD');

    // 2. Check within userPackage
    if (userPackage?.extendedValidityEndDate) return moment(userPackage.extendedValidityEndDate).format('YYYY-MM-DD');

    // 3. Calculate from userPackage createdAt + packageDuration
    // We check for userPackage.user to ensure it's a UserPackage record and not just a Package definition
    if ((userPackage?.user || userPackage?.userId) && userPackage?.createdAt && packageDuration) {
      const calculatedExpiry = moment(userPackage.createdAt).add(packageDuration, 'days');
      // If the calculated expiry is in the future, use it. Otherwise, fall back.
      if (calculatedExpiry.isAfter(moment(), 'day')) {
        return calculatedExpiry.format('YYYY-MM-DD');
      }
    }

    // 4. Fallback to current logic (relative to now)
    const fallbackDate = packageDuration
      ? moment().add(packageDuration, 'days').format('YYYY-MM-DD')
      : moment().add(90, 'days').format('YYYY-MM-DD'); // Default 90 days for single classes

    return fallbackDate;
  };

  const validityTill = getValidityDate();

  useEffect(() => {
    if (classAvailability) {
      markCalendarDates(classAvailability);
    }
  }, [classAvailability, selectedDate, validityTill]);

  console.log('Reschedule class Id: ', classId);
  console.log('Package Duration: ', packageDuration);
  console.log('Class Availability: ', classAvailability);

  const markCalendarDates = availability => {
    const marked = {};
    const currentDate = moment();
    const endDate = moment(validityTill);

    // Create a map of available days with their durations
    const availableDays = {};
    availability?.forEach(item => {
      if (item?.day >= 1 && item?.day <= 7) {
        // Changed from 6 to 7 to include Sunday
        availableDays[item.day] = item.duration;
      }
    });

    console.log('Available Days Map: ', availableDays);

    // Mark all dates in the range
    while (currentDate.isSameOrBefore(endDate)) {
      const dateStr = currentDate.format('YYYY-MM-DD');
      const dayOfWeek = currentDate.isoWeekday(); // 1-7 (Monday-Sunday)

      // Skip past dates
      if (currentDate.isBefore(moment(), 'day')) {
        marked[dateStr] = {
          disabled: true,
          disableTouchEvent: true,
          customStyles: { text: { color: '#d3d3d3' } },
        };
      } else if (availableDays[dayOfWeek]) {
        // Available date
        marked[dateStr] = {
          selected: dateStr === selectedDate,
          selectedColor: Colors.primary,
          customStyles: {
            container: {
              backgroundColor:
                dateStr === selectedDate ? Colors.primary : 'transparent',
              borderRadius: 20,
              borderWidth: dateStr === selectedDate ? 0 : 1,
              borderColor: Colors.primary,
            },
            text: {
              color: dateStr === selectedDate ? 'white' : Colors.primary,
              fontWeight: dateStr === selectedDate ? 'bold' : 'normal',
            },
          },
          disabled: false,
        };
      } else {
        // Unavailable date
        marked[dateStr] = {
          disabled: true,
          disableTouchEvent: true,
          customStyles: { text: { color: '#d3d3d3' } },
        };
      }

      currentDate.add(1, 'day');
    }

    console.log('Marked Dates: ', Object.keys(marked).slice(0, 10)); // Log first 10 dates
    setMarkedDates(marked);
  };

  const handleDateSelect = date => {
    console.log('Date selected: ', date);
    console.log('Marked date info: ', markedDates[date]);

    // Skip if date is disabled
    if (markedDates[date]?.disabled) {
      console.log('Date is disabled, skipping');
      return;
    }

    setSelectedDate(date);
    setDateLoading(true);
    setSelectedTimes([]);

    // Find the day of week for availability check
    const selectedDay = moment(date).isoWeekday();
    console.log('Selected day of week: ', selectedDay);

    const dayAvailability = classAvailability?.find(
      res => selectedDay === res?.day,
    );

    console.log('Day availability found: ', dayAvailability);

    if (dayAvailability) {
      setDurations(dayAvailability.duration);
      Showdate(date);
    } else {
      console.log('No availability found for this day');
      setDateLoading(false);
    }
  };

  const handleReschedule = async () => {
    console.log('Testing reschedule');
    if (!selectedDate) {
      Toast.show({
        type: 'error',
        text1: 'Date Required',
        text2: 'Please select a date',
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (!selectedBooking?._id) {
        Toast.show({
          type: 'error',
          text1: 'Booking Error',
          text2: 'Booking ID is undefined',
        });
        throw new Error('Booking ID is undefined');
      }

      if (!selectedDate || !selectedLocation || !selectedTimes?.length) {
        Toast.show({
          type: 'error',
          text1: 'Incomplete Selection',
          text2: 'Please select all required fields',
        });
        throw new Error('Please Select All The Fields');
      }

      // 1. Validation on the ORIGINAL booking: Cannot reschedule if it starts within 3 hours from now
      const currentBookingDateTime = moment(
        `${selectedBooking?.dates[0]} ${selectedBooking?.time}`,
        'YYYY-MM-DD HH:mm'
      );
      if (currentBookingDateTime.diff(moment(), 'hours', true) < 3) {
        Alert.alert(
          'Reschedule Not Allowed',
          'You cannot reschedule this class as it starts in less than 3 hours.'
        );
        throw new Error('Original booking is within 3 hours');
      }

      // 2. Validation on the NEW reschedule target date & time: Must be at least 3 hours from now
      const isTimeAtLeast3HoursLater = (date, time) => {
        if (!date || !time) return false;
        const now = moment();
        const selectedDateTime = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
        if (selectedDateTime.isAfter(now, 'day')) return true;
        return selectedDateTime.diff(now, 'hours', true) >= 3;
      };

      if (!isTimeAtLeast3HoursLater(selectedDate, selectedTimes[0])) {
        Alert.alert(
          'Reschedule Not Allowed',
          'You can reschedule a class only to a slot at least 3 hours from now.'
        );
        throw new Error('Reschedule target is within 3 hours');
      }

      const res = await rescheduleBooking(
        new Date(selectedDate),
        selectedBooking?._id,
        selectedBooking?.dates[0],
        token,
        { location: selectedLocation?.key, time: selectedTimes[0] },
      );

      if (!res) {
        Toast.show({
          type: 'error',
          text1: 'Reschedule Failed',
          text2: 'Failed to reschedule booking',
        });
        throw new Error('Failed to reschedule booking');
      }

      // Success message
      Toast.show({
        type: 'success',
        text1: 'Booking Rescheduled',
        text2: 'Your booking has been successfully rescheduled',
      });

      fetchData();
      handleModalClose();

    } catch (err) {
      console.error('Reschedule error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to reschedule booking',
      );

      // Only show error toast if not already shown in the validation
      if (!err.message.includes('Please select') && !err.message.includes('Booking ID')) {
        Toast.show({
          type: 'error',
          text1: 'Reschedule Error',
          text2: err.message || 'Failed to reschedule booking',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const Showdate = date => {
    console.log('Showing availability for date: ', date);
    showAvailability(moment(date).format('DD-MM-YYYY'), classId)
      .then(res => {
        console.log('Availability response: ', res);
        setShowAvailability(res);
        processAvailabilityData(res);
        setDateLoading(false);
      })
      .catch(err => {
        console.error('Error fetching availability: ', err);
        setDateLoading(false);
      });
  };

  const processAvailabilityData = availability => {
    if (availability && availability.slots) {
      const availableSlots = availability.slots.map(slot => ({
        time: slot.time,
        locations: slot.locations.map(location => ({
          key: location._id,
          value: location.name,
        })),
      }));

      if (availableSlots.length > 0) {
        const firstSlot = availableSlots[0];
        setSelectedTimes([firstSlot?.time]);
        setSelectedLocation(firstSlot?.locations[0]);
        setLocations(firstSlot?.locations);
      }
    }
  };

  const handleLocationSelect = location => {
    setSelectedLocation(location);
    setMenuVisible(false);
  };

  const handleTimeSelect = (time, location) => {
    if (!time || !location) return;
    const newData = location?.map(loc => ({
      ...loc,
      key: loc?._id,
      value: loc?.name,
    }));
    setLocations(newData);
    setSelectedLocation(newData[0] || {});
    setSelectedTimes([time]);
  };

  return (
    <Modal
      transparent
      visible={true}
      animationType="fade"
      onRequestClose={handleModalClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} />
          ) : (
            <>
              <Text style={styles.header}>Reschedule Booking</Text>
              <Calendar
                style={styles.calendar}
                markedDates={markedDates}
                markingType={'custom'}
                onDayPress={day => handleDateSelect(day.dateString)}
                current={today}
                minDate={today}
                maxDate={validityTill}
                hideExtraDays={false}
                disableMonthChange={false}
                allowSelectionOutOfRange={false}
                disableAllTouchEventsForDisabledDays={true}
                theme={{
                  textDayFontFamily: fonts.regular,
                  textMonthFontFamily: fonts.regular,
                  textDayHeaderFontFamily: fonts.regular,
                  'stylesheet.calendar.header': {
                    dayHeader: {
                      fontWeight: '600',
                      color: '#666',
                      width: 32,
                      textAlign: 'center'
                    },
                    week: {
                      marginTop: 7,
                      flexDirection: 'row',
                      justifyContent: 'space-around'
                    }
                  },
                  'stylesheet.day.basic': {
                    base: {
                      width: 32,
                      height: 32,
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                  },
                }}
              />

              <View style={{ width: '100%' }}>
                <View style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
                  {[
                    { name: 'Available', color: Colors?.primary },
                    { name: 'Not Available', color: 'lightgray' },
                  ]?.map(e => (
                    <View
                      style={{ display: 'flex', flexDirection: 'row', gap: 5 }}
                      key={e?.name}>
                      <View
                        style={{
                          height: 20,
                          width: 20,
                          borderRadius: 50,
                          backgroundColor: e?.color,
                        }}></View>
                      <Text style={{ color: 'black' }}>{e?.name}</Text>
                    </View>
                  ))}
                </View>
                {dateLoading ? (
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
                          const isAllowed = (() => {
                            if (!selectedDate || !slot?.time) return false;
                            const now = moment();
                            const selectedDateTime = moment(`${selectedDate} ${slot.time}`, 'YYYY-MM-DD HH:mm');
                            if (selectedDateTime.isAfter(now, 'day')) return true;
                            return selectedDateTime.diff(now, 'hours', true) >= 3;
                          })();

                          return (
                            <Button
                              key={index}
                              mode={
                                selectedTimes?.includes(slot?.time)
                                  ? 'contained'
                                  : 'outlined'
                              }
                              disabled={!isAllowed}
                              onPress={() =>
                                handleTimeSelect(slot?.time, slot?.locations)
                              }
                              style={styles.timeButton}>
                              <Text
                                style={{
                                  color: selectedTimes?.includes(slot?.time)
                                    ? '#fff'
                                    : isAllowed ? 'black' : 'gray',
                                  fontFamily: fonts.regular,
                                }}>
                                {convertTo12HourFormat(slot?.time)}
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
                                borderBottomWidth:
                                  i == locations?.length - 1 ? 0 : 1,
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
                    </>
                  )
                )}
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleModalClose}>
                  <Text style={{ ...styles.buttonText, color: 'black' }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!selectedDate ||
                      !selectedLocation ||
                      !selectedTimes?.length) &&
                    styles.submitButtonDisabled,
                  ]}
                  onPress={handleReschedule}
                  disabled={
                    !selectedDate || !selectedLocation || !selectedTimes?.length
                  }>
                  <Text style={styles.buttonText}>Confirm Reschedule</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#777',
    marginTop: 10,
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
  selectedLocation: {
    marginTop: 10,
  },
  container: {
    width: '90%',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  monthButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  monthButtonText: {
    fontSize: 18,
    color: '#000',
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  calendar: {
    marginBottom: 20,
    borderRadius: 10,
    elevation: 4,
    'stylesheet.day.basic': {
      today: {
        borderColor: Colors.primary,
        borderWidth: 1,
      },
      todayText: {
        color: Colors.primary,
        fontWeight: 'bold',
      },
    },
  },
  dayHeader: {
    width: `${100 / 7}%`,
    padding: 10,
    alignItems: 'center',
  },
  dayHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  day: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
  },
  enabledDay: {
    backgroundColor: '#e6f4ea',
    borderRadius: 100,
  },
  selectedDay: {
    backgroundColor: '#34a853',
    borderRadius: 100,
  },
  disabledDay: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 16,
    color: '#000',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledDayText: {
    color: '#999',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: '#34a853',
    padding: 12,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loader: {
    marginVertical: 20,
  },
});

export default RescheduleModal;