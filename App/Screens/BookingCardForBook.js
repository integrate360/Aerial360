// import React, {useEffect, useState, useContext} from 'react';
// import {
//   View,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   Button,
// } from 'react-native';
// import {Avatar, Text} from 'react-native-paper';
// import LinearGradient from 'react-native-linear-gradient';
// import {Colors} from './Config/Config';
// import {useNavigation, useRoute} from '@react-navigation/native';
// import HeaderComponent from './Header/HeaderComponent';
// import {getAllClasses} from './Api/Allapi';
// import BookingCalender from './Bookings/BookingCalender';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import fonts from './FontFamily/FontFamily';
// import Icons from 'react-native-vector-icons/Ionicons';
// import UserContext from '../context/UserContext';
// const BookingCardForBook = ({
//   hide,
//   userData,
//   activeTab,
//   date,
//   All,
//   classes,
// }) => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const id = route?.params?.item;
//   const bool = route?.params?.bool;
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [noData, setNoData] = useState(false);
//   const [showCalendar, setShowCalendar] = useState(false);
//   const [demodata, setDemodata] = useState([]);
//   const {locations} = useContext(UserContext);

//   const filterByDatesAndLocation = (array, day, locations) => {
//     return array?.filter(e =>
//       e?.availability?.some(
//         availability =>
//           availability?.day === day &&
//           availability?.locations?.some(res =>
//             res?.name?.toLowerCase()?.includes(locations?.toLowerCase()),
//           ),
//       ),
//     );
//   };

//   const fetchClasses = async () => {
//     try {
//       setLoading(true);
//       if (!classes) return;

//       if (bool) {
//         const filteredData = classes.filter(item => item?.category?._id === id);
//         setData(filteredData);
//       } else {
//         if (All) {
//           const filteredData = filterByDatesAndLocation(
//             classes,
//             date,
//             locations,
//           );
//           setData(filteredData);
//         } else {
//           const filteredData = classes.filter(
//             item => item?.category?._id === activeTab,
//           );

//           let filteredByDayAndLocation = filteredData;
//           if (locations && date) {
//             filteredByDayAndLocation = filterByDatesAndLocation(
//               filteredData,
//               date,
//               locations,
//             );
//           }
//           setNoData(filteredByDayAndLocation.length === 0);
//           setData(filteredByDayAndLocation);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching classes:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchClasses();
//   }, [id, userData, activeTab, date, All, locations]);

//   const convertTo12HourFormat = time24 => {
//     if (!time24 || typeof time24 !== 'string') {
//       // Handle the invalid time input here
//       return 'Invalid time';
//     }

//     const [hours, minutes] = time24.split(':').map(Number);

//     // Determine AM or PM
//     const period = hours >= 12 ? 'PM' : 'AM';

//     // Additional logic for 12-hour format conversion
//     const adjustedHours = hours % 12 || 12;

//     // Ensure minutes are always two digits
//     const formattedMinutes = minutes?.toString()?.padStart(2, '0');

//     return `${adjustedHours}:${formattedMinutes} ${period}`;
//   };

//   const renderItem = ({item}) => {
//     const time = item?.availability?.[0]?.time; // Display only the first time
//     const maxPeople = item?.availability?.[0]?.maxPeople; // Display only the first time
//     const trainers = item?.availability?.[0]?.trainers[0]?.name;
//     const locationsData = [
//       ...new Set(
//         item?.availability.flatMap(res =>
//           res.locations.map(location => location.name),
//         ),
//       ),
//     ];

//     return (
//       <View style={styles.card}>
//         <TouchableOpacity
//           activeOpacity={0.8}
//           onPress={() =>
//             navigation.navigate('CalendarDetails', {item, categoryId: id})
//           }>
//           <View style={styles.rowContainer}>
//             <LinearGradient
//               colors={[Colors.primary, Colors.secondary]}
//               start={{x: 0.0, y: 0.2}}
//               end={{x: 0.7, y: 1.0}}
//               style={{
//                 marginRight: 10,
//                 bottom: 30,
//                 elevation: 4,
//                 borderRadius: 50,
//                 padding: 5,
//               }}>
//               <Avatar.Image
//                 size={90}
//                 source={{
//                   uri: item?.image?.[0],
//                 }}
//               />
//             </LinearGradient>
//             <View style={styles.textContainer}>
//               <Text style={styles.title}>{item?.name}</Text>

