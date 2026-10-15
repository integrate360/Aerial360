import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import {
  Button,
  Menu,
  Chip,
  Divider,
  ActivityIndicator,
  Icon,
  Checkbox,
} from 'react-native-paper';
import moment from 'moment';
import { PackagePayment, showAvailability } from '../Api/Allapi';
import { Colors } from '../Config/Config';
import RazorpayCheckout from 'react-native-razorpay';
import { RAZORPAY_KEY_ID } from '../Config/Config';
import UserContext from '../../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import BookingSuccessModal from './SucessfullModa';
import TermsAndConditions from './TermsAndConditions';
import { BaseUrl } from "../Api/BaseUrl";
import axios from 'axios';
import Toast from 'react-native-toast-message';


const BookingPackageCalender = ({
  packageId,
  data,
  days,
  prices,
  packageDuration,
  index,
}) => {
  const [markedDates, setMarkedDates] = useState({});
  const [selectedClassIndex, setSelectedClassIndex] = useState(index);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showAvailabilitys, setShowAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [storedata, setStoreData] = useState([]);
  const [classid, setClassId] = useState('');
  const { userId, email, user } = useContext(UserContext);
  const navigation = useNavigation();
  const TotalClasses = data?.length;
  const [SingleLocation, setSingleLocation] = useState([]);
  const [overviewModal, setOverviewModal] = useState(false);
  const [cLoading, setCLoading] = useState(false);
  const [TNCModal, setTNCModal] = useState(false);
  const [isTnc, setIsTnc] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  console.log('====================================');
  console.log("META", data, "META");
  console.log('====================================');
  useEffect(() => {
    if (!data && data?.length <= 0) return;
    markCalendarDates(data[0]?.availability, data[0]?.name, storedata);
  }, [data]);
  useEffect(() => {
    if (!data && data?.length <= 0) return;
    setCLoading(true);
    setTimeout(() => {
      setCLoading(false);
    }, 1000);
  }, [data, selectedClassIndex]);

  // Fixed Razorpay payment flow - same as other components
  const startRazorpayPayment = async () => {
    if (!storedata || storedata.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please add at least one booking before payment',
      }); return;
    }

    if (!userId) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: 'User not authenticated',
      }); return;
    }

    try {
      setProcessingPayment(true);

      // calculate total amount
      const totalAmount = prices;

      // Prepare payload expected by your backend: packageId, user, amount, bookings
      const payload = {
        packageId: packageId,
        user: userId,
        amount: totalAmount,
        bookings: storedata.map((b) => ({
          classId: b.classId,
          date: b.date,
          time: b.time,
          location: b.location,
          classDuration: b.duration,
          className: b.className,
          amount: b.amount,
        })),
      };

      // 1) Call backend to create Razorpay order and pending records
      const createRes = await axios.post(`${BaseUrl}create-package-order`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (!createRes?.data?.orderId) {
        throw new Error("Failed to create order on server");
      }

      const orderId = createRes.data.orderId;
      const orderAmount = createRes.data.amount || Math.round(totalAmount * 100); // paise

      // 2) Open Razorpay checkout
      const options = {
        description: `Payment for package ${packageId}`,
        image: "", // optional
        currency: "INR",
        key: RAZORPAY_KEY_ID,
        amount: orderAmount, // amount in paise
        order_id: orderId,
        name: data[selectedClassIndex]?.name || "Package Booking",
        prefill: {
          email: user?.email || "",
          contact: user?.phone || "",
          name: user?.name || "",
        },
        theme: { color: Colors.primary || "#528FF0" },
      };

      RazorpayCheckout.open(options)
        .then(async (paymentResult) => {
          // paymentResult will contain razorpay_payment_id, razorpay_order_id, razorpay_signature
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = paymentResult;

          // 3) Verify payment at backend
          try {
            const verifyRes = await axios.post(`${BaseUrl}verify-package-payment`, {
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
            }, {
              headers: { "Content-Type": "application/json" },
            });

            if (verifyRes.data && verifyRes.data.success) {
              Toast.show({
                type: 'success',
                text1: 'Payment Successful',
                text2: 'Your payment has been processed successfully',
              });
              // Show success modal
              setOverviewModal(true);
              setProcessingPayment(false);

              // Clear stored data after successful payment
              setStoreData([]);

              // Close TNC modal
              setTNCModal(false);
            } else {
              Toast.show({
                type: 'error',
                text1: 'Payment Failed',
                text2: 'Payment verification failed on server',
              }); setProcessingPayment(false);
            }
          } catch (verifyErr) {
            console.error("verify error", verifyErr?.response?.data || verifyErr.message);
            Toast.show({
              type: 'error',
              text1: 'Verification Error',
              text2: 'Payment verification error',
            }); setProcessingPayment(false);
          }
        })
        .catch((err) => {
          console.error("razorpay checkout error", err);
          if (err.code !== 1) { // Don't show toast for user cancellation
            Toast.show({
              type: 'info',
              text1: 'Payment Cancelled',
              text2: 'Payment process was cancelled',
            });
          }
          setProcessingPayment(false);
        });
    } catch (err) {
      console.error("startRazorpayPayment error:", err?.response?.data || err.message);
      Toast.show({
        type: 'error',
        text1: 'Payment Error',
        text2: 'Failed to start payment process',
      }); setProcessingPayment(false);
    }
  };

  const markCalendarDates = (availability, name, datass) => {
    const availabilityData = {};
    const currentDate = moment().startOf('day');
    const validityTill = moment().add(packageDuration, 'days');

    // Create a Set of valid days for O(1) lookup
    const validDays = new Set(availability?.map(item => item?.day));
    while (currentDate.isSameOrBefore(validityTill)) {
      const dateString = currentDate.format('YYYY-MM-DD');
      const selectedClass = name || 'No Class';

      if (validDays.has(currentDate.day())) {
        if (
          datass?.some(
            entry =>
              entry.date === moment(currentDate).format('YYYY-MM-DD') &&
              entry.className === selectedClass,
          )
        ) {
          availabilityData[dateString] = {
            customStyles: {
              container: {
                backgroundColor: 'orangered',
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
                backgroundColor: Colors?.primary,
              },
              text: {
                color: 'white',
              },
            },
          };
        }
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

  const updateDisabledDates = () => {
    const disabledDates = {};

    storedata.forEach(entry => {
      // Check if the date and className match any entry in storedata
      const matchClassDate = storedata.some(
        item => item.date === entry.date && item.className === entry.className,
      );

      // Only disable the d
      // ate if both date and className match
      if (matchClassDate) {
        // disabledDates[entry.date] = {
        //   disabled: true,
        //   disableTouchEvent: true,
        //   marked: true,
        //   dotColor: 'red',
        // };
      }
    });

    setMarkedDates(prev => ({
      ...prev,
      ...disabledDates,
    }));
  };

  const selectedDates = date => {
    if (storedata.length === days) {
      Toast.show({
        type: 'info',
        text1: 'Availability Limit',
        text2: `Only ${days} sessions available.`,
      });
    } else {
      handleDateSelect(date);
    }
  };

  const handleDateSelect = date => {
    const selectedClass = data[selectedClassIndex]?.name || 'No Class';

    if (
      storedata.some(
        entry => entry.date === date && entry.className === selectedClass,
      )
    ) {
      Toast.show({
        type: 'info',
        text1: 'Date Already Selected',
        text2: 'This date is already selected for the same class!',
      }); return;
    }

    setSelectedDate(date);
    Showdate(date, data[selectedClassIndex]?._id);
    setClassId(data[selectedClassIndex]?._id);
  };

  const Showdate = (date, classId) => {
    setLoading(true);
    showAvailability(moment(date)?.format('DD-MM-YYYY'), classId)
      .then(res => {
        processAvailabilityData(res);
        setShowAvailability(res);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        // MOVE THE TOAST INSIDE THE CATCH BLOCK:
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load availability',
        });
      });
  };

  const processAvailabilityData = availability => {
    if (availability && availability?.slots) {
      const availableSlots = availability?.slots?.map(slot => ({
        time: slot?.time,
        locations: slot?.locations?.map(location => ({
          ...location,
          key: location?._id,
          value: location?.name,
        })),
      }));

      if (availableSlots.length > 0) {
        const firstSlot = availableSlots[0];
        setSelectedTime(firstSlot?.time);
        setSelectedLocation(firstSlot?.locations[0]);
        setLocations(firstSlot?.locations);
        setSingleLocation(firstSlot?.locations[0]?.name);
      } else {
        Toast.show({
          type: 'info',
          text1: 'No Slots Available',
          text2: 'No time slots available for selected date',
        });
      }
    }
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
    setSelectedTime(time);
  };

  const handleLocationSelect = location => {
    setSelectedLocation(location);
    setMenuVisible(false);
  };

  const handleContinue = () => {
    if (selectedDate && selectedTime && selectedLocation) {
      const selectedClass = data[selectedClassIndex]?.name || 'No Class';
      console.log('====================================');
      console.log("Frontend ka : ", selectedClass);
      console.log('====================================');
      const newEntry = {
        classId: classid,
        className: data[selectedClassIndex]?.name,
        user: userId,
        //  className: selectedClass,
        dates: selectedDate,
        date: selectedDate,
        duration: 6,
        time: selectedTime,
        location: selectedLocation,
        amount: prices,
        people: 1,
      };

      if (
        storedata.some(
          entry =>
            entry.date === selectedDate && entry.className === selectedClass,
        )

      ) {
        Toast.show({
          type: 'info',
          text1: 'Duplicate Selection',
          text2: 'This date is already selected for the same class!',
        }); return;
      }
      const nextIndex = selectedClassIndex % data?.length;
      setStoreData(prev => [...prev, newEntry]);
      Toast.show({
        type: 'success',
        text1: 'Added to List',
        text2: 'Class has been added to your booking list',
      });
      markCalendarDates(data[nextIndex]?.availability, data[nextIndex]?.name, [
        ...storedata,
        newEntry,
      ]);

      updateDisabledDates();

      setSelectedDate(null);
      setSelectedTime(null);
      setSelectedLocation(null);
    }
    else {
      Toast.show({
        type: 'error',
        text1: 'Incomplete Selection',
        text2: 'Please select date, time and location',
      });
    }
  };
  const paymentdata = () => {
    if (storedata.length === days || selectedClassIndex + 1 == TotalClasses) {
      setTNCModal(true);
    } else {
      handleContinues();
    }
  };
  const handlePrivious = () => {
    if (selectedClassIndex <= 0) return;
    if (!data || data.length === 0) return;

    const nextIndex = (selectedClassIndex - 1) % data?.length;
    setSelectedClassIndex(nextIndex);
    markCalendarDates(
      data[nextIndex]?.availability,
      data[nextIndex]?.name,
      storedata,
    );

    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedLocation(null);
    setShowAvailability(null);
  };
  const handleContinues = () => {
    if (!data || data.length === 0) return;

    const nextIndex = (selectedClassIndex + 1) % data?.length;
    setSelectedClassIndex(nextIndex);
    markCalendarDates(
      data[nextIndex]?.availability,
      data[nextIndex]?.name,
      storedata,
    );

    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedLocation(null);
    setShowAvailability(null);
  };

  const convertTo12HourFormat = time => {
    const [hour, minute] = time.split(':');
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute} ${period}`;
  };

  return (
    <>
      {cLoading ? (
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: Colors?.primary,
            justifyContent: 'center',
            alignContent: 'center',
          }}>
          <Text style={{ color: 'white', fontSize: 40, textAlign: 'center' }}>
            {data[selectedClassIndex]?.name}
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.detailsContainer}
            contentContainerStyle={{ paddingBottom: 100 }}>
            <BookingSuccessModal
              isVisible={overviewModal}
              onClose={() => setOverviewModal(false)}
            />
            <TermsAndConditions
              modal={TNCModal}
              setModal={() => setTNCModal(false)}
              funcitonCall={() => startRazorpayPayment()}
            />
            <View style={styles.container}>
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.classText}>
                  {data[selectedClassIndex]?.name || 'No Class Available'}
                </Text>
                <Text style={{ ...styles.classText, fontSize: 18 }}>
                  Package: {selectedClassIndex + 1}/
                  {TotalClasses || 'No Class Available'}
                </Text>
              </View>
              <Calendar
                style={styles.calendar}
                markedDates={markedDates}
                // markingType={'simple'}
                minDate={moment()?.format('YYYY-MM-DD')}
                markingType={'custom'}
                maxDate={moment()
                  ?.add(packageDuration, 'days')
                  .format('YYYY-MM-DD')}
                hideExtraDays={true}
                onDayPress={day => selectedDates(day?.dateString)}
              />
              <View style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
                {[
                  { name: 'Available', color: Colors?.primary },
                  { name: 'Selected', color: 'orangered' },
                  { name: 'Not Available', color: 'lightgray' },
                ]?.map(e => (
                  <View style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
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
                      {showAvailabilitys?.slots?.map((slot, index) => (
                        <Button
                          key={index}
                          mode={
                            selectedTime === slot?.time
                              ? 'contained'
                              : 'outlined'
                          }
                          onPress={() =>
                            handleTimeSelect(slot?.time, slot?.locations)
                          }
                          style={styles.timeButton}>
                          {convertTo12HourFormat(slot?.time)}
                        </Button>
                      ))}
                    </View>

                    <Button
                      mode="outlined"
                      onPress={() => setMenuVisible(true)} // Move onPress here
                    >
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
                              //   alignItems:'center',
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
                    <Text></Text>
                    <Button
                      mode="contained"
                      onPress={handleContinue}
                      style={{
                        backgroundColor: Colors.primary,
                        width: '40%',
                        alignSelf: 'center',
                        borderRadius: 10,
                      }}>
                      Add to List
                    </Button>
                  </>
                )
              )}

              <View style={{ padding: 20 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginBottom: 10,
                    color: 'black',
                  }}>
                  {storedata?.length + '/' + days + ' Selected'}
                </Text>
                {storedata?.map((entry, index) => (
                  <View
                    key={index}
                    style={{
                      marginBottom: 15,
                      padding: 10,
                      backgroundColor: '#f9f9f9',
                      borderRadius: 5,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <View>
                      <View
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '100%',
                        }}>
                        <Text style={styles?.selectedTitle}>
                          {entry?.className}
                        </Text>
                        <Text style={styles?.selectedDate}>
                          {moment(entry?.date).format('MMM DD-dd YYYY')}
                        </Text>
                      </View>
                      <View
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '100%',
                        }}>
                        <Text style={styles?.selectedLocation}>
                          {entry?.location?.name}
                        </Text>
                        <Text style={styles?.selectedTime}>{entry?.time}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
          <View
            style={{
              position: 'absolute',
              bottom: 10,
              paddingHorizontal: 10,
              backgroundColor: 'white',
              padding: 10,
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'space-between',
            }}>
            {selectedClassIndex > 0 ? (
              <Button
                mode="outline"
                onPress={handlePrivious}
                style={{
                  borderRadius: 10,
                  paddingVertical: 3,
                  color: Colors.primary,
                  borderWidth: 1,
                  borderColor: Colors?.primary,
                }}>
                Previous Class
              </Button>
            ) : (
              <View></View>
            )}
            <Button
              mode="contained"
              onPress={paymentdata}
              disabled={processingPayment}
              style={{
                borderRadius: 10,
                paddingVertical: 3,
                backgroundColor: Colors.primary,
              }}>
              {processingPayment
                ? 'Processing...'
                : storedata.length === days || selectedClassIndex + 1 == TotalClasses
                  ? 'Proceed To Pay'
                  : 'Next Class'}
            </Button>
          </View>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  calendar: {
    marginVertical: 20,
  },
  loader: {
    marginVertical: 10,
  },
  classText: {
    fontSize: 30,
    marginBottom: 10,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 10,
  },
  dateText: {
    color: 'black',
    marginTop: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  timeButton: {
    margin: 5,
    borderRadius: 5,
    width: '30%',
  },
  selectedLocation: {
    color: 'black',
    fontSize: 15,
    marginTop: 10,
  },
  selectedDate: {
    color: 'black',
    marginTop: 10,
    fontSize: 15,
    fontWeight: 'bold',
  },
  selectedTime: {
    color: 'black',
    fontSize: 15,
  },
  selectedTitle: {
    color: 'black',
    fontSize: 20,
  },
  divider: {
    marginVertical: 10,
  },
  selectedClassInfo: {
    marginTop: 10,
  },
  listHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  listItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
});

export default BookingPackageCalender;