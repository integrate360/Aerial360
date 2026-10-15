// import React, {useEffect, useState, useRef, useContext} from 'react';
// import {
//   ScrollView,
//   View,
//   FlatList,
//   Text,
//   Dimensions,
//   Animated,
//   TouchableOpacity,
//   Linking,
//   PanResponder,
//   StyleSheet,
//   Modal,
// } from 'react-native';
// import {Card, Title, Paragraph, Appbar} from 'react-native-paper';
// import LinearGradient from 'react-native-linear-gradient';
// import {useNavigation, useRoute} from '@react-navigation/native';
// import {getAllPackges, getCategoryPackges} from '../Api/Allapi';
// import {Colors} from '../Config/Config';
// const {height} = Dimensions.get('window'); // Get screen height
// import UserContext from '../../context/UserContext';
// import fonts from '../FontFamily/FontFamily';
// import ClassBookingCalendarModal from '../MainScreens/ClassBookingCalendarModal';
// // Packages Component
// const Packages = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const id = route?.params?.item;
//   const classData = route?.params?.class;
//   const [data, setData] = useState([]);
//   const [noData, setNoData] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [packageId, setPackageId] = useState('');
//   const [modal, setModal] = useState(false);
//   const {userId, email} = useContext(UserContext);

//   // useEffect(() => {
//   //   getAllPackges()
//   //     .then(res => {
//   //       setLoading(true);
//   //       const filteredData = res?.data?.filter(item =>
//   //         item?.services?.some(service => service?._id === id),
//   //       );
//   //       if (filteredData.length === 0) {
//   //         setNoData(true);
//   //       }
//   //       setData(filteredData);
//   //     })
//   //     .finally(() => setLoading(false));
//   // }, [id]);
//   useEffect(() => {
//     getCategoryPackges(classData?.category?._id)
//       .then(res => {
//         setLoading(true);
//         setData(res);
//       })
//       .finally(() => setLoading(false));
//   }, [id]);
//   const handleCardPress = item => {
//     if (userId) {
//       navigation.navigate('PackagesDetails', {item});
//     } else {
//       navigation.navigate('Login');
//     }
//   };

//   const renderItem = ({item}) => (
//     <Card
//       style={{margin: 10, backgroundColor: '#fff'}}
//       onPress={() => handleCardPress(item)}>
//       <Card.Content>
//         <Title
//           style={{color: 'black', fontSize: 18, fontFamily: fonts.regular}}>
//           {item?.name}
//         </Title>
//         <Paragraph style={styles.cardDescription}>
//           {item?.description}
//         </Paragraph>
//         <View style={{flexDirection: 'row', alignSelf: 'flex-end'}}>
//           <Paragraph style={styles.cardTag}>
//             <Text style={{color: 'green', fontFamily: fonts.regular}}>
//               Days {item?.days}
//             </Text>
//           </Paragraph>
//           <Paragraph style={styles.cardTag}>
//             <Text style={{color: Colors.primary, fontFamily: fonts.regular}}>
//               ₹ {item?.price}
//             </Text>
//           </Paragraph>
//         </View>
//       </Card.Content>
//     </Card>
//   );
//   return (
//     <LinearGradient
//       style={{flex: 1}}
//       colors={[Colors.primary, Colors.secondary]}
//       start={{x: 0.0, y: 0.2}}
//       end={{x: 0.7, y: 1.0}}>
//       <ScrollView contentContainerStyle={{flexGrow: 1}}>
//         <Appbar.Header style={{backgroundColor: 'transparent'}}>
//           <Appbar.BackAction
//             size={27}
//             color="#fff"
//             onPress={navigation.goBack}
//           />
//           <Appbar.Content
//             title="Packages"
//             titleStyle={{
//               color: '#fff',
//               fontSize: 18,
//               fontFamily: fonts.regular,
//             }}
//           />
//         </Appbar.Header>
//         <ClassBookingCalendarModal
//           closeModal={() => setModal(false)}
//           item={classData}
//           modal={modal}
//         />
//         <View style={{padding: 5}}>
//           <Text
//             style={{
//               textAlign: 'justify',
//               color: '#fff',
//               marginHorizontal: 10,
//               fontFamily: fonts.regular,
//             }}>
//             Hey, there are special packages with this service, check them out!
//           </Text>
//           <Card
//             style={{margin: 10, backgroundColor: '#fff'}}
//             onPress={() =>
//               // navigation.navigate('CalendarScreen', {
//               //   item: classData,
//               //   Arrows: true,
//               // });
//               {
//                 if (!userId) return navigation.navigate('Login');
//                 setModal(true);
//               }
//             }>
//             <Card.Content>
//               <Title
//                 style={{
//                   color: 'black',
//                   fontSize: 18,
//                   fontFamily: fonts.regular,
//                 }}>
//                 {`${classData?.name} 1 Sessions (1 Day Validity)`}
//               </Title>
//               <Paragraph style={styles.cardDescription}>
//                 {classData?.description}
//               </Paragraph>
//               <View style={{flexDirection: 'row', alignSelf: 'flex-end'}}>
//                 <Paragraph style={styles.cardTag}>
//                   <Text style={{color: 'green', fontFamily: fonts.regular}}>
//                     Day 1
//                   </Text>
//                 </Paragraph>
//                 <Paragraph style={styles.cardTag}>
//                   <Text
//                     style={{color: Colors.primary, fontFamily: fonts.regular}}>
//                     ₹ {classData?.price}
//                   </Text>
//                 </Paragraph>
//               </View>
//             </Card.Content>
//           </Card>
//           {loading ? (
//             <Text
//               style={{
//                 color: '#fff',
//                 textAlign: 'center',
//                 marginTop: 20,
//                 fontFamily: fonts.regular,
//               }}>
//               Loading...
//             </Text>
//           ) : noData ? (
//             <Text
//               style={{
//                 color: '#fff',
//                 textAlign: 'center',
//                 marginTop: 20,
//                 fontFamily: fonts.regular,
//               }}>
//               No packages found for this service.
//             </Text>
//           ) : (
//             <FlatList
//               data={data}
//               renderItem={renderItem}
//               keyExtractor={item => item.id}
//               scrollEnabled={false}
//             />
//           )}
//         </View>
//       </ScrollView>
//     </LinearGradient>
//   );
// };

