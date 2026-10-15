// import React, {useEffect, useState, useCallback} from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
// } from 'react-native';
// import {getAllClasses} from '../Api/Allapi';
// import {useNavigation} from '@react-navigation/native';
// import HeaderComponent from '../Header/HeaderComponent';
// import {ro} from 'react-native-paper-dates';
// import moment from 'moment';
// const predefinedColors = [
//   {keyword: 'pole', baseColor: '#B100EC'}, // Pink
//   {keyword: 'aerial', baseColor: '#672996'}, // Purple
//   {keyword: 'kids', baseColor: '#38CCFF'}, // Blue
//   {keyword: 'strength', baseColor: '#1D70B2'}, // Darker blue
// ];

// // Function to generate a slightly different shade of the base color
// const adjustColor = (baseColor, name) => {
//   const hash = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
//   const variation = (hash % 20) - 10; // Get a variation between -10 and +10

//   let [r, g, b] = baseColor.match(/\w\w/g).map(hex => parseInt(hex, 16));

//   // Adjust lightness slightly based on the variation
//   r = Math.max(0, Math.min(255, r + variation));
//   g = Math.max(0, Math.min(255, g + variation));
//   b = Math.max(0, Math.min(255, b + variation));

//   return `rgb(${r}, ${g}, ${b})`;
// };
// // Generate a dynamic color using a hash function
// const generateColor = name => {
//   const lowerCaseName = name.toLowerCase();

//   // Check if any keyword matches part of the name
//   const matchedColor = predefinedColors.find(({keyword}) =>
//     lowerCaseName.includes(keyword),
//   );

//   if (matchedColor) {
//     return adjustColor(matchedColor.baseColor, name); // Generate a shade variation
//   }

//   // Fallback: Generate a dynamic HSL color
//   const hash = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
//   const hue = hash % 340;
//   const saturation = 50 + (hash % 30);
//   const lightness = 40 + (hash % 20);
//   return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
// };

// const DAYS_OF_WEEK = (() => {
//   const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
//   const currentDayIndex = moment().day();
//   return [...days.slice(currentDayIndex), ...days.slice(0, currentDayIndex)];
// })();

// const ClassesSchedules = () => {
//   const [scheduleData, setScheduleData] = useState([]);
//   const navigation = useNavigation();
//   const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

//   const fetchClasses = useCallback(async () => {
//     try {
//       const res = await getAllClasses();
//       if (!res?.data) throw new Error('No data received from getAllClasses.');
//       setScheduleData(res.data);
//     } catch (error) {
//       console.error('Error fetching classes:', error);
//     }
//   }, []);

//   useEffect(() => {
//     fetchClasses();
//   }, [fetchClasses]);

//   const convertTo12HourFormat = time24 => {
//     if (!time24) return 'Invalid time';
//     const [hours, minutes] = time24.split(':').map(Number);
//     const period = hours >= 12 ? 'PM' : 'AM';
//     const adjustedHours = hours % 12 || 12;
//     return `${adjustedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
//   };

//   const renderClassItem = ({classItem, dayIndex}) => (
//     <TouchableOpacity
//       key={classItem.name}
//       activeOpacity={0.95}
//       onPress={() => navigation.navigate('CalendarDetails', {item: classItem})}
//       style={styles.classItemContainer}>
//       <View
//         style={[
//           styles.classItem,
//           {backgroundColor: generateColor(classItem.name)},
//         ]}>
//         {classItem.availability
//           .filter(slot => slot.day === dayIndex)
//           .map((slot, idx) => (
//             <Text key={idx} style={styles.classTime}>
//               {convertTo12HourFormat(slot?.time)}
//             </Text>
//           ))}
//         <Text style={styles.className}>{classItem.name}</Text>
//       </View>
//     </TouchableOpacity>
//   );

