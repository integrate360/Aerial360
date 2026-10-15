// import React, {useContext, useState} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   SafeAreaView,
//   ScrollView,
//   Modal,
//   FlatList,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import {useNavigation, useRoute} from '@react-navigation/native';
// import BookingPackageCalender from '../Bookings/BookingPackageCalender';
// import {Colors} from '../Config/Config';
// import BookingPackageModal from '../Bookings/BookingPackageModal';
// import moment from 'moment';
// import BookingSuccessModal from '../Bookings/SucessfullModa';
// import RazorpayCheckout from 'react-native-razorpay';
// import {RAZORPAY_KEY_ID} from '../Config/Config';
// import TermsAndConditions from '../Bookings/TermsAndConditions';
// import {MultipleBookings, PackagePayment} from '../Api/Allapi';
// import UserContext from '../../context/UserContext';
// import {packageStyles} from './PackagesStyle';
// import RemainingPackageBookings from './RemainingPackageBookings';
// import RescheduleModal from '../Bookings/RescheduleModal';
// import fonts from '../FontFamily/FontFamily';
// import BookingSuccessModalWithoutInput from '../Bookings/SuccessfullWithoutInput';
// const PackageDetailsRemaining = () => {
//   const [expandedServices, setExpandedServices] = useState({});
//   const [isModalVisible, setModalVisible] = useState(false);
//   const [modal, setModal] = useState(false);
//   const [selectedClasses, setSelectedClasses] = useState([]);
//   const [view, setView] = useState([]);
//   const [sClass, setSClas] = useState();
//   const [index, setIndex] = useState(0);
//   const navigation = useNavigation();
//   const [overviewModal, setOverviewModal] = useState(false);
//   const [message, setMessage] = useState('');
//   const [selectedBooking, setSelectedBooking] = useState();
//   const [TNCModal, setTNCModal] = useState(false);
//   const routes = useRoute();
//   const {userId, user, token} = useContext(UserContext);
//   const item = routes?.params?.item;
//   const packageId = routes?.params?.packageId;
//   const bookings = routes?.params?.bookings;
//   const days = routes?.params?.remainingSlots;
//   const totalDays = item?.days;
//   const prices = item?.price;
//   const calculateSavings = () => {
//     if (!item) return 0;
//     const originalPrice = item?.offerPrice;
//     const discountedPrice = item?.price;
//     return Math.round(
//       ((originalPrice - discountedPrice) / originalPrice) * 100,
//     );
//   };

//   const toggleService = serviceId => {
//     setExpandedServices(prev => ({
//       ...prev,
//       [serviceId]: !prev[serviceId],
//     }));
//   };

//   const Header = () => (
//     <View style={packageStyles.header}>
//       <TouchableOpacity
//         style={packageStyles.backButton}
//         onPress={() => {
//           if (isModalVisible) return setModalVisible(false);
//           navigation.goBack();
//         }}>
//         <Icon name="chevron-left" size={24} color="#000" />
//         <Text style={packageStyles.headerTitle}>Package</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   const handleSaveData = list => {
//     // Filter out items that are already in selectedClasses
//     const uniqueItems = list.filter(newItem => {
//       return !selectedClasses.some(
//         existingItem =>
//           // Compare all relevant properties
//           newItem.classId === existingItem.classId &&
//           newItem.date === existingItem.date &&
//           newItem.time === existingItem.time &&
//           newItem.location._id === existingItem.location._id,
//       );
//     });

//     // Only update state if there are unique items to add
//     if (uniqueItems.length > 0) {
//       setSelectedClasses(prev => [...prev, ...uniqueItems]);
//     }
//   };
//   const PostBookingData = async () => {
//     const res = await MultipleBookings({
//       bookings: selectedClasses,
//       uPackageId: packageId,
//       token,
//     });
//     if (res?.status != 201) {
//       setMessage(res?.message);
//       return setTimeout(() => {
//         setMessage('');
//       }, 2000);
//     }
//     setOverviewModal(true);
//   };
//   const removeHandler = si => {
//     const filter = selectedClasses?.filter((e, i) => e?.index !== si);
//     setSelectedClasses(filter);
//   };
//   if (!item) {
//     return (
//       <SafeAreaView style={packageStyles.container}>
//         <Header />
//         <View style={packageStyles.content}>
//           <Text>No package data available</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }
//   return (
//     <SafeAreaView style={packageStyles.container}>
//       <Header />
//       <Modal
//         visible={isModalVisible}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setModalVisible(false)}>
//         <View style={packageStyles.modalBackdrop}>
//           <BookingPackageModal
//             packageId={item?._id}
//             packageDuration={item?.duration}
//             data={sClass}
//             days={days - selectedClasses?.length}
//             totalDays={days}
//             prices={prices}
//             index={index}
//             close={() => setModalVisible(false)}
//             saveData={handleSaveData}
//             selectedClasses={selectedClasses}
//           />
//         </View>
//       </Modal>
//       <BookingSuccessModalWithoutInput
//         isVisible={overviewModal}
//         isPackage={true}
//         onClose={() => setOverviewModal(false)}
//       />
//       <ScrollView style={packageStyles.content}>
//         <Text style={packageStyles.title}>{item.name}</Text>