// export default Packages;

// const styles = StyleSheet.create({
//   bottomSheet: {
//     position: 'absolute',
//     width: '100%',
//     height: height,
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     overflow: 'hidden',
//   },
//   contentContainer: {
//     flex: 1,
//     padding: 16,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 10,
//     color: Colors.primary,
//     textAlign: 'left',
//   },
//   address: {
//     fontSize: 14,
//     color: '#555',
//     marginVertical: 5,
//   },
//   linkButton: {
//     marginTop: 10,
//     padding: 8,
//     borderRadius: 10,
//     backgroundColor: Colors.secondary,
//     alignSelf: 'flex-start',
//   },
//   linkText: {
//     fontSize: 14,
//     color: '#fff',
//     fontWeight: '500',
//     fontFamily: fonts.regular,
//   },
//   cardDescription: {
//     color: 'grey',
//     marginTop: 5,
//     backgroundColor: '#f2f2f2',
//     paddingHorizontal: 12,
//     paddingVertical: 3,
//     borderRadius: 10,
//     fontFamily: fonts.regular,
//   },
//   cardTag: {
//     color: 'grey',
//     marginTop: 5,
//     backgroundColor: '#f2f2f2',
//     paddingHorizontal: 12,
//     paddingVertical: 3,
//     borderRadius: 10,
//     marginLeft: 10,
//   },
// });


// import React, {useEffect, useState, useRef, useContext} from 'react';
// import {
//   ScrollView,
//   View,
//   FlatList,
//   Text,
//   Dimensions,
//   Animated,
//   TouchableOpacity,
//   Linking,
//   PanResponder,
//   StyleSheet,
//   Modal,
// } from 'react-native';
// import {Card, Title, Paragraph, Appbar} from 'react-native-paper';
// import LinearGradient from 'react-native-linear-gradient';
// import {useNavigation, useRoute} from '@react-navigation/native';
// import {getAllPackges, getCategoryPackges} from '../Api/Allapi';
// import {Colors} from '../Config/Config';
// const {height} = Dimensions.get('window'); // Get screen height
// import UserContext from '../../context/UserContext';
// import fonts from '../FontFamily/FontFamily';
// import ClassBookingCalendarModal from '../MainScreens/ClassBookingCalendarModal';
// import axios from 'axios';
// import moment from 'moment';
// import {getUserPackgeById} from '../Api/Allapi';
// import {BaseUrl} from '../Api/BaseUrl';
// import {Button} from 'react-native-paper';

