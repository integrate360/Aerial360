import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../Config/Config';
import BookingPackageModal from '../Bookings/BookingPackageModal';
import moment from 'moment';
import { refreshAllData } from '../Api/Allapi';
import BookingSuccessModal from '../Bookings/SucessfullModa';
import RazorpayCheckout from 'react-native-razorpay';
import { RAZORPAY_KEY_ID } from '../Config/Config';
import TermsAndConditions from '../Bookings/TermsAndConditions';
import UserContext from '../../context/UserContext';
import { BaseUrl } from "../Api/BaseUrl";
import axios from 'axios';
import Toast from 'react-native-toast-message';

const PackageDetailsScreen2 = () => {
  const [expandedServices, setExpandedServices] = useState({});
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [view, setView] = useState([]);
  const [sClass, setSClas] = useState();
  const [index, setIndex] = useState(0);
  const navigation = useNavigation();
  const [overviewModal, setOverviewModal] = useState(false);
  const [TNCModal, setTNCModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const routes = useRoute();
  const { userId, user } = useContext(UserContext);
  const item = routes?.params?.item;
  const days = item?.days;
  const prices = item?.price;


  // console.log('=============Hello Parth=======================');
  // console.log(item?.services);
  // console.log('===============Bye Parth=====================');

  const calculateSavings = () => {
    if (!item) return 0;
    const originalPrice = item?.offerPrice;
    const discountedPrice = item?.price;
    return Math.round(
      ((originalPrice - discountedPrice) / originalPrice) * 100,
    );
  };

  const toggleService = serviceId => {
    setExpandedServices(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId],
    }));
  };

  const Header = () => (
    <SafeAreaView style={{ backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (isModalVisible) return setModalVisible(false);
            navigation.goBack();
          }}>
          <Icon name="chevron-left" size={24} color="#000" />
          <Text style={styles.headerTitle}>Packages</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const openModal = () => setModalVisible(true);

  const handleSaveData = list => {
    // Filter out items that are already in selectedClasses
    const uniqueItems = list.filter(newItem => {
      return !selectedClasses.some(
        existingItem =>
          // Compare all relevant properties
          newItem.classId === existingItem.classId &&
          newItem.date === existingItem.date &&
          newItem.time === existingItem.time &&
          newItem.location._id === existingItem.location._id,
      );
    });

    // Only update state if there are unique items to add
    if (uniqueItems.length > 0) {
      setSelectedClasses(prev => [...prev, ...uniqueItems]);
    }
  };

  // Fixed Razorpay payment flow - same as BookingPackageModal

  const startRazorpayPayment = async () => {
    if (!selectedClasses || selectedClasses.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No Bookings',
        text2: 'Please add at least one booking before payment',
      });
      return;
    }

    if (!userId) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: 'User not authenticated',
      });
      return;
    }

    // Validate that none of the selected classes are within 3 hours of start time
    const tooSoonClass = selectedClasses.find(
      b => !isTimeAtLeast3HoursLater(b.date, b.time)
    );
    if (tooSoonClass) {
      Alert.alert(
        'Booking Not Allowed',
        `"${tooSoonClass.className}" on ${moment(tooSoonClass.date).format('DD MMM')} at ${convertTo12HourFormat(tooSoonClass.time)} is less than 3 hours away. Please remove it before proceeding.`
      );
      return;
    }

    try {
      setProcessingPayment(true);

      // calculate total amount (if your pricing is per session)
      const totalAmount = prices;

      // Prepare payload expected by your backend: packageId, user, amount, bookings
      const payload = {
        packageId: item?._id,
        user: userId,
        amount: totalAmount,
        bookings: selectedClasses.map((b) => ({
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
        description: `Payment for package ${item?._id}`,
        image: "", // optional
        currency: "INR",
        key: RAZORPAY_KEY_ID,
        amount: orderAmount, // amount in paise
        order_id: orderId,
        name: item?.name || "Package Booking",
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

              // Refresh cached lists so package state/slots update immediately
              await refreshAllData();

              // Show package confirmation modal (redirect handled from modal button)
              setOverviewModal(true);

              // Clear selected classes after successful payment
              setSelectedClasses([]);

              // Close any open modals
              setTNCModal(false);

              setProcessingPayment(false);
            } else {
              Toast.show({
                type: 'error',
                text1: 'Payment Failed',
                text2: 'Payment verification failed on server',
              });
              setProcessingPayment(false);
            }
          } catch (verifyErr) {
            console.error("verify error", verifyErr?.response?.data || verifyErr.message);
            Toast.show({
              type: 'error',
              text1: 'Verification Error',
              text2: 'Payment verification error',
            });
            setProcessingPayment(false);
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
        text2: err?.response?.data?.message || 'Failed to start payment process',
      });
      setProcessingPayment(false);
    }
  };

  const convertTo12HourFormat = time24 => {
    if (!time24) return '';
    const [hour, minute] = time24.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  // Returns true if the class start time is at least 3 hours from now
  const isTimeAtLeast3HoursLater = (date, time) => {
    if (!date || !time) return false;
    const now = moment();
    const selectedDateTime = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
    // Future date (not today) → always allowed
    if (selectedDateTime.isAfter(now, 'day')) return true;
    // Same day → must be at least 3 hours away
    return selectedDateTime.diff(now, 'hours', true) >= 3;
  };

  const removeHandler = si => {
    const filter = selectedClasses?.filter((e, i) => e?.index !== si);
    setSelectedClasses(filter);
  };

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.content}>
          <Text>No package data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <BookingPackageModal
            packageId={item?._id}
            packageDuration={item?.duration}
            data={sClass}
            days={days - selectedClasses?.length}
            totalDays={days}
            prices={prices}
            index={index}
            close={() => setModalVisible(false)}
            saveData={handleSaveData}
            selectedClasses={selectedClasses}
          />
        </View>
      </Modal>
      <BookingSuccessModal
        isVisible={overviewModal}
        onClose={() => setOverviewModal(false)}
        isPackage={true}
      />
      <TermsAndConditions
        modal={TNCModal}
        setModal={() => setTNCModal(false)}
        funcitonCall={() => startRazorpayPayment()}
      />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>{item.name}</Text>

        <View style={styles.priceContainer}>
          <View style={styles.saveTag}>
            <Text style={styles.saveText}>Save {calculateSavings()}%</Text>
          </View>
          <Text style={styles.price}>INR {item?.price?.toLocaleString()}</Text>
        </View>

        <Text style={styles.subtitle}>
          You can select any classes from below please click continue to make
          your appointment.
        </Text>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Icon name="clock-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              Expires after {item?.duration} days
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="map-marker-outline" size={20} color="#666" />
            <Text style={styles.infoText}>Multiple Locations</Text>
          </View>
        </View>

        <Text style={styles.description}>{item?.description}</Text>

        <View style={styles.warningBox}>
          <Icon
            name="alert-circle-outline"
            size={20}
            color="#b36b00"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.warningText}>
            Heads up! Make sure to choose your classes and time slots wisely to
            get the best out of your package.
          </Text>
        </View>

        <Text style={styles.selectionTitle}>Select Classes</Text>
        {item?.services?.map((service, i) => {
          const filter = selectedClasses?.filter(
            e => e?.className == service?.name,
          );
          const includes = view?.includes(i);
          return (
            <TouchableOpacity
              key={service._id}
              activeOpacity={0.8}
              style={styles.optionButton}
              onPress={() => {
                setModalVisible(true);
                setSClas(service);
                setIndex(i);
              }}>
              <View style={styles.optionContent}>
                {(!filter || filter.length === 0) && (
                  <View style={styles.arrowContainer}>
                    <View style={styles.arrowCircle}>
                      <Text style={styles.arrowText}>→</Text>
                    </View>
                  </View>
                )}
                <View
                  style={[
                    styles.numberCircle,
                    {
                      backgroundColor:
                        filter?.length > 0 ? Colors.primary : 'transparent',
                      borderColor: Colors.primary,
                      borderWidth: 2,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.numberText,
                      {
                        color: filter?.length > 0 ? '#fff' : Colors.primary,
                      },
                    ]}>
                    {filter?.length > 0 ? filter.length : 0}
                  </Text>
                </View>

                <Image
                  source={{ uri: service?.image[0] ?? '' }}
                  style={styles.optionImage}
                />
                <View style={styles.serviceDetails}>
                  <View style={styles.rowBetween}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 10,
                      }}>
                      <Text
                        style={[
                          styles.optionText,
                          { flex: 1, flexShrink: 1, marginRight: 10 },
                        ]}
                        numberOfLines={2}>
                        {service.name}
                      </Text>
                      {filter?.length > 0 && (
                        <Text
                          style={{
                            color: Colors.primary,
                            paddingVertical: 5,
                            paddingHorizontal: 10,
                            backgroundColor: '#C5BEFF',
                            borderRadius: 50,
                            fontWeight: '700',
                            flexShrink: 0,
                          }}>
                          {filter.length} Slots
                        </Text>
                      )}
                    </View>

                    <View style={styles.expandedContent}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.servicePrice}>
                          Price: INR {service?.price}
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            if (includes) {
                              setView(prev => prev.filter(item => item !== i));
                            } else {
                              setView(prev => [...prev, i]);
                            }
                          }}
                          style={{
                            paddingVertical: 5,
                            paddingLeft: 60,
                            paddingRight: 10,
                          }}>
                          {filter?.length > 0 && (
                            <Text
                              style={{
                                ...styles.serviceDescription,
                                textDecorationLine: 'underline',
                              }}>
                              {includes ? 'Hide' : 'View'}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              {view?.includes(i) &&
                filter?.map((entry, listIndex) => (
                  <View
                    key={`${entry.className}-${entry.date}-${listIndex}`}
                    style={{
                      marginBottom: 15,
                      padding: 10,
                      backgroundColor: '#f9f9f9',
                      borderRadius: 5,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      position: 'relative',
                    }}>
                    <TouchableOpacity
                      style={{
                        backgroundColor: 'red',
                        padding: 5,
                        borderRadius: 50,
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignContent: 'center',
                        paddingHorizontal: 8,
                        position: 'absolute',
                        color: 'white',
                        backgroundColor: 'orangered',
                        top: -8,
                        right: -8,
                        opacity: 0.8,
                      }}
                      onPress={() => removeHandler(entry?.index)}>
                      <Text
                        style={{ color: 'white', fontSize: 15, marginTop: -5 }}>
                        x
                      </Text>
                    </TouchableOpacity>
                    <View>
                      {/* Title + Date */}
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          width: '100%',
                          marginBottom: 5,
                          gap: 10,
                        }}>
                        <Text
                          style={[
                            styles?.selectedTitle,
                            { flex: 1, flexWrap: 'wrap' },
                          ]}
                          numberOfLines={2}>
                          {entry?.className}
                        </Text>
                        <Text
                          style={[
                            styles?.selectedDate,
                            { flexShrink: 0, maxWidth: 120 },
                          ]}
                          numberOfLines={1}>
                          📅 {moment(entry?.date).format('MMM DD, YYYY')}
                        </Text>
                      </View>

                      {/* Location + Time */}
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '100%',
                          gap: 10,
                        }}>
                        <Text
                          style={[
                            styles?.selectedLocation,
                            { flex: 1, flexWrap: 'wrap' },
                          ]}
                          numberOfLines={1}>
                          📍 {entry?.location?.name}
                        </Text>
                        <Text
                          style={[
                            styles?.selectedTime,
                            { flexShrink: 0, maxWidth: 100 },
                          ]}
                          numberOfLines={1}>
                          ⏰ {convertTo12HourFormat(entry?.time)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              backgroundColor:
                selectedClasses.length === 0 ? 'gray' : Colors.primary,
            },
          ]}
          disabled={processingPayment}
          onPress={() => {
            if (selectedClasses.length === 0) {
              Toast.show({
                type: 'error', // or 'info' if you prefer
                text1: 'Hold on!',
                text2: 'Please select at least one class and slot before continuing 👇',
              });
            } else {
              setTNCModal(true);
            }
          }}>
          <Text
            style={[
              styles.continueButtonText,
              {
                color: selectedClasses.length === 0 ? 'darkgray' : '#fff',
              },
            ]}>
            {processingPayment
              ? 'Processing Payment...'
              : selectedClasses.length === 0
                ? 'Confirm Your Booking'
                : `Confirm Your Booking ${selectedClasses.length}/${days} slots`}
          </Text>
        </TouchableOpacity>

        <Text style={{ color: 'black', textAlign: 'center', marginTop: -10 }}>
          You can book remaining afterwards
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

// ... keep your existing styles exactly the same ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  numberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  arrowContainer: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -15 }],
    zIndex: 1,
  },

  arrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  arrowText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 22,
  },

  numberText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  header: {
    padding: 16,
    // marginTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 8,
    color: '#555',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#777',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  saveTag: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  saveText: {
    color: '#4caf50',
    fontWeight: '500',
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors?.primary,
  },
  subtitle: {
    color: '#666',
    marginBottom: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    color: '#666',
    marginLeft: 4,
  },
  description: {
    marginBottom: 16,
    lineHeight: 20,
    color: '#777',
  },
  selectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 12,
    color: '#777',
  },
  optionButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
    flexDirection: 'column',
    marginHorizontal: 4,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  optionImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },

  serviceDetails: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  expandedContent: {
    marginTop: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 14,
    color: '#4a148c',
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: '#4a148c',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#4a148c',
    padding: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 18,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});

export default PackageDetailsScreen2;