//   const renderDayColumn = ({day, dayIndex}) => {
//     const isCurrentDay = dayIndex === moment().day();
//     return (
//       <View key={dayIndex} style={styles.dayContainer}>
//         {/* <View style={[isCurrentDay && styles.currentDay]}> */}
//         <Text
//           style={[
//             styles.dayText,
//             isCurrentDay && styles.currentDayText, // Apply text style if it's the current day
//           ]}>
//           {day}
//         </Text>
//         {/* </View> */}
//         {scheduleData
//           ?.filter(classItem =>
//             classItem?.availability?.some(slot => slot?.day === dayIndex),
//           )
//           ?.sort((a, b) => {
//             const timeA = a.availability.find(
//               slot => slot.day === dayIndex,
//             )?.time;
//             const timeB = b.availability.find(
//               slot => slot.day === dayIndex,
//             )?.time;
//             return timeA?.localeCompare(timeB);
//           })
//           ?.map((classItem, idx) => renderClassItem({classItem, dayIndex}))}
//       </View>
//     );
//   };

//   return (
//     <>
//       <HeaderComponent />
//       <ScrollView style={styles.container}>
//         <ScrollView
//           horizontal
//           style={styles.scheduleContainer}
//           showsHorizontalScrollIndicator={false}>
//           {DAYS_OF_WEEK.map((day, dayIndex) =>
//             renderDayColumn({day, dayIndex: days.indexOf(day)}),
//           )}
//         </ScrollView>
//       </ScrollView>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     // backgroundColor: '#FFFFFF',
//     alignContent: 'center',
//   },
//   scheduleContainer: {
//     // transform: 'rotate(90deg)',
//     paddingVertical: 20,
//     // backgroundColor: 'green',
//     minHeight: 750,
//   },
//   dayContainer: {
//     width: 200,
//     // padding: 15,
//     // marginHorizontal: 8,
//     backgroundColor: '#F1F5F9',
//     // borderRadius: 12,
//     height: '100%',
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//     elevation: 1,
//     // backgroundColor: 'green ',
//   },
//   currentDay: {
//     backgroundColor: 'lightblue', // Highlight color for the current day
//   },
//   currentDayText: {
//     color: '#1E40AF', // Darker blue for text
//     backgroundColor: 'lightblue', // Highlight color for the current day
//   },
//   dayText: {
//     color: '#475569',
//     fontSize: 16,
//     fontWeight: '700',
//     textAlign: 'center',
//     paddingVertical: 10,
//     borderBottomColor: '#E2E8F0',
//     borderBottomWidth: 1,
//   },
//   classItemContainer: {
//     // marginVertical: 6,
//   },
//   classItem: {
//     padding: 15,
//     borderRadius: 10,
//     marginHorizontal: 6,
//     marginVertical: 4,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     elevation: 3,
//   },
//   classTime: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   className: {
//     color: 'white',
//     fontSize: 13,
//     fontWeight: '500',
//     marginTop: 4,
//   },
// });

// export default ClassesSchedules;

import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {getAllClasses} from '../Api/Allapi';
import {useNavigation} from '@react-navigation/native';
import HeaderComponent from '../Header/HeaderComponent';
import {ro} from 'react-native-paper-dates';
import moment from 'moment';
const predefinedColors = [
  {keyword: 'pole', baseColor: '#B100EC'}, // Pink
  {keyword: 'aerial', baseColor: '#672996'}, // Purple
  {keyword: 'kids', baseColor: '#38CCFF'}, // Blue
  {keyword: 'strength', baseColor: '#1D70B2'}, // Darker blue
];