// // Packages Component
// const Packages = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const id = route?.params?.item;
//   const classData = route?.params?.class;
//   const [data, setData] = useState([]);
//   const [noData, setNoData] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [packageId, setPackageId] = useState('');
//   const [modal, setModal] = useState(false);
//   const {userId, email, token} = useContext(UserContext);
//   const [userPackages, setUserPackages] = useState([]);
//   const [loader, setLoader] = useState(false);

//   console.log('====================================');
//   console.log("START ...: ",classData,".........END");
//     console.log("START ...: ",id,".........END");

//   console.log('====================================');

//   // useEffect(() => {
//   //   getAllPackges()
//   //     .then(res => {
//   //       setLoading(true);
//   //       const filteredData = res?.data?.filter(item =>
//   //         item?.services?.some(service => service?._id === id),
//   //       );
//   //       if (filteredData.length === 0) {
//   //         setNoData(true);
//   //       }
//   //       setData(filteredData);
//   //     })
//   //     .finally(() => setLoading(false));
//   // }, [id]);
//   useEffect(() => {
//     getCategoryPackges(classData?.category?._id)
//       .then(res => {
//         setLoading(true);
//         setData(res);
//       })
//       .finally(() => setLoading(false));
//   }, [id]);

//   useEffect(() => {
//     if (userId) getUserPackagesByUserId();
//   }, [userId]);