//         <View style={packageStyles.priceContainer}>
//           <View style={packageStyles.saveTag}>
//             <Text style={packageStyles.saveText}>
//               Save {calculateSavings()}%
//             </Text>
//           </View>
//           <Text style={packageStyles.price}>
//             INR{item?.price?.toLocaleString()}
//           </Text>
//         </View>

//         {days > 0 && (
//           <Text style={packageStyles.subtitle}>
//             You can select any classes from below please click continue to make
//             your appointment.
//           </Text>
//         )}

//         <View style={packageStyles.infoContainer}>
//           <View style={packageStyles.infoItem}>
//             <Icon name="clock-outline" size={20} color="#666" />
//             <Text style={packageStyles.infoText}>
//               Expires after {item?.duration} days
//             </Text>
//           </View>
//           <View style={packageStyles.infoItem}>
//             <Icon name="map-marker-outline" size={20} color="#666" />
//             <Text style={packageStyles.infoText}>Multiple Locations</Text>
//           </View>
//         </View>

//         <Text style={packageStyles.description}>{item?.description}</Text>

//         {days > 0 && <Text style={packageStyles.selectionTitle}>Classes:</Text>}
//         {days > 0 &&
//           item?.services?.map((service, i) => {
//             const filter = selectedClasses?.filter(
//               e => e?.className == service?.name,
//             );
//             const includes = view?.includes(i);
//             return (
//               <TouchableOpacity
//                 key={service._id}
//                 style={packageStyles.optionButton}
//                 onPress={() => {
//                   setModalVisible(true);
//                   setSClas(service);
//                   setIndex(i);
//                 }}>
//                 <View style={packageStyles.optionContent}>
//                   <Image
//                     source={{uri: service?.image[0] ?? ''}}
//                     style={packageStyles.optionImage}
//                   />
//                   <View style={packageStyles.serviceDetails}>
//                     <View
//                       style={{
//                         flexDirection: 'row',
//                         justifyContent: 'space-between',
//                       }}>
//                       <Text style={packageStyles.optionText}>
//                         {service.name}
//                       </Text>
//                       {filter?.length > 0 && (
//                         <Text
//                           style={{
//                             color: Colors.primary,
//                             paddingVertical: 5,
//                             paddingHorizontal: 10,
//                             backgroundColor: '#C5BEFF',
//                             borderRadius: 50,
//                             fontWeight: '700',
//                           }}>
//                           {filter.length} Slots
//                         </Text>
//                       )}
//                     </View>
//                     <View style={packageStyles.expandedContent}>
//                       {/* <Text style={packageStyles.serviceDescription}>
//                         {service?.description}
//                       </Text> */}
//                       <View
//                         style={{
//                           flexDirection: 'row',
//                           justifyContent: 'space-between',
//                         }}>
//                         <Text style={packageStyles.servicePrice}>
//                           Price: INR{service?.price}
//                         </Text>
//                         <TouchableOpacity
//                           onPress={() => {
//                             if (includes) {
//                               setView(prev => prev.filter(item => item !== i));
//                             } else {
//                               setView(prev => [...prev, i]);
//                             }
//                           }}
//                           style={{
//                             paddingVertical: 5,
//                             paddingLeft: 60,
//                             paddingRight: 10,
//                           }}>
//                           {filter?.length > 0 && (
//                             <Text
//                               style={{
//                                 ...packageStyles.serviceDescription,
//                                 textDecorationLine: 'underline',
//                               }}>
//                               {includes ? 'Hide' : 'View'}
//                             </Text>
//                           )}
//                         </TouchableOpacity>
//                       </View>
//                     </View>
//                   </View>
//                 </View>
//                 {includes &&
//                   filter?.map((entry, listIndex) => (
//                     <View
//                       key={`${entry.className}-${entry.date}-${listIndex}`}
//                       style={{
//                         marginBottom: 15,
//                         padding: 10,
//                         backgroundColor: '#f9f9f9',
//                         borderRadius: 5,
//                         flexDirection: 'row',
//                         justifyContent: 'space-between',
//                         alignItems: 'center',
//                         position: 'relative',
//                       }}>
//                       <TouchableOpacity
//                         style={{
//                           backgroundColor: 'red',
//                           padding: 5,
//                           borderRadius: 50,
//                           alignItems: 'center',
//                           justifyContent: 'center',
//                           alignContent: 'center',
//                           // paddingBottom: 15,
//                           paddingHorizontal: 8,
//                           position: 'absolute',
//                           color: 'white',
//                           backgroundColor: 'orangered',
//                           top: -8,
//                           right: -8,
//                           opacity: 0.8,
//                         }}
//                         onPress={() => removeHandler(entry?.index)}>
//                         <Text
//                           style={{color: 'white', fontSize: 15, marginTop: -5}}>
//                           x
//                         </Text>
//                       </TouchableOpacity>
//                       <View>
//                         <View
//                           style={{
//                             display: 'flex',
//                             flexDirection: 'row',
//                             justifyContent: 'space-between',
//                             alignItems: 'center',
//                             width: '100%',
//                           }}>
//                           <Text style={packageStyles?.selectedTitle}>
//                             {entry?.className}
//                           </Text>
//                           <Text style={packageStyles?.selectedDate}>
//                             {moment(entry?.date).format('MMM DD-dd YYYY')}
//                           </Text>
//                         </View>
//                         <View
//                           style={{
//                             display: 'flex',
//                             flexDirection: 'row',
//                             justifyContent: 'space-between',
//                             alignItems: 'center',
//                             width: '100%',
//                           }}>
//                           <Text style={packageStyles?.selectedLocation}>
//                             {entry?.location?.name}
//                           </Text>
//                           <Text style={packageStyles?.selectedTime}>
//                             {entry?.time}
//                           </Text>
//                         </View>
//                       </View>
//                     </View>
//                   ))}
//               </TouchableOpacity>
//             );
//           })}

