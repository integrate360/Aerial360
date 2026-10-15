import React, { useContext, useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  Image,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Colors } from '../Config/Config';
import {
  Appbar,
  IconButton,
  Menu,
  ActivityIndicator,
  Button,
  Chip,
} from 'react-native-paper';
import Share from 'react-native-share';
import { PaymentGetwayOpne } from '../PaymentGetaway/PaymentCom';
import RazorpayCheckout from 'react-native-razorpay';
import fonts from '../FontFamily/FontFamily';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'; // Import FontAwesome5
import { RAZORPAY_KEY_ID } from '../Config/Config';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import { PaymentRequest, refreshAllData, showAvailability } from '../Api/Allapi';
import UserContext from '../../context/UserContext';
import BookingSuccessModal from '../Bookings/SucessfullModa';
import ClassBookingCalendarModal from './ClassBookingCalendarModal';
const { width } = Dimensions.get('window');
import Toast from 'react-native-toast-message';


const CalendarDetails = () => {
  const route = useRoute();
  const item = route?.params?.item;
  const categoryId = route?.params?.categoryId;
  const { userId, user } = useContext(UserContext);
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false); // State to control modal visibility
  const [markedDates, setMarkedDates] = useState({});
  const [locations, setLocations] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [durations, setDurations] = useState('');
  const today = moment()?.format('YYYY-MM-DD');
  const [loading, setLoading] = useState(false);
  const [showAvailabilitys, setShowAvailability] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [overviewModal, setOverviewModal] = useState(false);
  const [bookingModal, setBookingModal] = useState(false);

  useEffect(() => {
    if (item) {
      markCalendarDates(item?.availability);
    }
  }, [item]);
  const PostBookingData = async () => {
    const bookings = [
      {
        class: item?._id,
        user: userId,
        time: selectedTimes[0],
        duration: durations,
        dates: [selectedDate],
        location: selectedLocation?.key,
        amount: item?.price,
        people: 1,
      },
    ];
    // eslint-disable-next-line no-undef
    const res = PaymentRequest(item?._id, '', userId, false, bookings, amount);
    closeModal();
    return res;
  };
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
              backgroundColor: 'green',
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
  if (!item) {
    return (
      <View style={styles.container}>
        <Text>No data available</Text>
      </View>
    );
  }

  const convertTo12HourFormat = time24 => {
    if (!time24 || typeof time24 !== 'string') {
      // Handle the invalid time input here
      return 'Invalid time';
    }

    const [hours, minutes] = time24.split(':').map(Number);

    // Determine AM or PM
    const period = hours >= 12 ? 'PM' : 'AM';

    // Additional logic for 12-hour format conversion
    const adjustedHours = hours % 12 || 12;

    // Ensure minutes are always two digits
    const formattedMinutes = minutes.toString().padStart(2, '0');

    return `${adjustedHours}:${formattedMinutes} ${period}`;
  };
  const Shares = () => {
    const shareContent = {
      title: "Check this person's details",
      message: `Name: ${item?.name}\nDescription: ${item?.description?.length > 50
        ? item?.description.substring(0, 50) + '...'
        : item?.description
        }\nPrice: ₹${item?.price}\nCategory: ${item?.category?.title
        }\n\nDownload Now: https://play.google.com/store/apps/details?id=com.airboundapp`,
    };

    Share.open(shareContent)
      .then(res => {
        // Show success toast
        Toast.show({
          type: 'success',
          text1: 'Shared Successfully',
          text2: 'Class details have been shared',
        });
      })
      .catch(err => {
        // Only show error if it's not a user cancellation
        if (err.code !== 'E_ACTIVITY_CANCELLED') {
          Toast.show({
            type: 'error',
            text1: 'Share Failed',
            text2: 'Failed to share class details',
          });
        }
      });
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  const handleTimeSelect = (time, location) => {
    setSelectedTimes([time]); // Restrict to a single time selection
    setSelectedLocation(locations[0] || {});
    setLocations(locations);
  };
  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const startRazorpayPayment = () => {
    const userData = JSON.parse(user);
    const options = {
      description: 'Booking Payment',
      image: 'https://your-logo-url',
      currency: 'INR',
      key: RAZORPAY_KEY_ID,
      amount: item?.price * 100,
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

    RazorpayCheckout.open(options)
      .then(async paymentResponse => {
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

          // Show success toast
          Toast.show({
            type: 'success',
            text1: 'Booking Confirmed!',
            text2: 'Your class has been successfully booked',
          });

          // Refresh cached lists so availability/booked state updates immediately
          await refreshAllData();

          setOverviewModal(true);
        }
      })
      .catch(error => {
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
        // eslint-disable-next-line no-undef
        closeModal();
      });
  };
  // Initialize an array with gaps
  const days = new Array(7).fill(null);

  // Map through availability and assign the day values
  item?.availability?.forEach(res => {
    days[res?.day] = daysOfWeek[res?.day]; // Set the respective day (Su, Mo, etc.)
  });

  const availabilitys = item?.availability?.map(res => res);
  const trainers = availabilitys?.flatMap(res => res.trainers);
  const uniqueTrainers = Array.from(
    new Map(
      (availabilitys?.flatMap(res => res.trainers) || []).filter(Boolean).map(t => [t._id, t]),
    ).values(),
  );

  const locationss = availabilitys?.flatMap(res => res.locations);
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible); // Toggle modal visibility
  };
  const Showdate = date => {
    setLoading(true);
    showAvailability(moment(date).format('DD-MM-YYYY'), item?._id)
      .then(res => {
        setShowAvailability(res);
        processAvailabilityData(res);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        Toast.show({
          type: 'error',
          text1: 'Availability Error',
          text2: 'Failed to load available time slots',
        });
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
  const handleDateSelect = date => {
    setSelectedDate(date);

    // Get the day of the week for the selected date (0 for Sunday, 1 for Monday, etc.)
    const newDateDuration = new Date(date)?.getDay();

    // Filter the availability data based on the day
    const duration =
      item?.availability?.filter(res => newDateDuration === res?.day) || [];
    setDurations(duration?.duration);
    setLoading(true);
    setSelectedTimes([]); // Reset selected times when selecting a new date
    Showdate(date);
  };
  return (
    <>
      <Appbar.Header style={{ backgroundColor: Colors.secondary }}>
        <Appbar.BackAction
          size={25}
          color="#fff"
          onPress={() => navigation.goBack()}
        />
        <Appbar.Content
          title="Book"
          titleStyle={{
            color: '#fff',
            fontSize: 20,
            fontWeight: '600',
            fontFamily: fonts.regular,
          }}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <IconButton
            icon="share"
            onPress={() => Shares()}
            iconColor="#fff"
            size={25}
          />
        </View>
      </Appbar.Header>
      <BookingSuccessModal
        isVisible={overviewModal}
        onClose={() => setOverviewModal(false)}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.detailsContainer}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: '#fff',
              marginTop: 10,
            }}>
            <Image
              source={{ uri: item?.image[0] }}
              style={{ height: 140, width: 130 }}
            />
            <View
              style={{
                marginTop: 5,
                paddingBottom: 20,
                flex: 1,
              }}>
              <Text style={styles.headerText}>{item?.name}</Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  // justifyContent: 'center',
                  marginBottom: 3,
                }}>
                <FontAwesome5
                  name="map-marker-alt"
                  size={16}
                  color={Colors.secondary}
                  style={styles.icon}
                />
                {/* {locationss?.length > 0 && (
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                    }}>
                    {[
                      ...new Set(
                        locationss?.map(e => e?.name)?.filter(Boolean),
                      ),
                    ].map((name, index) => (
                      <Text
                        key={index}
                        style={{
                          color: 'black',
                          // padding: 5,
                          // borderRadius: 5,
                          // backgroundColor: Colors.primary,
                          margin: 3,
                        }}>
                        {name},
                      </Text>
                    ))}
                  </View>
                )} */}
                {locationss?.length > 0 && (
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                    }}>
                    <Text style={{ color: 'black', margin: 3 }}>
                      {[
                        ...new Set(
                          locationss.map(e => e?.name).filter(Boolean),
                        ),
                      ].join(', ')}
                    </Text>
                  </View>
                )}
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  gap: 5,
                  marginTop: 5,
                  flexWrap: 'wrap',
                }}>
                {days?.map((e, index) => {
                  if (e == null) return null;
                  return (
                    <View
                      key={index}
                      style={{
                        width: 35,
                        height: 35,
                        borderRadius: 17.5, // Half of width/height to make it circular
                        borderWidth: 1,
                        borderColor: 'black',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'white',
                      }}>
                      <Text
                        style={{
                          color: 'black',
                          textAlign: 'center',
                          fontSize: 10,
                          fontFamily: fonts.regular,
                        }}>
                        {e}
                      </Text>
                    </View>
                  );
                })}
              </View>

            </View>
          </View>

          <View style={styles.sectionDivider}></View>
          <View style={{ backgroundColor: '#fff' }}>
            <View
              style={{
                marginHorizontal: 20,
                paddingBottom: 10,
              }}>
              <Text style={styles.detailsHeader}>Description</Text>
              <Text style={styles.detailsText}>{item?.description}</Text>
            </View>
            {uniqueTrainers && uniqueTrainers.length > 0 && (
              <View style={styles.staffSection}>
                <Text
                  style={styles.staffLabel}
                  onPress={toggleModal} // Open modal on press
                >
                  Trainer
                </Text>
                {/* <View
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                  }}>
                  {trainers?.map(e => {
                    return (
                      <>
                        <Image
                          source={{uri: e?.image}}
                          style={styles.profileImage}
                        />
                        <Text style={styles.staffName}>{e?.name}</Text>
                        <Text
                          style={{
                            color: '#777',
                            fontFamily: fonts.regular,
                          }}>
                          {e?.description}
                        </Text>
                      </>
                    );
                  })}
                </View> */}
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap', // optional
                    // justifyContent: 'center',
                    width: '100%',
                  }}>
                  {Array.from(new Set(trainers?.map(t => t?._id)))
                    .map(id => trainers.find(t => t._id === id))
                    .map((e, index, array) => (
                      <View
                        key={`trainer-${e?._id || index}`}
                        style={{
                          marginRight: index !== array.length - 1 ? 10 : 0,
                          alignItems: 'center', // centers the content inside
                        }}>
                        <Image
                          source={{ uri: e?.image }}
                          style={styles.profileImage}
                        />
                        <Text style={styles.staffName}>{e?.name}</Text>
                      </View>
                    ))}
                </View>
              </View>
            )}
          </View>
        </View>
        <ClassBookingCalendarModal
          modal={bookingModal}
          closeModal={() => setBookingModal(false)}
          item={item}
        />
      </ScrollView>
      <View style={styles.buttonsContainer}>
        <Button
          mode="contained"
          onPress={() =>
            // setBookingModal(true)
            // PostBookingData()
            navigation.navigate('Packages', { item: item?._id, class: item })
          }
          labelStyle={{
            fontSize: 16, // Explicit size
            flexShrink: 1, // Allow text to shrink if needed
          }}
          style={[styles.button, { width: width * 0.88 }]}
          textColor="black">
          <Text style={{ color: '#fff', fontFamily: fonts.regular }}>
            Book Class
          </Text>
        </Button>
      </View>
      {/* <Button
          mode="contained"
          onPress={() =>
            navigation.navigate('CalendarScreen', {item: item, Arrows: true})
          }
          style={[styles.button, {width: width * 0.44}]}
          buttonColor={Colors.secondary}>
          <Text style={{color: '#fff', fontFamily: fonts.regular}}>
            Book Now
          </Text>
        </Button> */}

      <Modal
        transparent={true}
        animationType="fade"
        visible={isModalVisible}
        onRequestClose={toggleModal}>
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
            {/* Close Button */}
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
                All Trainers
              </Text>
              <IconButton
                icon="close"
                size={20}
                onPress={toggleModal}
                iconColor="#777"
              />
            </View>

            {/* Trainer Details */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {uniqueTrainers.map((trainer, index) => (
                <View
                  key={trainer._id || index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    marginBottom: 15,
                  }}>
                  <Image
                    source={{ uri: trainer?.image }}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 50,
                      marginRight: 10,
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: '#000',
                        fontSize: 16,
                        fontFamily: fonts.regular,
                      }}>
                      {trainer?.name}
                    </Text>
                    <Text style={{ color: '#777', fontFamily: fonts.regular }}>
                      {trainer?.description}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  calendar: {
    marginBottom: 20,
  },
  detailsContainer: {},
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 10,
    color: 'black',
    // alignSelf: 'center',
    fontFamily: fonts.regular,
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
  selectedLocation: {
    marginTop: 10,
  },
  roomText: {
    alignSelf: 'center',
    color: '#777',
    marginTop: 5,
    fontFamily: fonts.regular,
  },
  availabilityText: {
    alignSelf: 'center',
    color: 'green',
    marginTop: 5,
    fontFamily: fonts.regular,
  },
  sectionDivider: {
    paddingVertical: 4,
    backgroundColor: '#f2f2f2',
  },
  staffSection: {
    padding: 10,
    flexDirection: 'row',
    marginTop: 10,
  },
  staffLabel: {
    position: 'absolute',
    marginLeft: 20,
    color: '#777',
    textDecorationLine: 'underline',
    fontFamily: fonts.regular,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginVertical: 15,
  },
  staffName: {
    fontSize: 16,
    marginTop: 20,
    // marginLeft: 10,
    color: 'black',
    fontWeight: '600',
    fontFamily: fonts.regular,
  },
  detailsHeader: {
    color: '#777',
    marginBottom: 5,
    fontWeight: '600',
    fontFamily: fonts.regular,
    marginTop: 10,
  },
  detailsText: {
    fontSize: 14,
    color: 'black',
    textAlign: 'justify',
    fontFamily: fonts.regular,
  },
  prerequisitesContainer: {
    flex: 1,
    marginTop: 10,
    paddingBottom: 20,
  },
  prerequisitesHeader: {
    color: 'black',
    fontSize: 18,
    marginBottom: 30,
  },
  prerequisiteItem: {
    color: 'black',
    fontSize: 16,
  },
  buttonsContainer: {
    left: 0,
    right: 0,
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 22,
  },
  button: {
    paddingVertical: 7,
    borderRadius: 10,
    marginHorizontal: 3,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  trainerItem: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  trainerImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 10,
  },
  trainerInfo: {
    flex: 1,
  },
  trainerName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  trainerDescription: {
    color: '#777',
  },
  closeButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'red',
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 20,
  },
});

export default CalendarDetails;