//   const clickHandler = async (id, remainingSlots) => {
//     try {
//       const pack = await getUserPackgeById(id, token);
//       if (pack?.status !== 200) return Alert.alert(pack.message);
//       navigation.navigate('RemainigPackage', {
//         packageId: id,
//         item: pack?.data?.data?.package,
//         bookings: pack?.data?.data?.bookings,
//         remainingSlots,
//       });
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const getUserPackagesByUserId = async () => {
//     setLoader(true);
//     try {
//       const response = await axios.get(
//         `${BaseUrl}user-package/user/${userId}`,
//         {
//           headers: {Authorization: `Bearer ${token}`},
//         },
//       );
//       if (response?.data?.data) {
//         setUserPackages(response.data.data.reverse());
//       } else {
//         setUserPackages([]);
//       }
//     } catch (error) {
//       console.error(
//         'Error fetching user packages:',
//         error.response?.data || error.message,
//       );
//     } finally {
//       setLoader(false);
//     }
//   };

//   const handleCardPress = item => {
//     if (userId) {
//       navigation.navigate('PackagesDetails', {item});
//     } else {
//       navigation.navigate('Login');
//     }
//   };

//   const renderItem = ({item}) => (
//     <Card
//       style={{margin: 10, backgroundColor: '#fff'}}
//       onPress={() => handleCardPress(item)}>
//       <Card.Content>
//         <Title
//           style={{color: 'black', fontSize: 18, fontFamily: fonts.regular}}>
//           {item?.name}
//         </Title>
//         <Paragraph style={styles.cardDescription}>
//           {item?.description}
//         </Paragraph>
//         <View style={{flexDirection: 'row', alignSelf: 'flex-end'}}>
//           {/* <Paragraph style={styles.cardTag}>
//             <Text style={{color: 'green', fontFamily: fonts.regular}}>
//               Days {item?.days}
//             </Text>
//           </Paragraph> */}
//           <Paragraph style={styles.cardTag}>
//             <Text style={{color: Colors.primary, fontFamily: fonts.regular}}>
//               ₹ {item?.price}
//             </Text>
//           </Paragraph>
//         </View>
//       </Card.Content>
//     </Card>
//   );
//   return (
//     <LinearGradient
//       style={{flex: 1}}
//       colors={[Colors.primary, Colors.secondary]}
//       start={{x: 0.0, y: 0.2}}
//       end={{x: 0.7, y: 1.0}}>
//       <ScrollView contentContainerStyle={{flexGrow: 1}}>
//         <Appbar.Header style={{backgroundColor: 'transparent'}}>
//           <Appbar.BackAction
//             size={27}
//             color="#fff"
//             onPress={navigation.goBack}
//           />
//           <Appbar.Content
//             title="Packages"
//             titleStyle={{
//               color: '#fff',
//               fontSize: 18,
//               fontFamily: fonts.regular,
//             }}
//           />
//         </Appbar.Header>
//         <ClassBookingCalendarModal
//           closeModal={() => setModal(false)}
//           item={classData}
//           modal={modal}
//         />
//         <View style={{padding: 5}}>
//           <View style={{marginVertical: 10}}>
//             <Text
//               style={{
//                 color: '#fff',
//                 fontSize: 18,
//                 fontFamily: fonts.regular,
//                 marginHorizontal: 10,
//               }}>
//               Your Existing Packages
//             </Text>
//             {loader ? (
//               <Text style={{color: '#fff', textAlign: 'center', marginTop: 10}}>
//                 Loading...
//               </Text>
//             ) : userPackages.length === 0 ? (
//               <Text style={{color: '#fff', textAlign: 'center', marginTop: 10}}>
//                 No Package Yet.
//               </Text>
//             ) : (
//               userPackages.map(item => (
//                 <Card
//                   key={item?._id}
//                   style={{margin: 10, backgroundColor: '#fff'}}>
//                   <Card.Content>
//                     <View
//                       style={{
//                         flexDirection: 'row',
//                         justifyContent: 'space-between',
//                       }}>
//                       <Title
//                         style={{
//                           color: 'black',
//                           fontSize: 18,
//                           fontFamily: fonts.regular,
//                         }}>
//                         {item?.package?.name}
//                       </Title>
//                       <Text
//                         style={{
//                           color: Colors.primary,
//                           fontFamily: fonts.regular,
//                         }}>
//                         {`${item?.slots}/${item?.totalSlots}`}
//                       </Text>
//                     </View>
//                     <Paragraph style={styles.cardDescription}>
//                       Created on {moment(item?.createdAt).format('DD MMM YYYY')}
//                     </Paragraph>
//                     <View
//                       style={{
//                         flexDirection: 'row',
//                         justifyContent: 'flex-end',
//                       }}>
//                       <Button
//                         mode="outlined"
//                         onPress={() =>
//                           clickHandler(
//                             item?._id,
//                             item?.totalSlots - item?.slots,
//                           )
//                         }>
//                         {item?.totalSlots - item?.slots > 0
//                           ? 'Book Remaining'
//                           : 'View Bookings'}
//                       </Button>
//                     </View>
//                   </Card.Content>
//                 </Card>
//               ))
//             )}
//           </View>

//           <Text
//             style={{
//               textAlign: 'justify',
//               color: '#fff',
//               marginHorizontal: 10,
//               fontFamily: fonts.regular,
//             }}>
//             Hey, there are special packages with this service, check them out!
//           </Text>
//           <Card
//             style={{margin: 10, backgroundColor: '#fff'}}
//             onPress={() =>
//               // navigation.navigate('CalendarScreen', {
//               //   item: classData,
//               //   Arrows: true,
//               // });
//               {
//                 if (!userId) return navigation.navigate('Login');
//                 setModal(true);
//               }
//             }>
//             <Card.Content>
//               <Title
//                 style={{
//                   color: 'black',
//                   fontSize: 18,
//                   fontFamily: fonts.regular,
//                 }}>
//                 {`${classData?.name} 1 Sessions (1 Day Validity)`}
//               </Title>
//               <Paragraph style={styles.cardDescription}>
//                 {classData?.description}
//               </Paragraph>
//               <View style={{flexDirection: 'row', alignSelf: 'flex-end'}}>
//                 {/* REMOVE or comment this block to hide "Day 1" */}
//                 {/* <Paragraph style={styles.cardTag}>
//     <Text style={{color: 'green', fontFamily: fonts.regular}}>
//       Day 1
//     </Text>
//   </Paragraph> */}

//                 <Paragraph style={styles.cardTag}>
//                   <Text
//                     style={{color: Colors.primary, fontFamily: fonts.regular}}>
//                     ₹ {classData?.price}
//                   </Text>
//                 </Paragraph>
//               </View>
//             </Card.Content>
//           </Card>
//           {loading ? (
//             <Text
//               style={{
//                 color: '#fff',
//                 textAlign: 'center',
//                 marginTop: 20,
//                 fontFamily: fonts.regular,
//               }}>
//               Loading...
//             </Text>
//           ) : noData ? (
//             <Text
//               style={{
//                 color: '#fff',
//                 textAlign: 'center',
//                 marginTop: 20,
//                 fontFamily: fonts.regular,
//               }}>
//               No packages found for this service.
//             </Text>
//           ) : (
//             <FlatList
//               data={data}
//               renderItem={renderItem}
//               keyExtractor={item => item.id}
//               scrollEnabled={false}
//             />
//           )}
//         </View>
//       </ScrollView>
//     </LinearGradient>
//   );
// };

// export default Packages;

// const styles = StyleSheet.create({
//   bottomSheet: {
//     position: 'absolute',
//     width: '100%',
//     height: height,
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     overflow: 'hidden',
//   },
//   contentContainer: {
//     flex: 1,
//     padding: 16,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 10,
//     color: Colors.primary,
//     textAlign: 'left',
//   },
//   address: {
//     fontSize: 14,
//     color: '#555',
//     marginVertical: 5,
//   },
//   linkButton: {
//     marginTop: 10,
//     padding: 8,
//     borderRadius: 10,
//     backgroundColor: Colors.secondary,
//     alignSelf: 'flex-start',
//   },
//   linkText: {
//     fontSize: 14,
//     color: '#fff',
//     fontWeight: '500',
//     fontFamily: fonts.regular,
//   },
//   cardDescription: {
//     color: 'grey',
//     marginTop: 5,
//     backgroundColor: '#f2f2f2',
//     paddingHorizontal: 12,
//     paddingVertical: 3,
//     borderRadius: 10,
//     fontFamily: fonts.regular,
//   },
//   cardTag: {
//     color: 'grey',
//     marginTop: 5,
//     backgroundColor: '#f2f2f2',
//     paddingHorizontal: 12,
//     paddingVertical: 3,
//     borderRadius: 10,
//     marginLeft: 10,
//   },
// });

import React, { useEffect, useState, useRef, useContext } from 'react';
import {
  ScrollView,
  View,
  FlatList,
  Text,
  Dimensions,
  Animated,
  TouchableOpacity,
  Linking,
  PanResponder,
  StyleSheet,
  Modal,
} from 'react-native';
import { Card, Title, Paragraph, Appbar } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getAllPackges, getCategoryPackges } from '../Api/Allapi';
import { Colors } from '../Config/Config';
const { height } = Dimensions.get('window'); // Get screen height
import UserContext from '../../context/UserContext';
import fonts from '../FontFamily/FontFamily';
import ClassBookingCalendarModal from '../MainScreens/ClassBookingCalendarModal';
import axios from 'axios';
import moment from 'moment';
import { getUserPackgeById } from '../Api/Allapi';
import { BaseUrl } from '../Api/BaseUrl';
import { Button } from 'react-native-paper';
import Toast from 'react-native-toast-message';

