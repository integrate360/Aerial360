// import React, {useState, useEffect, useRef, useContext} from 'react';
// import {
//   StyleSheet,
//   TouchableOpacity,
//   View,
//   FlatList,
//   Image,
//   Modal,
//   Text,
//   ActivityIndicator,
//   ScrollView,
//   useWindowDimensions,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import HeaderComponent from '../Header/HeaderComponent';
// import {Colors} from '../Config/Config';
// import {Calendar} from 'react-native-calendars';
// import moment from 'moment';
// import {useNavigation, useRoute} from '@react-navigation/native';
// import {getAllCategerys} from '../Api/Allapi';
// import WeeklyChart from '../Bookings/BookingCalender';
// import BookingCard from '../BookingCard';
// import fonts from '../FontFamily/FontFamily';
// import {getAllClasses} from '../Api/Allapi';
// import {List, Button, IconButton} from 'react-native-paper';
// import UserContext from '../../context/UserContext';
// import BookingCardForBook from '../BookingCardForBook';
// const CalendarScreen = () => {
//   const today = moment()?.format('YYYY-MM-DD');
//   const dateListRef = useRef(null);
//   const [activeDate, setActiveDate] = useState(today);
//   const [selectedMonth, setSelectedMonth] = useState(
//     moment().format('YYYY-MM'),
//   );
//   const [dates, setDates] = useState([]);
//   const [showCalendar, setShowCalendar] = useState(false);
//   const [formattedDate, setFormattedDate] = useState('');
//   const [categories, setCategories] = useState([]);
//   const [date, setDate] = useState(moment().get('day'));
//   const [activeTab, setActiveTab] = useState('');
//   const [allState, setAllState] = useState(false);
//   const [show, setShow] = useState(false);
//   const [locations, setLocations] = useState([]);
//   const navigation = useNavigation();
//   const route = useRoute();
//   const item = route?.params?.item;
//   const bool = route?.params?.Arrows;
//   const [changetitle, setChangeTitle] = useState(bool);
//   const {saveLocation, refreshData} = useContext(UserContext);
//   const [bottom, setBottom] = useState(false);
//   const [shareit, setShareit] = useState('');
//   const [classes, setClasses] = useState();
//   useEffect(() => {
//     getAllCategerys()
//       .then(res => {
//         if (res?.status == 200) {
//           setCategories(res?.data);
//           setActiveTab(res?.data[0]?._id);
//         } else {
//           console.error('Error fetching categories:', res.message);
//         }
//       })
//       .catch(err => console.error('API Error:', err));
//   }, []);
//   const {height} = useWindowDimensions();

//   useEffect(() => {
//     generateDates(selectedMonth);
//     const formatted = moment(today).format('dddd, MMM D');
//     setFormattedDate(formatted);
//   }, [selectedMonth]);

//   const generateDates = () => {
//     const today = moment(); // Current date
//     const endOfMonth = moment(today).endOf('month'); // Last day of the current month

//     const allDates = [];
//     let currentDate = today.clone(); // Clone to avoid mutating `today`

//     // Loop from current date to the end of the current month
//     while (currentDate.isSameOrBefore(endOfMonth, 'day')) {
//       allDates.push({
//         day: currentDate.date(),
//         dayName: currentDate.format('ddd'),
//         fullDate: currentDate.format('YYYY-MM-DD'), // Optional full date format
//       });
//       currentDate.add(1, 'day'); // Move to the next day
//     }

//     setDates(allDates); // Assuming `setDates` is a state updater
//   };

//   useEffect(() => {
//     getAllClasses()
//       .then(res => {
//         if (res?.data) {
//           setClasses(res?.data);
//           const locationNames = res?.data?.flatMap(item =>
//             item?.availability.flatMap(avail =>
//               avail?.locations
//                 .filter(location => location?.name)
//                 .map(location => location?.name),
//             ),
//           );
//           const uniqueLocations = [...new Set(locationNames)];

