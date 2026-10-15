import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import {
  Menu,
  Button,
  Divider,
  ActivityIndicator,
  Chip,
  Dialog,
  Portal,
} from 'react-native-paper';
import { Colors } from '../Config/Config';
import UserContext from '../../context/UserContext';
import moment from 'moment';
import { PaymentRequest, showAvailability } from '../Api/Allapi';
import RazorpayCheckout from 'react-native-razorpay';
import { RAZORPAY_KEY_ID } from '../Config/Config';
import fonts from '../FontFamily/FontFamily';
import { useNavigation } from '@react-navigation/native';
import BookingSuccessModal from './SucessfullModa';
import Toast from 'react-native-toast-message';

const WeeklyChart = ({ data }) => {
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const { userId, user } = useContext(UserContext);
  const [showAvailabilitys, setShowAvailability] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const today = moment()?.format('YYYY-MM-DD');
  const navigation = useNavigation();
  const [durations, setDurations] = useState('');
  const [overviewModal, setOverviewModal] = useState(false);

  useEffect(() => {
    if (data) {
      markCalendarDates(data?.availability);
    }
  }, [data]);

  const markCalendarDates = availability => {
    const availabilityData = {};
    const currentDate = moment().startOf('day');
    const validityTill = moment().add(60, 'days');

    // Create a Set of valid days for O(1) lookup
    const validDays = new Set(availability?.map(item => item?.day));
    while (currentDate.isSameOrBefore(validityTill)) {
      const dateString = currentDate.format('YYYY-MM-DD');

      if (validDays.has(currentDate.day())) {
        availabilityData[dateString] = {
          customStyles: {
            container: {
              backgroundColor: Colors?.primary,
            },
            text: {
              color: 'white',
            },
          },
        };
      } else {
        availabilityData[dateString] = {
          customStyles: {
            container: {
              backgroundColor: '#f0f0f0', // Light gray for disabled dates
            },
            text: {
              color: '#d0d0d0',
            },
          },
          disabled: true,
          disableTouchEvent: true,
        };
      }

      currentDate.add(1, 'day');
    }

    setMarkedDates(availabilityData);
  };
  const handleDateSelect = date => {
    setSelectedDate(date);

    // Get the day of the week for the selected date (0 for Sunday, 1 for Monday, etc.)
    const newDateDuration = new Date(date)?.getDay();

    // Filter the availability data based on the day
    const duration =
      data?.availability?.filter(res => newDateDuration === res?.day) || [];
    setDurations(duration?.duration);
    setLoading(true);
    setSelectedTimes([]); // Reset selected times when selecting a new date
    Showdate(date);
  };

  const Showdate = date => {
    showAvailability(moment(date).format('DD-MM-YYYY'), data?._id)
      .then(res => {
        setShowAvailability(res);
        processAvailabilityData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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

  const handleCardPress = () => {
    if (userId) {
      openModal();
    } else {
      navigation.navigate('Login');
    }
  };
  const openModal = () => {
    if (selectedTimes.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Time Required',
        text2: 'Please select a time',
      }); return;
    }
    if (!selectedLocation) {
      Toast.show({
        type: 'error',
        text1: 'Location Required',
        text2: 'Please select a location',
      }); return;
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const startRazorpayPayment = async () => {
  const userData = JSON.parse(user);
  const options = {
    description: 'Booking Payment',
    image: 'https://your-logo-url',
    currency: 'INR',
    key: RAZORPAY_KEY_ID,
    amount: data?.price * 100,
    name: 'Class Booking',
    prefill: {
      email: userData?.email,
      contact: userData?.phone,
      name: userData?.name,
    },
    theme: {
      color: Colors.primary,
    },
  };

  try {
    const paymentResponse = await RazorpayCheckout.open(options);
    
    if (paymentResponse.razorpay_payment_id) {
      const res = await PostBookingData();
      if (res?.status != 201) {
        Toast.show({
          type: 'error',
          text1: 'Booking Failed',
          text2: res.message || 'Failed to process booking',
        });
        return;
      }
      
      Toast.show({
        type: 'success',
        text1: 'Booking Confirmed!',
        text2: 'Your class has been successfully booked',
      });
      
      setOverviewModal(true);
    }
  } catch (error) {
    if (error.code === 1) {
      Toast.show({
        type: 'info',
        text1: 'Payment Cancelled',
        text2: 'Payment process was cancelled',
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Payment Failed',
        text2: 'Payment process failed. Please try again.',
      });
    }
    closeModal();
  }
};

  const PostBookingData = async () => {
    const bookings = [
      {
        class: data?._id,
        user: userId,
        time: selectedTimes[0],
        duration: durations,
        dates: [selectedDate],
        location: selectedLocation?.key,
        amount: data?.price,
        people: 1,
      },
    ];

    try {
      const res = await PaymentRequest(data?._id, '', userId, false, bookings);
      closeModal();
      return res;
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Booking Error',
        text2: 'Failed to process booking request',
      });
      throw error;
    }
  };

  const convertTo12HourFormat = time24 => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const adjustedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${adjustedHours}:${formattedMinutes} ${period}`;
  };

  const handleTimeSelect = (time, location) => {
    setSelectedTimes([time]); // Restrict to a single time selection
    setSelectedLocation(locations[0] || {});
    setLocations(locations);
  };

  return (
    <ScrollView style={styles.detailsContainer}>
      <BookingSuccessModal
        isVisible={overviewModal}
        onClose={() => setOverviewModal(false)}
      />
      <View style={styles.container}>
        <Calendar
          style={styles.calendar}
          markedDates={markedDates}
          markingType={'custom'}
          onDayPress={day => handleDateSelect(day?.dateString)}
          current={today}
          minDate={moment()?.format('YYYY-MM-DD')} // Start of the current month
          maxDate={moment()?.add(60, 'days').format('YYYY-MM-DD')} // End of the current month
          hideExtraDays={true} // Hides the extra days of previous/next months
          disableMonthChange={true} // Disables navigation to other months
          theme={{
            textDayFontFamily: fonts.regular,
            textMonthFontFamily: fonts.regular,
            textDayHeaderFontFamily: fonts.regular,
          }}
        />
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
              <Text style={{ color: 'black' }}>{e?.name}`</Text>
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
              <Text style={styles.dateText}>Selected Date: {selectedDate}</Text>
              <View style={styles.timeContainer}>
                {showAvailabilitys?.slots?.map((slot, index) => (
                  <Button
                    key={index}
                    mode={
                      selectedTimes?.includes(slot?.time)
                        ? 'contained'
                        : 'outlined'
                    }
                    onPress={() => handleTimeSelect(slot?.time, slot?.location)}
                    style={styles.timeButton}>
                    <Text
                      style={{
                        color: selectedTimes?.includes(slot?.time)
                          ? '#fff'
                          : 'black',
                        fontFamily: fonts.regular,
                      }}>
                      {convertTo12HourFormat(slot?.time)}
                    </Text>
                  </Button>
                ))}
              </View>

              <TouchableOpacity onPress={() => setMenuVisible(true)}>
                <Menu
                  visible={menuVisible}
                  onDismiss={() => setMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setMenuVisible(true)}
                      style={{
                        borderRadius: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                      {/* {SingleLocation} */} Select Location
                    </Button>
                  }>
                  {locations?.map(location => (
                    <Menu.Item
                      key={location?.key}
                      onPress={() => handleLocationSelect(location)}
                      title={
                        selectedLocation?.key === location?.key
                          ? `✓ ${location?.value}`
                          : location?.value
                      }
                    />
                  ))}
                </Menu>
              </TouchableOpacity>

              {selectedLocation && (
                <View style={styles.selectedLocation}>
                  <Chip onClose={() => setSelectedLocation(null)}>
                    <Text style={{ color: 'black', fontFamily: fonts.regular }}>
                      {selectedLocation?.value}
                    </Text>
                  </Chip>
                </View>
              )}
              <Text></Text>
              <Button
                mode="contained"
                onPress={() => {
                  if (userId) {
                    if (selectedTimes.length === 0) {
                      Toast.show({
                        type: 'error',
                        text1: 'Time Required',
                        text2: 'Please select a time',
                      });
                      return;
                    }
                    if (!selectedLocation) {
                      Toast.show({
                        type: 'error',
                        text1: 'Location Required',
                        text2: 'Please select a location',
                      });
                      return;
                    }
                    startRazorpayPayment();
                  } else {
                    navigation.navigate('Login');
                  }
                }}
                style={{ backgroundColor: Colors.primary }}>
                <Text style={{ color: '#fff', fontFamily: fonts.regular }}>
                  Book Classes
                </Text>
              </Button>
            </>
          )
        )}
      </View>

      <Portal>
        <Dialog visible={modalVisible} onDismiss={closeModal}>
          <Dialog.Title>Confirm Your Booking</Dialog.Title>
          <Dialog.Content>
            <Text>Selected Time: {selectedTimes[0]}</Text>
            <Text>Location: {selectedLocation?.value}</Text>
            <Text>Amount: ₹{data?.price}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={startRazorpayPayment}>Confirm Payment</Button>
            <Button onPress={closeModal}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  detailsContainer: {
    flex: 1,
  },
  container: {
    padding: 16,
  },
  calendar: {
    marginBottom: 20,
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
  dateText: {
    fontSize: 16,
    marginTop: 10,
    color: 'black',
  },
  selectedLocation: {
    marginTop: 10,
  },
  divider: {
    marginVertical: 10,
  },
});

export default WeeklyChart;
