import React, {useEffect, useState} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {Avatar, Text} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '../Config/Config';
import {useNavigation} from '@react-navigation/native';
import {getAllClasses} from '../Api/Allapi';
import Icon from 'react-native-vector-icons/FontAwesome';
import fonts from '../FontFamily/FontFamily';
import Icons from 'react-native-vector-icons/Ionicons'; // Import your desired icon set

const GetAllClasess = () => {
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all classes on component mount
  useEffect(() => {
    setLoading(true);
    getAllClasses()
      .then(res => {
        if (res?.data) {
          setData(res?.data);
        } else {
          setData([]); // Handle no data case
        }
      })
      .catch(error => {
        console.error('Error fetching classes:', error);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const convertTo12HourFormat = time24 => {
    if (!time24 || typeof time24 !== 'string') {
      return 'Invalid time';
    }

    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const adjustedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${adjustedHours}:${formattedMinutes} ${period}`;
  };

  const renderItem = ({item}) => {
    const time = item?.availability?.[0]?.time; // Display only the first time
    const maxPeople = item?.availability?.[0]?.maxPeople; // Display only the first time
    // const trainers = item?.availability?.[0]?.trainers[0]?.name; // Display only the first time
    const trainers = [
      ...new Set(
        item?.availability.flatMap(res =>
          res.trainers.map(location => location.name),
        ),
      ),
    ];
    const locationsData = [
      ...new Set(
        item?.availability.flatMap(res =>
          res.locations.map(location => location.name),
        ),
      ),
    ];
    // Map through locations to display them
    const renderLocations = locations => {
      return locations?.map((location, index) => (
        <View key={location?._id || index} style={{flexDirection: 'row'}}>
          <Text
            style={{
              fontSize: 15,
              color: '#333',
              marginHorizontal: 5,
              fontFamily: fonts.regular,
            }}>
            {location?.name}
            {index < locations.length - 1 ? ' |' : ''}
          </Text>
        </View>
      ));
    };

    return (
      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('CalendarDetails', {item})}>
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

              {trainers.length > 0 && (
                <Text style={styles.description}>
                  Instructor: {trainers?.join(' | ')}
                </Text>
              )}

              <View
                style={{
                  borderRadius: 8,
                  flexDirection: 'row',
                  top: 5,
                }}>
                <Icons name="location" size={17} color={Colors.primary} />

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
    <ScrollView
      style={{}}
      contentContainerStyle={{}}
      showsVerticalScrollIndicator={false}>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} />
      ) : data.length === 0 ? (
        <Text style={styles.noDataText}>
          No classes found for this category.
        </Text>
      ) : (
        <FlatList data={data} renderItem={renderItem} scrollEnabled={false} />
      )}
    </ScrollView>
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
  avatarContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    bottom: 10,
  },
  title: {
    fontSize: 18,
    // fontWeight: 'bold',
    color: '#333',
    fontFamily: fonts.regular,
  },
  description: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
    fontFamily: fonts.regular,
  },
  buttonContainer: {
    marginLeft: 12,
  },
  demoText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  noDataText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default GetAllClasess;
