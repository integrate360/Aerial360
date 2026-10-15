import React, {useState, useEffect} from 'react';
import {FlatList, View, StyleSheet, Image, Text, TouchableOpacity} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {Colors} from './Config/Config';
import {getAllClasses} from './Api/Allapi';
import moment from 'moment';
import fonts from './FontFamily/FontFamily';
import {useNavigation} from '@react-navigation/native';

const UpcommingBatches = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        setLoading(true);
        console.log('Starting to fetch classes...');
        
        const res = await getAllClasses();
        console.log('Raw API response received');
        
        if (!res?.data || !Array.isArray(res.data)) {
          console.log('No data array found in response');
          setData([]);
          return;
        }

        console.log('Total classes found:', res.data.length);
        
        const currentDay = moment().day(); // 0-6 (Sunday-Saturday)
        const currentTime = moment();
        
        console.log('Current day:', currentDay, '(', moment().format('dddd'), ')');
        console.log('Current time:', currentTime.format('HH:mm'));

        // Process all classes
        const processedData = res.data.flatMap(item => {
          console.log(`\nProcessing class: ${item.name}`, {
            id: item._id,
            availabilityCount: item.availability?.length || 0
          });

          // Log the actual availability array content
          // console.log('Full availability array:', JSON.stringify(item.availability, null, 2));

          if (!Array.isArray(item.availability) || item.availability.length === 0) {
            console.log(`No availability array for ${item.name}`);
            return [];
          }

          const validAvailabilities = item.availability.flatMap(availability => {
            // console.log('Checking availability slot:', {
            //   day: availability.day,
            //   time: availability.time,
            //   locations: availability.locations,
            //   trainers: availability.trainers
            // });

            // Convert day to number if it's string
            const availabilityDay = parseInt(availability.day);
            
            // For current day, check if time is in future
            if (availabilityDay === currentDay) {
              const availabilityTime = moment(availability.time, 'HH:mm');
              const currentTimeMoment = moment();
              
              // Create a moment for today with the availability time
              const availabilityDateTime = moment().set({
                hour: availabilityTime.hour(),
                minute: availabilityTime.minute(),
                second: 0
              });
              
              const timeDiffMinutes = availabilityDateTime.diff(currentTimeMoment, 'minutes');
              console.log(`Time difference for ${availability.time}: ${timeDiffMinutes} minutes`);
              
              // Include if it's at least 3 hours (180 minutes) in the future
              if (timeDiffMinutes >= 180) {
                const result = {
                  ...availability,
                  item,
                  location: availability?.locations?.[0]?.name || 'Unknown Location',
                  name: item?.name,
                  trainers: availability?.trainers?.[0] || {},
                  uDate: moment().format('DD-MM-YYYY'),
                };
                console.log('✅ INCLUDING - Current day future slot:', result);
                return [result];
              } else {
                console.log('❌ EXCLUDING - Current day slot too soon');
                return [];
              }
            }
            
            // For future days (next 6 days), include all
            if (availabilityDay > currentDay) {
              const daysToAdd = availabilityDay - currentDay;
              const futureDate = moment().add(daysToAdd, 'days');
              const result = {
                ...availability,
                item,
                location: availability?.locations?.[0]?.name || 'Unknown Location',
                name: item?.name,
                trainers: availability?.trainers?.[0] || {},
                uDate: futureDate.format('DD-MM-YYYY'),
              };
              console.log('✅ INCLUDING - Future day slot:', result);
              return [result];
            }
            
            // For past days in the same week (Sunday edge case)
            if (availabilityDay < currentDay) {
              const daysToAdd = (7 - currentDay) + availabilityDay;
              const futureDate = moment().add(daysToAdd, 'days');
              const result = {
                ...availability,
                item,
                location: availability?.locations?.[0]?.name || 'Unknown Location',
                name: item?.name,
                trainers: availability?.trainers?.[0] || {},
                uDate: futureDate.format('DD-MM-YYYY'),
              };
              // console.log('✅ INCLUDING - Next week slot:', result);
              return [result];
            }
            
            console.log('❌ EXCLUDING - No matching condition');
            return [];
          });

          console.log(`Valid availabilities for ${item.name}:`, validAvailabilities.length);
          return validAvailabilities;
        });

        console.log('\n=== FINAL PROCESSING SUMMARY ===');
        console.log('Total processed data before sorting:', processedData.length);
        
        if (processedData.length > 0) {
          console.log('Processed data samples:');
          processedData.slice(0, 5).forEach((item, index) => {
            console.log(`${index + 1}. ${item.name} - ${item.uDate} ${item.time} at ${item.location}`);
          });
        } else {
          console.log('No data processed. Possible reasons:');
          console.log('- All classes are inactive');
          console.log('- No availability matches current time constraints');
          console.log('- Availability data structure is different than expected');
        }

        // Sort by date and time
        const sortedData = processedData.sort((a, b) => {
          const dateA = moment(a.uDate, 'DD-MM-YYYY');
          const dateB = moment(b.uDate, 'DD-MM-YYYY');
          
          if (dateA.isSame(dateB)) {
            return moment(a.time, 'HH:mm').diff(moment(b.time, 'HH:mm'));
          }
          return dateA.diff(dateB);
        });

        console.log('Final sorted data count:', sortedData.length);
        setData(sortedData);
        
      } catch (error) {
        console.error('Error fetching classes:', error);
        console.error('Error details:', error.response?.data || error.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessData();
  }, []);

  // Temporary: Let's also add a function to test with sample data
  const testWithSampleData = () => {
    const sampleData = [
      {
        name: "Test Class 1",
        uDate: moment().format('DD-MM-YYYY'),
        time: "18:00",
        location: "Test Location 1",
        item: { _id: "test1" }
      },
      {
        name: "Test Class 2", 
        uDate: moment().add(1, 'days').format('DD-MM-YYYY'),
        time: "10:00",
        location: "Test Location 2",
        item: { _id: "test2" }
      }
    ];
    setData(sampleData);
  };

  const renderItem = ({item}) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => navigation?.navigate('CalendarDetails', {item: item?.item})}>
      <View style={styles.card}>
        <Text style={styles.title} numberOfLines={2}>{item?.name}</Text>

        <View style={styles.row}>
          <View style={styles.dateContainer}>
            <FontAwesome5
              name="calendar-alt"
              size={14}
              color={Colors.secondary}
              style={styles.icon}
            />
            <Text style={styles.date}>{item.uDate}</Text>
          </View>
        </View>

        <View style={styles.timeContainer}>
          <FontAwesome5
            name="clock"
            size={12}
            color={Colors.secondary}
            style={styles.icon}
          />
          <Text style={styles.time}>{item.time}</Text>
        </View>

        <View style={styles.studioContainer}>
          <FontAwesome5
            name="map-marker-alt"
            size={12}
            color={Colors.secondary}
            style={styles.icon}
          />
          <Text style={styles.studioName} numberOfLines={1}>
            {item?.location}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading upcoming batches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Debug info */}
      {data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No upcoming batches found</Text>
          <Text style={styles.emptySubText}>
            This could be because:
          </Text>
          <Text style={styles.emptySubText}>
            • No classes are scheduled for today
          </Text>
          <Text style={styles.emptySubText}>
            • All today's classes have already started
          </Text>
          <Text style={styles.emptySubText}>
            • Check back later for new schedules
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.item?._id}-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    minHeight: 100,
  },
  flatListContent: {
    paddingHorizontal: 10,
  },
  card: {
    marginHorizontal: 6,
    backgroundColor: 'white',
    borderRadius: 13,
    width: 160,
    height: 140,
    elevation: 5,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
    fontFamily: fonts.regular,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    marginRight: 5,
  },
  date: {
    fontSize: 12,
    color: Colors.secondary,
    fontFamily: fonts.regular,
  },
  time: {
    fontSize: 12,
    color: Colors.secondary,
    fontFamily: fonts.regular,
  },
  studioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studioName: {
    fontSize: 11,
    color: Colors.secondary,
    fontFamily: fonts.regular,
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    color: Colors.primary,
    fontFamily: fonts.regular,
    padding: 20,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    margin: 10,
    borderRadius: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.primary,
    fontFamily: fonts.regular,
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  emptySubText: {
    textAlign: 'center',
    color: Colors.secondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginBottom: 3,
  },
  debugContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  debugText: {
    fontSize: 10,
    color: '#666',
    fontFamily: fonts.regular,
    marginBottom: 2,
  },
  testButton: {
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 5,
    marginTop: 5,
  },
  testButtonText: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
    fontFamily: fonts.regular,
  },
});

export default UpcommingBatches;