//               <View style={{flexDirection: 'row'}}>
//                 <Text
//                   style={{color: Colors?.secondary, fontFamily: fonts.regular}}>
//                   {convertTo12HourFormat(time)}
//                 </Text>
//                 <Text>{'    |'}</Text>
//                 <Text
//                   style={{
//                     color: Colors.secondary,
//                     left: 10,
//                     fontFamily: fonts.regular,
//                   }}>
//                   <Icon
//                     name="user"
//                     size={14}
//                     color={Colors?.secondary}
//                     style={{marginRight: 5}}
//                   />
//                   {'  '}
//                   {maxPeople}
//                 </Text>
//               </View>
//               <Text style={styles.description}>Instructor: {trainers}</Text>

//               <View
//                 style={{
//                   borderRadius: 8,
//                   flexDirection: 'row',
//                   top: 5,
//                 }}>
//                 <Icons name="location" size={20} color={Colors.primary} />

//                 <Text
//                   style={{
//                     fontSize: 15,
//                     color: '#333',
//                     marginHorizontal: 5,
//                     fontFamily: fonts.regular,
//                   }}>
//                   {locationsData?.join(' | ')}
//                 </Text>
//               </View>
//             </View>
//           </View>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   return (
//     <>
//       {hide == true ? null : <HeaderComponent Arrow={true} />}
//       {showCalendar ? (
//         <BookingCalender data={demodata} arrows={true} />
//       ) : (
//         <ScrollView
//           style={{padding: 8}}
//           contentContainerStyle={{paddingBottom: 10}}
//           showsVerticalScrollIndicator={false}>
//           {loading ? (
//             <ActivityIndicator size="large" color={Colors.primary} />
//           ) : noData ? (
//             // Display message if no data is found
//             <Text style={styles.noDataText}>No classes found.</Text>
//           ) : (
//             <>
//               <Text
//                 style={{
//                   color: 'black',
//                   marginTop: 20,
//                   marginBottom: 10,
//                   fontWeight: 700,
//                   fontSize: 20,
//                 }}>
//                 Classes{' '}
//               </Text>
//               <FlatList
//                 data={data} // Use filtered data
//                 keyExtractor={item => item?._id ?? item?.id}
//                 renderItem={renderItem}
//                 scrollEnabled={false}
//               />
//             </>
//           )}
//         </ScrollView>
//       )}
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     padding: 13,
//     marginBottom: 16,
//     backgroundColor: 'white',
//     borderRadius: 8,
//     elevation: 3,
//     margin: 15,
//     marginHorizontal: 8,
//     top: 5,
//   },
//   rowContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   avatarContainer: {
//     marginRight: 12,
//   },
//   textContainer: {
//     flex: 1,
//     bottom: 10,
//   },
//   title: {
//     fontSize: 18,
//     // fontWeight: 'bold',
//     color: '#333',
//     fontFamily: fonts.regular,
//   },
//   description: {
//     fontSize: 15,
//     color: '#666',
//     marginTop: 4,
//     fontFamily: fonts.regular,
//   },
//   buttonContainer: {
//     marginLeft: 12,
//   },
//   demoText: {
//     marginTop: 12,
//     fontSize: 14,
//     color: '#999',
//   },
//   noDataText: {
//     fontSize: 16,
//     color: 'gray',
//     textAlign: 'center',
//     marginTop: 20,
//   },
// });

// export default BookingCardForBook;
import React, {useEffect, useState, useContext} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Text,
} from 'react-native';
import {Avatar} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from './Config/Config';
import {useNavigation, useRoute} from '@react-navigation/native';
import HeaderComponent from './Header/HeaderComponent';
import Icon from 'react-native-vector-icons/FontAwesome';
import fonts from './FontFamily/FontFamily';
import Icons from 'react-native-vector-icons/Ionicons';
import UserContext from '../context/UserContext';