//           const rearrangedLocations = uniqueLocations.sort((a, b) => {
//             if (a === 'Khar') return -1;
//             if (b === 'Khar') return 1;
//             return 0;
//           });
//           setLocations(rearrangedLocations);
//         }
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   const handleDayPress = day => {
//     setDate(moment(day?.dateString).get('day'));
//     const selectedMonthYear = moment(day.dateString).format('YYYY-MM');
//     setSelectedMonth(selectedMonthYear);
//     generateDates(selectedMonthYear);
//     setActiveDate(day?.dateString);
//     const formatted = moment(day?.dateString)?.format('dddd, MMM D');
//     setFormattedDate(formatted);

//     const selectedIndex = dates.findIndex(
//       item =>
//         moment(
//           `${selectedMonth}-${item.day < 10 ? '0' : ''}${item.day}`,
//         ).format('YYYY-MM-DD') === day.dateString,
//     );

//     if (selectedIndex !== -1 && dateListRef?.current) {
//       dateListRef?.current?.scrollToIndex({
//         index: selectedIndex,
//         animated: true,
//       });
//     }
//   };
//   const toggleAllState = () => {
//     // if (!allState) setActiveTab('All');
//     setAllState(sates => !sates);
//   };

//   const renderTabItem = ({item}) => {
//     const isActiveTab = activeTab === item?._id;

//     // Define styles based on whether the tab is active
//     const tabTextStyle = [
//       styles.tabText,
//       isActiveTab &&
//         !allState && {
//           fontSize: 12,
//           backgroundColor: 'white',
//           padding: 10,
//           borderRadius: 5,
//           alignItems: 'center',
//           color: Colors.primary,
//         },
//       !isActiveTab && {
//         fontSize: 12,
//         alignItems: 'center',
//         color: '#f8f8f8',
//       },
//     ];

//     return (
//       <TouchableOpacity
//         key={item?._id}
//         style={[styles.tabButton, isActiveTab && {}]}
//         onPress={() => {
//           setAllState(false);
//           setActiveTab(item?._id);
//           setChangeTitle(false);
//         }}>
//         <Text style={tabTextStyle}>{item?.title?.toUpperCase()}</Text>
//       </TouchableOpacity>
//     );
//   };

//   const renderDateItem = ({item, index}) => {
//     const date = moment(
//       `${selectedMonth}-${item?.day < 10 ? '0' : ''}${item?.day}`,
//     ).format('YYYY-MM-DD');
//     const isPastDate = moment(date).isBefore(today);

//     return (
//       <TouchableOpacity
//         key={item?._id}
//         style={{
//           alignItems: 'center',
//           marginHorizontal: 4,
//           ...(activeDate === date && {
//             backgroundColor: '#fff',
//             borderRadius: 25,
//             borderWidth: 2,
//             borderColor: '#fff',
//           }),
//         }}
//         onPress={() => {
//           if (!isPastDate) {
//             setActiveDate(date);
//             handleDayPress({dateString: date});
//           }
//         }}
//         disabled={isPastDate}>
//         <View
//           style={{
//             width: 50,
//             height: 50,
//             borderRadius: 25,
//             backgroundColor: '#fff',
//             justifyContent: 'center',
//             alignItems: 'center',
//             borderWidth: 1,
//             borderColor: '#777',
//             ...(activeDate === date && {
//               backgroundColor: Colors.primary,
//               borderColor: '#fff',
//             }),
//             ...(isPastDate && {
//               backgroundColor: '#f0f0f0',
//               borderColor: '#ccc',
//             }),
//           }}>
//           <Text
//             style={{
//               fontSize: 17,
//               color: activeDate === date ? '#fff' : '#777',
//               //  fontWeight: 'bold',
//               fontFamily: fonts.regular,
//             }}>
//             {item?.day}
//           </Text>
//         </View>

//         <Text
//           style={{
//             fontSize: 14,
//             color: activeDate === date ? Colors.primary : '#777',
//             marginTop: 5,
//             ...(isPastDate && {
//               color: '#ccc',
//               fontFamily: fonts.regular,
//             }),
//           }}>
//           {item?.dayName}
//         </Text>
//       </TouchableOpacity>
//     );
//   };

//   const renderUserItem = ({item}) => {
//     const formatDate = dateString => {
//       const date = new Date(dateString);
//       return new Intl.DateTimeFormat('en-US', {
//         weekday: 'long',
//         month: 'short',
//         day: 'numeric',
//       }).format(date);
//     };

//     return (
//       <TouchableOpacity
//         style={{margin: 5, borderRadius: 8, padding: 12}}
//         onPress={() => navigation.navigate('CalendarDetails', {item: item})}>
//         <View style={{flexDirection: 'row', alignItems: 'center'}}>
//           <Image
//             source={{uri: item?.picture?.large}}
//             style={{width: 60, height: 60, borderRadius: 30, marginRight: 10}}
//           />

//           <View>
//             <Text style={{fontSize: 20, fontWeight: 'bold', color: '#555'}}>
//               {item?.name?.first} {item?.name?.last}
//             </Text>

//             <Text style={{fontSize: 14, color: '#666', fontWeight: '500'}}>
//               Location: {item?.location?.city}
//             </Text>
//             <Text style={{fontSize: 14, color: '#666', fontWeight: '500'}}>
//               {formatDate(item?.registered?.date)}
//             </Text>
//           </View>
//         </View>
//         <View style={{borderWidth: 0.2, top: 20, opacity: 0.2}}></View>
//       </TouchableOpacity>
//     );
//   };

//   const openBottomSheets = val => {
//     setBottom(val);
//   };

//   const saveLocationsdata = data => {
//     saveLocation(data);
//     refreshData();
//     setBottom(false);
//     setShareit(data);
//   };
//   return (
//     <>
//       <HeaderComponent
//         onOpenCalendar={() => setShowCalendar(!showCalendar)}
//         TrueFun={true}
//         Arrow={bool}
//         openBottom={val => openBottomSheets(val)}
//         shareit={shareit}
//       />

//       <View style={{backgroundColor: '#fff', flex: 1}}>
//         <LinearGradient
//           colors={[Colors.primary, Colors.secondary]}
//           start={{x: 0.0, y: 0.2}}
//           end={{x: 0.5, y: 1.0}}
//           style={styles.tabContainer}>
//           <TouchableOpacity
//             style={{
//               marginLeft: 15,
//             }}
//             onPress={() => toggleAllState()}>
//             <Text
//               style={{
//                 fontSize: 18,
//                 fontFamily: fonts.regular,
//                 alignItems: 'center',
//                 backgroundColor: allState ? 'white' : 'transparent',
//                 color: allState ? Colors.primary : 'white',
//                 padding: 5,
//                 marginVertical: 11,
//                 borderRadius: 5,
//                 alignItems: 'center',
//                 paddingHorizontal: 15,
//               }}>
//               {/* {allState ? ' All' : 'Date'} */}
//               All
//             </Text>
//           </TouchableOpacity>

//           <FlatList
//             data={categories}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             keyExtractor={item => item?.id}
//             renderItem={renderTabItem}
//             contentContainerStyle={styles.flatListContent}
//             // ItemSeparatorComponent={() => <View style={{width: 10}} />}
//             style={{marginLeft: 20}}
//           />
//         </LinearGradient>

//         {changetitle === true ? (
//           <View style={{flex: 1}}>
//             <WeeklyChart data={item} />
//           </View>
//         ) : (
//           <ScrollView contentContainerStyle={{paddingBottom: 200}}>
//             {show ? null : showCalendar ? (
//               <LinearGradient
//                 colors={['#fff', '#fff']}
//                 start={{x: 0.0, y: 0.2}}
//                 end={{x: 0.7, y: 1.0}}
//                 style={styles.calendarContainer}>
//                 <View style={{paddingHorizontal: 10}}>
//                   <FlatList
//                     ref={dateListRef}
//                     data={dates}
//                     horizontal
//                     showsHorizontalScrollIndicator={false}
//                     keyExtractor={item => item?.day?.toString()}
//                     renderItem={renderDateItem}
//                     contentContainerStyle={styles.flatListContent}
//                     ItemSeparatorComponent={() => <View style={{}} />}
//                     getItemLayout={(data, index) => ({
//                       length: 58,
//                       offset: 58 * index,
//                       index,
//                     })}
//                   />
//                 </View>
//               </LinearGradient>
//             ) : (
//               <Calendar
//                 current={today}
//                 minDate={today}
//                 onDayPress={handleDayPress}
//                 markedDates={{
//                   [activeDate]: {selected: true, selectedColor: Colors.primary},
//                 }}
//                 hideArrows={false}
//                 hideExtraDays={true}
//                 style={{
//                   marginBottom: 20,
//                 }}
//                 theme={{
//                   textDayFontFamily: fonts.regular,
//                   textMonthFontFamily: fonts.regular,
//                   textDayHeaderFontFamily: fonts.regular,
//                 }}></Calendar>
//             )}

//             <View
//               style={{padding: 10, alignItems: 'flex-start', marginLeft: 10}}>
//               <Text
//                 style={{
//                   fontSize: 18,
//                   color: '#777',
//                   fontFamily: fonts.regular,
//                 }}>
//                 {formattedDate || 'Select a date'}
//               </Text>
//             </View>

//             <BookingCardForBook
//               hide={true}
//               activeTab={activeTab}
//               userData={activeDate}
//               date={date}
//               All={allState}
//               onOpenCalendar={() => setShow(!show)}
//               arrows={true}
//               classes={classes}
//             />
//           </ScrollView>
//         )}
//       </View>

//       <Modal
//         animationType="fade"
//         transparent={true}
//         visible={bottom}
//         onRequestClose={() => setBottom(false)}>
//         <View
//           style={{
//             flex: 1,
//             justifyContent: 'flex-end',
//             backgroundColor: 'rgba(0, 0, 0, 0.5)',
//           }}>
//           <View
//             style={{
//               backgroundColor: 'white',
//               height: height * 0.3, // Responsive height
//               justifyContent: 'center',
//               alignItems: 'center',
//               borderTopLeftRadius: 20,
//               borderTopRightRadius: 20,
//               padding: 16,
//               position: 'relative',
//             }}>
//             <IconButton
//               icon="close"
//               size={24}
//               iconColor={Colors.secondary}
//               onPress={() => setBottom(false)}
//               style={{
//                 position: 'absolute',
//                 top: 16,
//                 right: 16,
//               }}
//             />
//             <Text
//               style={{
//                 fontSize: 18,
//                 marginBottom: 12,
//                 fontFamily: fonts.regular,
//               }}>
//               Select Location
//             </Text>

//             <View style={{width: '100%'}}>
//               {locations.map((location, index) => (
//                 <List.Item
//                   key={index}
//                   title={location}
//                   onPress={() => {
//                     saveLocationsdata(location);
//                   }}
//                   titleStyle={{fontFamily: fonts.regular}}
//                   left={() => (
//                     <List.Icon icon="map-marker" color={Colors.primary} />
//                   )}
//                   style={{
//                     borderBottomWidth: 1,
//                     borderBottomColor: '#ddd',
//                     paddingVertical: 8,
//                   }}
//                 />
//               ))}
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </>
//   );
// };

// // if (All == true) {
// //     useEffect(() => {
// //       getAllClasses()
// //         .then(res => {
// //           if (res?.data) {
// //             const filterByDates = () => {
// //               return res?.data?.filter(e =>
// //                 e?.availability?.some(e => e?.day == date),
// //               );
// //             };
// //             setData(filterByDates);
// //           }
// //         })
// //         .finally(() => setLoading(false));
// //     }, [id, userData, activeTab, date, All]);
// //   }
// //Smooth Accordion
// const styles = StyleSheet.create({
//   calendarContainer: {
//     paddingVertical: 13,
//   },
//   flatListContent: {
//     alignItems: 'center',
//     paddingHorizontal: 10,
//   },
//   tabContainer: {
//     display: 'flex',
//     flexDirection: 'row',
//     alignItems: 'center',
//     elevation: 3,
//     paddingVertical: 10,
//     backgroundColor: Colors.secondary,
//   },
//   tabButton: {
//     paddingVertical: 15,
//     paddingHorizontal: 17,
//     borderRadius: 20,
//     alignItems: 'center',
//   },
//   tabText: {
//     color: '#fff',
//     fontFamily: fonts.regular,
//   },
//   card: {
//     margin: 10,
//     borderRadius: 10,
//     elevation: 3,
//     backgroundColor: '#fff',
//   },
//   image: {
//     width: '100%',
//     height: 200,
//     borderTopLeftRadius: 10,
//     borderTopRightRadius: 10,
//   },
//   cardContent: {
//     padding: 15,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   description: {
//     fontSize: 14,
//     marginBottom: 10,
//     color: '#555',
//   },
//   locationText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginTop: 10,
//   },
//   calendarIconContainer: {
//     alignItems: 'flex-end',
//     marginRight: 10,
//   },
//   modalBackground: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContainer: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 10,
//     marginTop: 40,
//   },
//   closeButton: {
//     marginTop: 20,
//     padding: 10,
//     backgroundColor: Colors.primary,
//     borderRadius: 5,
//     alignItems: 'center',
//   },
//   closeButtonText: {
//     color: '#fff',
//     fontSize: 16,
//   },
// });

// export default CalendarScreen;
import React, {useState, useEffect, useRef, useContext} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  FlatList,
  Image,
  Modal,
  Text,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import HeaderComponent from '../Header/HeaderComponent';
import {Colors} from '../Config/Config';
import {Calendar} from 'react-native-calendars';
import moment from 'moment';
import {useNavigation, useRoute} from '@react-navigation/native';
import {getAllCategerys} from '../Api/Allapi';
import WeeklyChart from '../Bookings/BookingCalender';
import BookingCard from '../BookingCard';
import fonts from '../FontFamily/FontFamily';
import {getAllClasses} from '../Api/Allapi';
import {List, Button, IconButton} from 'react-native-paper';
import UserContext from '../../context/UserContext';
import BookingCardForBook from '../BookingCardForBook';
const CalendarScreen = () => {
  const today = moment()?.format('YYYY-MM-DD');
  const dateListRef = useRef(null);
  const [activeDate, setActiveDate] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(
    moment().format('YYYY-MM'),
  );
  const [dates, setDates] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [formattedDate, setFormattedDate] = useState('');
  const [categories, setCategories] = useState([]);
  const [date, setDate] = useState(moment().get('day'));
  // const [activeTab, setActiveTab] = useState('');
  // const [allState, setAllState] = useState(false);
  const [allState, setAllState] = useState(true); // All selected by default
  const [activeTab, setActiveTab] = useState('All'); // "All" as the initial tab
  const [show, setShow] = useState(false);
  const [locations, setLocations] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const item = route?.params?.item;
  const bool = route?.params?.Arrows;
  const [changetitle, setChangeTitle] = useState(bool);
  const {saveLocation, refreshData} = useContext(UserContext);
  const [bottom, setBottom] = useState(false);
  const [shareit, setShareit] = useState('');
  const [classes, setClasses] = useState();
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   getAllCategerys()
  //     .then(res => {
  //       if (res?.status == 200) {
  //         setCategories(res?.data);
  //         setActiveTab(res?.data[0]?._id);
  //       } else {
  //         console.error('Error fetching categories:', res.message);
  //       }
  //     })
  //     .catch(err => console.error('API Error:', err));
  // }, []);
  useEffect(() => {
    getAllCategerys()
      .then(res => {
        if (res?.status == 200) {
          setCategories(res?.data);
          // Don't setActiveTab here since "All" is the default
        } else {
          console.error('Error fetching categories:', res.message);
        }
      })
      .catch(err => console.error('API Error:', err));
  }, []);
  const {height} = useWindowDimensions();

  useEffect(() => {
    const formatted = moment(activeDate).format('dddd, MMM D');
    setFormattedDate(formatted);
  }, [activeDate]);

  const generateDates = (dateString = moment().format('YYYY-MM')) => {
    const startOfMonth = moment(dateString + '-01');
    const endOfMonth = moment(dateString + '-01').endOf('month');

    const allDates = [];
    let currentDate = startOfMonth.clone();

    while (currentDate.isSameOrBefore(endOfMonth, 'day')) {
      allDates.push({
        day: currentDate.date(),
        dayName: currentDate.format('ddd'),
        fullDate: currentDate.format('YYYY-MM-DD'),
      });
      currentDate.add(1, 'day');
    }

    setDates(allDates);
  };

  useEffect(() => {
    getAllClasses()
      .then(res => {
        if (res?.data) {
          setClasses(res?.data);
          const locationNames = res?.data?.flatMap(item =>
            item?.availability.flatMap(avail =>
              avail?.locations
                .filter(location => location?.name)
                .map(location => location?.name),
            ),
          );
          const uniqueLocations = [...new Set(locationNames)];

          const rearrangedLocations = uniqueLocations.sort((a, b) => {
            if (a === 'Khar') return -1;
            if (b === 'Khar') return 1;
            return 0;
          });
          setLocations(rearrangedLocations);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDayPress = day => {
    setDate(moment(day?.dateString).get('day'));
    const selectedMonthYear = moment(day.dateString).format('YYYY-MM');
    setSelectedMonth(selectedMonthYear);
    generateDates(selectedMonthYear);
    setActiveDate(day?.dateString);

    const formatted = moment(day?.dateString)?.format('dddd, MMM D');
    setFormattedDate(formatted);

    const selectedIndex = dates.findIndex(
      item =>
        moment(
          `${selectedMonth}-${item.day < 10 ? '0' : ''}${item.day}`,
        ).format('YYYY-MM-DD') === day.dateString,
    );

    if (selectedIndex !== -1 && dateListRef?.current) {
      dateListRef?.current?.scrollToIndex({
        index: selectedIndex,
        animated: true,
      });
    }
  };

  // const toggleAllState = () => {
  //   setAllState(prev => {
  //     const newState = !prev;
  //     if (newState) {
  //       setActiveTab('All'); // Mark special case
  //     } else {
  //       setActiveTab(categories[0]?._id); // Reset to first tab if needed
  //     }
  //     return newState;
  //   });
  // };
  const toggleAllState = () => {
    setAllState(prev => !prev);
    setActiveTab(''); // Clear active tab when showing all
    setChangeTitle(false);
  };
  // const renderTabItem = ({item}) => {
  //   const isActiveTab = activeTab === item?._id;

  //   // Define styles based on whether the tab is active
  //   const tabTextStyle = [
  //     styles.tabText,
  //     isActiveTab &&
  //       !allState && {
  //         fontSize: 12,
  //         backgroundColor: 'white',
  //         padding: 10,
  //         borderRadius: 5,
  //         alignItems: 'center',
  //         color: Colors.primary,
  //       },
  //     !isActiveTab && {
  //       fontSize: 12,
  //       alignItems: 'center',
  //       color: '#f8f8f8',
  //     },
  //   ];

  //   return (
  //     <TouchableOpacity
  //       key={item?._id}
  //       style={[styles.tabButton, isActiveTab && {}]}
  //       onPress={() => {
  //         setAllState(false);
  //         setActiveTab(item?._id);
  //         setChangeTitle(false);
  //       }}>
  //       <Text style={tabTextStyle}>{item?.title?.toUpperCase()}</Text>
  //     </TouchableOpacity>
  //   );
  // };
  const renderTabItem = ({item}) => {
    const isActiveTab = !allState && activeTab === item?._id;
    const tabTextStyle = [
      styles.tabText,
      isActiveTab &&
        !allState && {
          fontSize: 12,
          backgroundColor: 'white',
          padding: 10,
          borderRadius: 5,
          alignItems: 'center',
          color: Colors.primary,
        },
      !isActiveTab && {
        fontSize: 12,
        alignItems: 'center',
        color: '#f8f8f8',
      },
    ];

    return (
      <TouchableOpacity
        key={item?._id}
        style={[styles.tabButton, isActiveTab && {}]}
        onPress={() => {
          setAllState(false);
          setActiveTab(item?._id);
          setChangeTitle(false);
        }}>
        <Text style={tabTextStyle}>{item?.title?.toUpperCase()}</Text>
      </TouchableOpacity>
    );
  };
  const renderDateItem = ({item, index}) => {
    const date = moment(
      `${selectedMonth}-${item?.day < 10 ? '0' : ''}${item?.day}`,
    ).format('YYYY-MM-DD');
    const isPastDate = moment(date).isBefore(today);

    return (
      <TouchableOpacity
        key={item?._id}
        style={{
          alignItems: 'center',
          marginHorizontal: 4,
          ...(activeDate === date && {
            backgroundColor: '#fff',
            borderRadius: 25,
            borderWidth: 2,
            borderColor: '#fff',
          }),
        }}
        onPress={() => {
          if (!isPastDate) {
            setActiveDate(date);
            handleDayPress({dateString: date});
          }
        }}
        disabled={isPastDate}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: '#fff',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#777',
            ...(activeDate === date && {
              backgroundColor: Colors.primary,
              borderColor: '#fff',
            }),
            ...(isPastDate && {
              backgroundColor: '#f0f0f0',
              borderColor: '#ccc',
            }),
          }}>
          <Text
            style={{
              fontSize: 17,
              color: activeDate === date ? '#fff' : '#777',
              //  fontWeight: 'bold',
              fontFamily: fonts.regular,
            }}>
            {item?.day}
          </Text>
        </View>

        <Text
          style={{
            fontSize: 14,
            color: activeDate === date ? Colors.primary : '#777',
            marginTop: 5,
            ...(isPastDate && {
              color: '#ccc',
              fontFamily: fonts.regular,
            }),
          }}>
          {item?.dayName}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderUserItem = ({item}) => {
    const formatDate = dateString => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }).format(date);
    };

    return (
      <TouchableOpacity
        style={{margin: 5, borderRadius: 8, padding: 12}}
        onPress={() => navigation.navigate('CalendarDetails', {item: item})}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image
            source={{uri: item?.picture?.large}}
            style={{width: 60, height: 60, borderRadius: 30, marginRight: 10}}
          />

          <View>
            <Text style={{fontSize: 20, fontWeight: 'bold', color: '#555'}}>
              {item?.name?.first} {item?.name?.last}
            </Text>

            <Text style={{fontSize: 14, color: '#666', fontWeight: '500'}}>
              Location: {item?.location?.city}
            </Text>
            <Text style={{fontSize: 14, color: '#666', fontWeight: '500'}}>
              {formatDate(item?.registered?.date)}
            </Text>
          </View>
        </View>
        <View style={{borderWidth: 0.2, top: 20, opacity: 0.2}}></View>
      </TouchableOpacity>
    );
  };

  const openBottomSheets = val => {
    setBottom(val);
  };

  const saveLocationsdata = data => {
    saveLocation(data);
    refreshData();
    setBottom(false);
    setShareit(data);
  };
  return (
    <>
      <HeaderComponent
        onOpenCalendar={() => setShowCalendar(!showCalendar)}
        TrueFun={true}
        Arrow={bool}
        openBottom={val => openBottomSheets(val)}
        shareit={shareit}
      />

      <View style={{backgroundColor: '#fff', flex: 1}}>
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          start={{x: 0.0, y: 0.2}}
          end={{x: 0.5, y: 1.0}}
          style={styles.tabContainer}>
          <TouchableOpacity
            style={{
              marginLeft: 15,
            }}
            onPress={() => toggleAllState()}>
            <Text
              // eslint-disable-next-line react-native/no-inline-styles
              style={{
                fontSize: 18,
                fontFamily: fonts.regular,
                alignItems: 'center',
                backgroundColor: allState ? 'white' : 'transparent',
                color: allState ? Colors.primary : 'white',
                padding: 5,
                marginVertical: 11,
                borderRadius: 5,
                // eslint-disable-next-line no-dupe-keys
                alignItems: 'center',
                paddingHorizontal: 15,
              }}>
              {/* {allState ? ' All' : 'Date'} */}
              All
            </Text>
          </TouchableOpacity>

          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item?.id}
            renderItem={renderTabItem}
            contentContainerStyle={styles.flatListContent}
            // ItemSeparatorComponent={() => <View style={{width: 10}} />}
            style={{marginLeft: 20}}
          />
        </LinearGradient>

        {changetitle === true ? (
          <View style={{flex: 1}}>
            <WeeklyChart data={item} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={{paddingBottom: 200}}>
            {show ? null : showCalendar ? (
              <LinearGradient
                colors={['#fff', '#fff']}
                start={{x: 0.0, y: 0.2}}
                end={{x: 0.7, y: 1.0}}
                style={styles.calendarContainer}>
                <View style={{paddingHorizontal: 10}}>
                  <FlatList
                    ref={dateListRef}
                    data={dates}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item?.day?.toString()}
                    renderItem={renderDateItem}
                    contentContainerStyle={styles.flatListContent}
                    ItemSeparatorComponent={() => <View style={{}} />}
                    getItemLayout={(data, index) => ({
                      length: 58,
                      offset: 58 * index,
                      index,
                    })}
                  />
                </View>
              </LinearGradient>
            ) : (
              <Calendar
                current={today}
                minDate={today}
                onDayPress={handleDayPress}
                markedDates={{
                  [activeDate]: {selected: true, selectedColor: Colors.primary},
                }}
                hideArrows={false}
                hideExtraDays={true}
                style={{
                  marginBottom: 20,
                }}
                theme={{
                  textDayFontFamily: fonts.regular,
                  textMonthFontFamily: fonts.regular,
                  textDayHeaderFontFamily: fonts.regular,
                }}></Calendar>
            )}
            <View
              style={{padding: 10, alignItems: 'flex-start', marginLeft: 10}}>
              <Text
                style={{
                  fontSize: 18,
                  color: '#777',
                  fontFamily: fonts.regular,
                }}>
                {formattedDate || 'Select a date'}
              </Text>
            </View>

            <BookingCardForBook
              hide={true}
              activeTab={activeTab}
              userData={activeDate} // This is the selected date in YYYY-MM-DD format
              date={moment(activeDate).day()} // Get day index (0-6) from the selected date
              All={allState}
              onOpenCalendar={() => setShow(!show)}
              arrows={true}
              classes={classes}
              selectedLocation={shareit} // Pass the selected location
            />
          </ScrollView>
        )}
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={bottom}
        onRequestClose={() => setBottom(false)}>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
          <View
            style={{
              backgroundColor: 'white',
              height: height * 0.3, // Responsive height
              justifyContent: 'center',
              alignItems: 'center',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 16,
              position: 'relative',
            }}>
            <IconButton
              icon="close"
              size={24}
              iconColor={Colors.secondary}
              onPress={() => setBottom(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
              }}
            />
            <Text
              style={{
                fontSize: 18,
                marginBottom: 12,
                fontFamily: fonts.regular,
              }}>
              Select Location
            </Text>

            <View style={{width: '100%'}}>
              {locations.map((location, index) => (
                <List.Item
                  key={index}
                  title={location}
                  onPress={() => {
                    saveLocationsdata(location);
                  }}
                  titleStyle={{fontFamily: fonts.regular}}
                  left={() => (
                    <List.Icon icon="map-marker" color={Colors.primary} />
                  )}
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: '#ddd',
                    paddingVertical: 8,
                  }}
                />
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

// if (All == true) {
//     useEffect(() => {
//       getAllClasses()
//         .then(res => {
//           if (res?.data) {
//             const filterByDates = () => {
//               return res?.data?.filter(e =>
//                 e?.availability?.some(e => e?.day == date),
//               );
//             };
//             setData(filterByDates);
//           }
//         })
//         .finally(() => setLoading(false));
//     }, [id, userData, activeTab, date, All]);
//   }
//Smooth Accordion
const styles = StyleSheet.create({
  calendarContainer: {
    paddingVertical: 13,
  },
  flatListContent: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  tabContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    paddingVertical: 10,
    backgroundColor: Colors.secondary,
  },
  tabButton: {
    paddingVertical: 15,
    paddingHorizontal: 17,
    borderRadius: 20,
    alignItems: 'center',
  },
  tabText: {
    color: '#fff',
    fontFamily: fonts.regular,
  },
  card: {
    margin: 10,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cardContent: {
    padding: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
    color: '#555',
  },
  locationText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  calendarIconContainer: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginTop: 40,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: Colors.primary,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default CalendarScreen;