// Packages Component
const Packages = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const id = route?.params?.item;
  const classData = route?.params?.class;
  const [data, setData] = useState([]);
  const [noData, setNoData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [packageId, setPackageId] = useState('');
  const [modal, setModal] = useState(false);
  const { userId, email, token } = useContext(UserContext);
  const [userPackages, setUserPackages] = useState([]);
  const [loader, setLoader] = useState(false);
  const [bookingDates, setBookingDates] = useState([]); // New state for booking dates

  // console.log('====================================');
  // console.log("START ...: ", classData, ".........END");
  // console.log("START ...: ", id, ".........END");
  // console.log('====================================');

  const getPackageEndDate = (item) => {
    if (item?.extendedValidityEndDate) {
      return moment(item.extendedValidityEndDate);
    }

    const startDate = moment(item?.createdAt);
    const duration = item?.package?.duration || 0;

    return startDate.clone().add(duration, 'days');
  };

  const isPackageExpired = (item) => {
    const endDate = getPackageEndDate(item);
    return moment().isAfter(endDate, 'day');
  };



  // Function to fetch booking dates
  const fetchBookingDates = async () => {
    try {
      if (!classData?._id) {
        console.log('No class ID available');
        return;
      }

      // console.log('Fetching booking dates for classId:', classData._id);

      const response = await axios.get(`${BaseUrl}getAllBookingsdatestest`, {
        params: {
          classId: classData._id
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // console.log('Booking dates API response:', response.data);
      setBookingDates(response.data); // Adjust this based on your API response structure

    } catch (error) {
      console.error('Error fetching booking dates:', error);
      console.log('Error details:', error.response?.data || error.message);
    }
  };

  // Call the API when component mounts or when classData changes
  useEffect(() => {
    if (classData?._id) {
      fetchBookingDates();
    }
  }, [classData?._id, token]);

  useEffect(() => {
    getCategoryPackges(classData?.category?._id)
      .then(res => {
        setLoading(true);
        setData(res);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (userId) getUserPackagesByUserId();
  }, [userId]);

  const clickHandler = async (id, remainingSlots) => {
    try {
      const pack = await getUserPackgeById(id, token);
      if (pack?.status !== 200) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: pack.message || 'Something went wrong',
          position: 'top',
          visibilityTime: 4000,
        });
        return;
      } navigation.navigate('RemainigPackage', {
        packageId: id,
        item: pack?.data?.data?.package,
        bookings: pack?.data?.data?.bookings,
        remainingSlots,
        userPackage: pack?.data?.data, // ✅ ADD THIS
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getUserPackagesByUserId = async () => {
    setLoader(true);
    try {
      const response = await axios.get(
        `${BaseUrl}user-package/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log('====================================');
      console.log("Existing Package data: ", response.data.data);
      console.log('====================================');
      if (response?.data?.data) {
        setUserPackages(response.data.data.reverse());
      } else {
        setUserPackages([]);
      }
    } catch (error) {
      console.error(
        'Error fetching user packages:',
        error.response?.data || error.message,
      );
    } finally {
      setLoader(false);
    }
  };

  const handleCardPress = item => {
    if (userId) {
      navigation.navigate('PackagesDetails', { item });
    } else {
      navigation.navigate('Login');
    }
  };

  const renderItem = ({ item }) => (
    <Card
      style={{ margin: 10, backgroundColor: '#fff' }}
      onPress={() => handleCardPress(item)}>
      <Card.Content>
        <Title
          style={{ color: 'black', fontSize: 18, fontFamily: fonts.regular }}>
          {item?.name}
        </Title>
        <Paragraph style={styles.cardDescription}>
          {item?.description}
        </Paragraph>
        <View style={{ flexDirection: 'row', alignSelf: 'flex-end' }}>
          <Paragraph style={styles.cardTag}>
            <Text style={{ color: Colors.primary, fontFamily: fonts.regular }}>
              ₹ {item?.price}
            </Text>
          </Paragraph>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <LinearGradient
      style={{ flex: 1 }}
      colors={[Colors.primary, Colors.secondary]}
      start={{ x: 0.0, y: 0.2 }}
      end={{ x: 0.7, y: 1.0 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <Appbar.Header style={{ backgroundColor: 'transparent' }}>
          <Appbar.BackAction
            size={27}
            color="#fff"
            onPress={navigation.goBack}
          />
          <Appbar.Content
            title="Packages"
            titleStyle={{
              color: '#fff',
              fontSize: 18,
              fontFamily: fonts.regular,
            }}
          />
        </Appbar.Header>
        <ClassBookingCalendarModal
          closeModal={() => setModal(false)}
          item={classData}
          modal={modal}
        />

        {/* Display Booking Dates if available */}
        {bookingDates.length > 0 && (
          <View style={{ margin: 10, padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontFamily: fonts.regular, marginBottom: 8 }}>
              Available Booking Dates:
            </Text>
            {bookingDates.map((date, index) => (
              <Text key={index} style={{ color: '#fff', fontFamily: fonts.regular }}>
                • {date} {/* Adjust this based on your API response structure */}
              </Text>
            ))}
          </View>
        )}

        <View style={{ padding: 5 }}>
          <View style={{ marginVertical: 10 }}>
            <Text
              style={{
                color: '#fff',
                fontSize: 18,
                fontFamily: fonts.regular,
                marginHorizontal: 10,
              }}>
              Your Existing Packages
            </Text>
            {loader ? (
              <Text style={{ color: '#fff', textAlign: 'center', marginTop: 10 }}>
                Loading...
              </Text>
            ) : userPackages.length === 0 ? (
              <Text style={{ color: '#fff', textAlign: 'center', marginTop: 10 }}>
                No Package Yet.
              </Text>
            ) : (
              userPackages.map(item => {
                const remainingSlots = item?.totalSlots - item?.slots;
                const expired = isPackageExpired(item);
                const endDate = getPackageEndDate(item);

                return (
                  <Card
                    key={item?._id}
                    style={{
                      margin: 10,
                      backgroundColor: '#fff',
                      opacity: expired ? 0.6 : 1,
                    }}>
                    <Card.Content>

                      {/* Row 1: Title + Slots */}
                      <View style={styles.rowBetween}>
                        <Title style={styles.packageTitle}>
                          {item?.package?.name}
                        </Title>

                        <Text style={styles.slotText}>
                          {`${item?.slots}/${item?.totalSlots}`}
                        </Text>
                      </View>

                      {/* Row 2: Duration + Button */}
                      <View style={styles.rowBetweenCenter}>
                        <Text style={styles.durationText}>
                          Package Duration:{' '}
                          {moment(item?.createdAt).format('DD MMM YYYY')} →{' '}
                          {endDate.format('DD MMM YYYY')}
                        </Text>

                        {expired ? (
                          <Button mode="outlined" disabled compact>
                            Expired
                          </Button>
                        ) : (
                          <Button
                            mode="outlined"
                            compact
                            onPress={() =>
                              clickHandler(item?._id, remainingSlots)
                            }>
                            {remainingSlots > 0 ? 'Book Remaining' : 'View'}
                          </Button>
                        )}
                      </View>

                    </Card.Content>
                  </Card>
                );
              })

            )}
          </View>

          <Text
            style={{
              textAlign: 'justify',
              color: '#fff',
              marginHorizontal: 10,
              fontFamily: fonts.regular,
            }}>
            Hey, there are special packages with this service, check them out!
          </Text>
          <Card
            style={{ margin: 10, backgroundColor: '#fff' }}
            onPress={() => {
              if (!userId) return navigation.navigate('Login');
              setModal(true);
            }
            }>
            <Card.Content>
              <Title
                style={{
                  color: 'black',
                  fontSize: 18,
                  fontFamily: fonts.regular,
                }}>
                {`${classData?.name} 1 Sessions (1 Day Validity)`}
              </Title>
              <Paragraph style={styles.cardDescription}>
                {classData?.description}
              </Paragraph>
              <View style={{ flexDirection: 'row', alignSelf: 'flex-end' }}>
                <Paragraph style={styles.cardTag}>
                  <Text
                    style={{ color: Colors.primary, fontFamily: fonts.regular }}>
                    ₹ {classData?.price}
                  </Text>
                </Paragraph>
              </View>
            </Card.Content>
          </Card>
          {loading ? (
            <Text
              style={{
                color: '#fff',
                textAlign: 'center',
                marginTop: 20,
                fontFamily: fonts.regular,
              }}>
              Loading...
            </Text>
          ) : noData ? (
            <Text
              style={{
                color: '#fff',
                textAlign: 'center',
                marginTop: 20,
                fontFamily: fonts.regular,
              }}>
              No packages found for this service.
            </Text>
          ) : (
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default Packages;

const styles = StyleSheet.create({
  bottomSheet: {
    position: 'absolute',
    width: '100%',
    height: height,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: Colors.primary,
    textAlign: 'left',
  },
  address: {
    fontSize: 14,
    color: '#555',
    marginVertical: 5,
  },
  linkButton: {
    marginTop: 10,
    padding: 8,
    borderRadius: 10,
    backgroundColor: Colors.secondary,
    alignSelf: 'flex-start',
  },
  linkText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  cardDescription: {
    color: 'grey',
    marginTop: 5,
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 10,
    fontFamily: fonts.regular,
  },
  cardTag: {
    color: 'grey',
    marginTop: 5,
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  rowBetweenCenter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },

  packageTitle: {
    color: 'black',
    fontSize: 17,
    fontFamily: fonts.regular,
    flex: 1,
    marginRight: 10,
  },

  slotText: {
    color: Colors.primary,
    fontFamily: fonts.regular,
    fontSize: 14,
  },

  durationText: {
    color: '#555',
    fontSize: 13,
    fontFamily: fonts.regular,
    flex: 1,
    marginRight: 10,
  },

});