const BookingCardForBook = ({
  hide,
  userData,
  activeTab,
  date,
  All,
  classes,
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const id = route?.params?.item;
  const bool = route?.params?.bool;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [demodata, setDemodata] = useState([]);
  const {locations} = useContext(UserContext);

  const filterClasses = () => {
    try {
      setLoading(true);
      if (!classes) return;

      // Step 1: Filter by category if not showing all
      let filteredData = All
        ? [...classes]
        : classes.filter(item => item?.category?._id === activeTab);

      // Step 2: Filter by date and location
      filteredData = filteredData.filter(classItem => {
        // Find all availability slots that match the selected day
        const daySlots = classItem.availability.filter(
          avail => avail?.day === date,
        );

        // If location is specified, filter slots by location
        const locationFilteredSlots = locations
          ? daySlots.filter(avail =>
              avail.locations.some(loc =>
                loc?.name?.toLowerCase().includes(locations.toLowerCase()),
              ),
            )
          : daySlots;

        // Only include class if there are matching slots
        return locationFilteredSlots.length > 0;
      });

      // Flatten the structure to show each availability slot as a separate item
      const flattenedData = filteredData.flatMap(classItem => {
        const matchingSlots = classItem.availability.filter(avail => {
          const dayMatch = avail?.day === date;
          const locationMatch = locations
            ? avail.locations.some(loc =>
                loc?.name?.toLowerCase().includes(locations.toLowerCase()),
              )
            : true;
          return dayMatch && locationMatch;
        });

        return matchingSlots.map(slot => ({
          ...classItem,
          slotDetails: slot, // Include the specific slot details
        }));
      });

      // Sort by time
      flattenedData.sort((a, b) =>
        a.slotDetails.time.localeCompare(b.slotDetails.time),
      );

      setNoData(flattenedData.length === 0);
      setData(flattenedData);
    } catch (error) {
      console.error('Error filtering classes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classes && date !== undefined) {
      filterClasses();
    }
  }, [classes, date, locations, activeTab, All]);

  const convertTo12HourFormat = time24 => {
    if (!time24 || typeof time24 !== 'string') {
      return 'Invalid time';
    }

    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const adjustedHours = hours % 12 || 12;
    const formattedMinutes = minutes?.toString()?.padStart(2, '0');

    return `${adjustedHours}:${formattedMinutes} ${period}`;
  };

  const renderItem = ({item}) => {
    const time = item.slotDetails?.time;
    const maxPeople = item.slotDetails?.maxPeople;
    const trainers = item.slotDetails?.trainers
      ?.map(trainer => trainer?.name)
      ?.filter(Boolean)
      ?.join(', ');

    const locationsData = [
      ...new Set(
        item.slotDetails?.locations?.map(location => location?.name) || [],
      ),
    ];

    return (
      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate('CalendarDetails', {
              item,
              categoryId: id,
              slotDetails: item.slotDetails,
            })
          }>
          <View style={styles.rowContainer}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{x: 0.0, y: 0.2}}
              end={{x: 0.7, y: 1.0}}
              style={{
                marginRight: 10,
                bottom: 30,
                elevation: 4,
                borderRadius: 50,
                padding: 5,
              }}>
              <Avatar.Image
                size={90}
                source={{
                  uri: item?.image?.[0],
                }}
              />
            </LinearGradient>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item?.name}</Text>

              <View style={{flexDirection: 'row'}}>
                <Text
                  style={{color: Colors?.secondary, fontFamily: fonts.regular}}>
                  {convertTo12HourFormat(time)}
                </Text>
                <Text>{'    |'}</Text>
                <Text
                  style={{
                    color: Colors.secondary,
                    left: 10,
                    fontFamily: fonts.regular,
                  }}>
                  <Icon
                    name="user"
                    size={14}
                    color={Colors?.secondary}
                    style={{marginRight: 5}}
                  />
                  {'  '}
                  {maxPeople}
                </Text>
              </View>
              <Text style={styles.description}>Instructor: {trainers}</Text>

              <View
                style={{
                  borderRadius: 8,
                  flexDirection: 'row',
                  top: 5,
                }}>
                <Icons name="location" size={20} color={Colors.primary} />
                <Text
                  style={{
                    fontSize: 15,
                    color: '#333',
                    marginHorizontal: 5,
                    fontFamily: fonts.regular,
                  }}>
                  {locationsData?.join(' | ')}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      {hide == true ? null : <HeaderComponent Arrow={true} />}
      {showCalendar ? (
        <BookingCalender data={demodata} arrows={true} />
      ) : (
        <ScrollView
          style={{padding: 8}}
          contentContainerStyle={{paddingBottom: 10}}
          showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} />
          ) : noData ? (
            <Text style={styles.noDataText}>No classes found.</Text>
          ) : (
            <>
              <Text
                style={{
                  color: 'black',
                  marginTop: 20,
                  marginBottom: 10,
                  fontWeight: '700',
                  fontSize: 20,
                }}>
                Classes{' '}
              </Text>
              <FlatList
                data={data}
                keyExtractor={(item, index) => `${item._id}-${index}`}
                renderItem={renderItem}
                scrollEnabled={false}
              />
            </>
          )}
        </ScrollView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 13,
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 3,
    margin: 15,
    marginHorizontal: 8,
    top: 5,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    bottom: 10,
  },
  title: {
    fontSize: 18,
    color: '#333',
    fontFamily: fonts.regular,
  },
  description: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
    fontFamily: fonts.regular,
  },
  noDataText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default BookingCardForBook;