//         {message && (
//           <Text
//             style={{
//               color: 'red',
//             }}>
//             {message}
//           </Text>
//         )}
//         {days > 0 && (
//           <TouchableOpacity
//             style={packageStyles.continueButton}
//             //  onPress={openModal}
//             onPress={() => PostBookingData()}>
//             <Text
//               style={
//                 packageStyles.continueButtonText
//               }>{`Book ${selectedClasses?.length}/${days} Slots`}</Text>
//           </TouchableOpacity>
//         )}

//         <Text style={{color: 'black', fontWeight: '700'}}>Bookings: </Text>
//         <FlatList
//           data={bookings}
//           keyExtractor={(item, index) => index.toString()}
//           renderItem={element => (
//             <RemainingPackageBookings
//               item={element?.item}
//               setModal={() => setModal(true)}
//               setSelectedBooking={e => setSelectedBooking(e)}
//               packageName={item?.name}
//             />
//           )}
//           contentContainerStyle={styles.listContainer}
//           ListEmptyComponent={
//             <Text style={styles.emptyText}>No bookings Yet.</Text>
//           }
//         />

//         {modal && (
//           <RescheduleModal
//             fetchData={() => {
//               //getAllBookings()
//             }}
//             handleModalClose={() => setModal(false)}
//             selectedBooking={selectedBooking}
//             key={selectedBooking?._id}
//           />
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default PackageDetailsRemaining;
// const styles = StyleSheet.create({
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
// });

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
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import BookingPackageCalender from '../Bookings/BookingPackageCalender';
import { Colors } from '../Config/Config';
import BookingPackageModal from '../Bookings/BookingPackageModal';
import moment from 'moment';
import RazorpayCheckout from 'react-native-razorpay';
import { RAZORPAY_KEY_ID } from '../Config/Config';
import TermsAndConditions from '../Bookings/TermsAndConditions';
import { MultipleBookings, PackagePayment, refreshAllData } from '../Api/Allapi';
import UserContext from '../../context/UserContext';
import { packageStyles } from './PackagesStyle';
import RemainingPackageBookings from './RemainingPackageBookings';
import RescheduleModal from '../Bookings/RescheduleModal';
import fonts from '../FontFamily/FontFamily';
import BookingSuccessModalWithoutInput from '../Bookings/SuccessfullWithoutInput';
import Toast from 'react-native-toast-message';