// Function to generate a slightly different shade of the base color
const adjustColor = (baseColor, name) => {
  const hash = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variation = (hash % 20) - 10; // Get a variation between -10 and +10

  let [r, g, b] = baseColor.match(/\w\w/g).map(hex => parseInt(hex, 16));

  // Adjust lightness slightly based on the variation
  r = Math.max(0, Math.min(255, r + variation));
  g = Math.max(0, Math.min(255, g + variation));
  b = Math.max(0, Math.min(255, b + variation));

  return `rgb(${r}, ${g}, ${b})`;
};
// Generate a dynamic color using a hash function
const generateColor = name => {
  const lowerCaseName = name.toLowerCase();

  // Check if any keyword matches part of the name
  const matchedColor = predefinedColors.find(({keyword}) =>
    lowerCaseName.includes(keyword),
  );

  if (matchedColor) {
    return adjustColor(matchedColor.baseColor, name); // Generate a shade variation
  }

  // Fallback: Generate a dynamic HSL color
  const hash = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 340;
  const saturation = 50 + (hash % 30);
  const lightness = 40 + (hash % 20);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const DAYS_OF_WEEK = (() => {
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const currentDayIndex = moment().day();
  return [...days.slice(currentDayIndex), ...days.slice(0, currentDayIndex)];
})();

const ClassesSchedules = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const navigation = useNavigation();
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const fetchClasses = useCallback(async () => {
    try {
      const res = await getAllClasses();
      if (!res?.data) throw new Error('No data received from getAllClasses.');
      setScheduleData(res.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const convertTo12HourFormat = time24 => {
    if (!time24) return 'Invalid time';
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const adjustedHours = hours % 12 || 12;
    return `${adjustedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const renderClassItem = ({classItem, dayIndex}) => (
    <TouchableOpacity
      key={classItem.name}
      activeOpacity={0.95}
      onPress={() => navigation.navigate('CalendarDetails', {item: classItem})}
      style={styles.classItemContainer}>
      <View
        style={[
          styles.classItem,
          {backgroundColor: generateColor(classItem.name)},
        ]}>
        {classItem.availability
          .filter(slot => slot.day === dayIndex)
          .map((slot, idx) => (
            <Text key={idx} style={styles.classTime}>
              {convertTo12HourFormat(slot?.time)}
            </Text>
          ))}
        <Text style={styles.className}>{classItem.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderDayColumn = ({day, dayIndex}) => {
    const isCurrentDay = dayIndex === moment().day();

    // Get all classes for this day
    const dayClasses =
      scheduleData?.filter(classItem =>
        classItem?.availability?.some(slot => slot?.day === dayIndex),
      ) || [];

    // Flatten all availability slots for this day
    const allSlots = dayClasses.flatMap(classItem =>
      classItem.availability
        .filter(slot => slot.day === dayIndex)
        .map(slot => ({
          ...slot,
          classItem, // Include the parent class info
        })),
    );

    // Sort by time
    const sortedSlots = allSlots.sort((a, b) => a.time.localeCompare(b.time));

    return (
      <View key={dayIndex} style={styles.dayContainer}>
        <Text style={[styles.dayText, isCurrentDay && styles.currentDayText]}>
          {day}
        </Text>

        {sortedSlots.map((slot, idx) => (
          <TouchableOpacity
            key={`${slot.classItem._id}-${idx}`}
            activeOpacity={0.95}
            onPress={() =>
              navigation.navigate('CalendarDetails', {item: slot.classItem})
            }
            style={styles.classItemContainer}>
            <View
              style={[
                styles.classItem,
                {backgroundColor: generateColor(slot.classItem.name)},
              ]}>
              <Text style={styles.classTime}>
                {convertTo12HourFormat(slot.time)}
              </Text>
              <Text style={styles.className}>
                {slot.classItem.name}
                {slot.locations?.length > 0 && (
                  <Text style={{fontSize: 11}}>
                    {'\n'}@{slot.locations[0].name}
                  </Text>
                )}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <>
      <HeaderComponent />
      <ScrollView style={styles.container}>
        <ScrollView
          horizontal
          style={styles.scheduleContainer}
          showsHorizontalScrollIndicator={false}>
          {DAYS_OF_WEEK.map((day, dayIndex) =>
            renderDayColumn({day, dayIndex: days.indexOf(day)}),
          )}
        </ScrollView>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#FFFFFF',
    alignContent: 'center',
  },
  scheduleContainer: {
    // transform: 'rotate(90deg)',
    paddingVertical: 20,
    // backgroundColor: 'green',
    minHeight: 750,
  },
  dayContainer: {
    width: 200,
    // padding: 15,
    // marginHorizontal: 8,
    backgroundColor: '#F1F5F9',
    // borderRadius: 12,
    height: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
    // backgroundColor: 'green ',
  },
  currentDay: {
    backgroundColor: 'lightblue', // Highlight color for the current day
  },
  currentDayText: {
    color: '#1E40AF', // Darker blue for text
    backgroundColor: 'lightblue', // Highlight color for the current day
  },
  dayText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 10,
    borderBottomColor: '#E2E8F0',
    borderBottomWidth: 1,
  },
  classItemContainer: {
    // marginVertical: 6,
  },
  classItem: {
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 6,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 3,
  },
  classTime: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  className: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
});

export default ClassesSchedules;