const PackageDetailsRemaining = () => {
  const [expandedServices, setExpandedServices] = useState({});
  const [isModalVisible, setModalVisible] = useState(false);
  const [modal, setModal] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [view, setView] = useState([]);
  const [sClass, setSClas] = useState();
  const [index, setIndex] = useState(0);
  const navigation = useNavigation();
  const [overviewModal, setOverviewModal] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedBooking, setSelectedBooking] = useState();
  const [TNCModal, setTNCModal] = useState(false);
  const routes = useRoute();
  const { userId, user, token } = useContext(UserContext);
  const item = routes?.params?.item;
  const packageId = routes?.params?.packageId;
  const bookings = routes?.params?.bookings;
  const days = routes?.params?.remainingSlots;
  const totalDays = item?.days;
  const prices = item?.price;

  console.log('===========++++++++item?.services++++++++++++++++=========================');
  console.log(item?.services);
  console.log('=============+++++++++item?.services+++++++=======================');
  // Get the user package data to access extendedValidityEndDate
  const userPackage = routes?.params?.userPackage; // You'll need to pass this from UserPackages.js

  const calculateSavings = () => {
    if (!item) return 0;
    const originalPrice = item?.offerPrice;
    const discountedPrice = item?.price;
    return Math.round(
      ((originalPrice - discountedPrice) / originalPrice) * 100,
    );
  };

  // Function to get the expiration text based on extendedValidityEndDate
  // Function to get the expiration text based on extendedValidityEndDate
  const getExpirationText = () => {
    if (userPackage?.extendedValidityEndDate) {
      const extendedDate = moment(userPackage.extendedValidityEndDate);
      const today = moment();
      const daysRemaining = extendedDate.diff(today, 'days');

      if (daysRemaining > 0) {
        return `Expires on ${extendedDate.format('DD MMM YYYY')} (${daysRemaining} days remaining)`;
      } else {
        return `Expired on ${extendedDate.format('DD MMM YYYY')}`;
      }
    } else if (userPackage?.createdAt) {
      // Calculate expiration based on package creation date + duration
      const packageStartDate = moment(userPackage.createdAt);
      const packageEndDate = packageStartDate.add(item?.duration, 'days');
      const today = moment();
      const daysRemaining = packageEndDate.diff(today, 'days');

      if (daysRemaining > 0) {
        return `Expires on ${packageEndDate.format('DD MMM YYYY')} (${daysRemaining} days remaining)`;
      } else {
        return `Expired on ${packageEndDate.format('DD MMM YYYY')}`;
      }
    } else {
      return `Expires after ${item?.duration} days`;
    }
  };

  const toggleService = serviceId => {
    setExpandedServices(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId],
    }));
  };

  const Header = () => (
    <View style={packageStyles.header}>
      <TouchableOpacity
        style={packageStyles.backButton}
        onPress={() => {
          if (isModalVisible) return setModalVisible(false);
          navigation.goBack();
        }}>
        <Icon name="chevron-left" size={24} color="#000" />
        <Text style={packageStyles.headerTitle}>Package</Text>
      </TouchableOpacity>
    </View>
  );

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

  const PostBookingData = async () => {
    console.log("++++++++++++++++++++++++++++++++++++++++++++++")
    console.log('Selected Classes Data:', JSON.stringify(selectedClasses, null, 2));
    console.log("++++++++++++++++++++++++++++++++++++++++++++++")

    const enrichedBookings = selectedClasses.map(classItem => ({
      ...classItem,
      user: userId,
      package: packageId,
      uuid: item?.uuid,
    }));

    try {
      const res = await MultipleBookings({
        bookings: enrichedBookings,
        uPackageId: packageId,
        token,
      });

      if (res?.status != 201) {
        setMessage(res?.message);

        // Show error toast
        Toast.show({
          type: 'error',
          text1: 'Booking Failed',
          text2: res?.message || 'Failed to book classes',
        });

        return setTimeout(() => {
          setMessage('');
        }, 2000);
      }

      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Bookings Confirmed!',
        text2: 'Your class bookings have been successfully scheduled',
      });

      // Refresh cached lists so remaining slots/availability update immediately
      await refreshAllData();

      setOverviewModal(true);

    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Failed to process bookings. Please try again.',
      });
    }
  };

  const removeHandler = si => {
    const filter = selectedClasses?.filter((e, i) => e?.index !== si);
    setSelectedClasses(filter);
  };

  if (!item) {
    return (
      <SafeAreaView style={packageStyles.container}>
        <Header />
        <View style={packageStyles.content}>
          <Text>No package data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  const convertTo12HourFormat = time24 => {
    if (!time24) return '';
    const [hour, minute] = time24.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  return (
    <SafeAreaView style={packageStyles.container}>
      <Header />
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <View style={packageStyles.modalBackdrop}>
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
            extendedValidityEndDate={userPackage?.extendedValidityEndDate}
            userPackage={userPackage} // ✅ Add this line
          />
        </View>
      </Modal>
      <BookingSuccessModalWithoutInput
        isVisible={overviewModal}
        isPackage={true}
        onClose={() => setOverviewModal(false)}
      />
      <ScrollView style={packageStyles.content}>
        <Text style={packageStyles.title}>{item.name}</Text>

        <View style={packageStyles.priceContainer}>
          <View style={packageStyles.saveTag}>
            <Text style={packageStyles.saveText}>
              Save {calculateSavings()}%
            </Text>
          </View>
          <Text style={packageStyles.price}>
            INR {item?.price?.toLocaleString()}
          </Text>
        </View>

        {days > 0 && (
          <Text style={packageStyles.subtitle}>
            You can select any classes from below please click continue to make
            your appointment.
          </Text>
        )}

        <View style={packageStyles.infoContainer}>
          <View style={packageStyles.infoItem}>
            <Icon name="clock-outline" size={20} color="#666" />
            <Text style={packageStyles.infoText}>
              {getExpirationText()}
            </Text>
          </View>
          <View style={packageStyles.infoItem}>
            <Icon name="map-marker-outline" size={20} color="#666" />
            <Text style={packageStyles.infoText}>Multiple Locations</Text>
          </View>
        </View>

        <Text style={packageStyles.description}>{item?.description}</Text>

        {days > 0 && <Text style={packageStyles.selectionTitle}>Classes:</Text>}
        {days > 0 &&
          item?.services?.map((service, i) => {
            const filter = selectedClasses?.filter(
              e => e?.className == service?.name,
            );
            const includes = view?.includes(i);
            return (
              <TouchableOpacity
                key={service._id}
                style={packageStyles.optionButton}
                onPress={() => {
                  setModalVisible(true);
                  setSClas(service);
                  setIndex(i);
                }}>
                <View style={packageStyles.optionContent}>
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
                    style={packageStyles.optionImage}
                  />
                  <View style={packageStyles.serviceDetails}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
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
                        <View
                          style={{
                            backgroundColor: '#C5BEFF',
                            borderRadius: 50,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            minWidth: 30, // Ensure minimum width
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <Text
                            style={{
                              color: Colors.primary,
                              fontWeight: '700',
                              fontSize: 12, // Explicit font size
                              includeFontPadding: false, // Remove extra padding on Android
                              textAlignVertical: 'center', // Better vertical alignment
                            }}>
                            {filter.length} {filter.length === 1 ? 'Slot' : 'Slots'}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={packageStyles.expandedContent}>
                      {/* <Text style={packageStyles.serviceDescription}>
                        {service?.description}
                      </Text> */}
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={packageStyles.servicePrice}>
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
                                ...packageStyles.serviceDescription,
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
                {includes &&
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
                          // paddingBottom: 15,
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

        {message && (
          <Text
            style={{
              color: 'red',
            }}>
            {message}
          </Text>
        )}
        {days > 0 && (
          <TouchableOpacity
            style={[
              packageStyles.continueButton,
              {
                backgroundColor:
                  selectedClasses.length === 0 ? '#ccc' : '#4a148c', // gray when empty, purple when selected
              },
            ]}
            onPress={() => {
              if (selectedClasses.length === 0) {
                Toast.show({
                  type: 'info',
                  text1: 'Selection Required',
                  text2: 'Please select at least one class and slot before continuing',
                });
              } else {
                PostBookingData();
              }
            }}>
            <Text style={packageStyles.continueButtonText}>
              {selectedClasses.length === 0
                ? 'Confirm Your Booking'
                : `Confirm Your Booking ${selectedClasses.length}/${days} Slots`}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={{ color: 'black', fontWeight: '700' }}>Bookings: </Text>
        <FlatList
          data={bookings}
          keyExtractor={(item, index) => index.toString()}
          renderItem={element => (
            <RemainingPackageBookings
              item={element?.item}
              setModal={() => setModal(true)}
              setSelectedBooking={e => setSelectedBooking(e)}
              packageName={item?.name}
            />
          )}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No bookings Yet.</Text>
          }
        />

        {modal && (
          <RescheduleModal
            fetchData={() => {
              //getAllBookings()
            }}
            handleModalClose={() => setModal(false)}
            selectedBooking={selectedBooking}
            userPackage={userPackage}
            extendedValidityEndDate={userPackage?.extendedValidityEndDate}
            key={selectedBooking?._id}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PackageDetailsRemaining;

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
  },
  arrowContainer: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -15 }], // Adjust based on your circle size
    zIndex: 1,
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  numberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  numberText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#555',
    fontSize: 16,
    marginTop: 20,
    fontFamily: fonts.regular,
  },
});
