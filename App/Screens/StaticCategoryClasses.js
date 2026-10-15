import React, {useEffect, useState, useContext} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Button,
  Image,
} from 'react-native';
import {Avatar, Text} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from './Config/Config';
import {useNavigation, useRoute} from '@react-navigation/native';
import HeaderComponent from './Header/HeaderComponent';
import {getAllClasses} from './Api/Allapi';
import BookingCalender from './Bookings/BookingCalender';
import fonts from './FontFamily/FontFamily';
import Icons from 'react-native-vector-icons/Ionicons';
import UserContext from '../context/UserContext';
import Icon from 'react-native-vector-icons/Ionicons';
import {StaticCategoryData} from './Category/staticCategoryData';
const StaticCategoryClasses = ({hide, activeTab, date}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const id = route?.params?.item;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState();
  const [noData, setNoData] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [view, setView] = useState([]);
  const [demodata, setDemodata] = useState([]);
  const {locations} = useContext(UserContext);

  useEffect(() => {
    setLoading(true);
    const filterdClass = StaticCategoryData?.find(e => e?._id == id);
    // if (filterdClass?.classes?.length <= 0) setNoData(true);
    setData(filterdClass?.classes);
    setCategory(filterdClass);
    setLoading(false);
  }, [activeTab, date, locations]);

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
    const formattedMinutes = minutes?.toString()?.padStart(2, '0');

    return `${adjustedHours}:${formattedMinutes} ${period}`;
  };

  const renderItem = ({item}) => {
    const trainers = item?.availability?.[0]?.trainers[0]?.name;
    const trainerImage = item?.availability?.[0]?.trainers?.[0]?.image?.[0];
    const locationsData = [
      ...new Set(
        item?.availability.flatMap(res =>
          res.locations.map(location => location.name),
        ),
      ),
    ];
    const include = view?.includes(item?._id);
    const clickHandler = id => {
      if (include) return setView(view?.filter(e => e != id));
      setView(prev => [...prev, id]);
    };
    return (
      <>
        <View
          style={{
            ...styles.card,
            borderBottomRightRadius: include ? 0 : 8,
            borderBottomLeftRadius: include ? 0 : 8,
          }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              clickHandler(item?._id);
              // navigation.navigate('CalendarDetails', {item, categoryId: id})
            }}>
            <View style={styles.rowContainer}>
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                start={{x: 0.0, y: 0.2}}
                end={{x: 0.7, y: 1.0}}
                style={{
                  marginRight: 10,
                  // bottom: 30,
                  elevation: 4,
                  borderRadius: 50,
                  padding: 5,
                }}>
                <Avatar.Image size={90} source={trainerImage} />
              </LinearGradient>
              <View style={styles.textContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={styles.title}>{item?.name}</Text>
                  <Icon
                    name={
                      include ? 'chevron-up-outline' : 'chevron-down-outline'
                    }
                    size={20}
                    color="black"
                  />
                </View>
                <Text style={styles.instructor}>Instructor: {trainers}</Text>

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
        {include && (
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{x: 0.0, y: 0.1}}
            end={{x: 0.7, y: 0.4}}
            style={styles.accordionContent}>
            <Text style={styles.description}>{item?.description}</Text>
          </LinearGradient>
        )}
      </>
    );
  };
  const imageMapping = {
    strength: require('../assets/staticST.jpg'),
    pilats: require('../assets/staticPilats.png'),
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
            // Display message if no data is found
            <Text style={styles.noDataText}>No classes found.</Text>
          ) : (
            <>
              {category?.image.includes('http') ? (
                <Image
                  source={{uri: category?.image}}
                  style={{
                    width: '100%',
                    height: 400,
                    objectFit: 'cover',
                    borderRadius: 10,
                    elevation: 5000,
                  }}
                />
              ) : (
                <Image
                  // Use the mapping to get the correct image
                  source={imageMapping[category?.image]}
                  style={{
                    width: '100%',
                    height: 400,
                    objectFit: 'cover',
                    borderRadius: 10,
                    elevation: 5000,
                  }}
                />
              )}
              <Text
                style={{
                  color: 'black',
                  fontSize: 20,
                  fontWeight: 700,
                  marginTop: 15,
                  paddingLeft: 8,
                }}>
                {category?.title}
              </Text>
              <Text style={{color: 'black', paddingLeft: 8}}>
                {category?.description}
              </Text>
              {data?.length > 0 && (
                <Text
                  style={{
                    color: 'black',
                    marginTop: 20,
                    marginBottom: 10,
                    fontWeight: 700,
                    paddingLeft: 8,
                    fontSize: 15,
                  }}>
                  Classes
                </Text>
              )}
              <FlatList
                data={data} // Use filtered data
                keyExtractor={item => item?.id}
                renderItem={renderItem}
                scrollEnabled={false}
                ListFooterComponent={<View style={{height: 100}} />} // fix
              />
              {/* <View style={{height: 50}}></View> */}
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
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 3,
    margin: 15,
    marginHorizontal: 8,
    marginTop: 5,
    marginBottom: 5,
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
    alignContent: 'center',
  },
  title: {
    fontSize: 18,
    // fontWeight: 'bold',
    color: '#333',
    fontFamily: fonts.regular,
  },
  description: {
    fontSize: 15,
    color: 'white',
    marginTop: 4,
    fontFamily: fonts.regular,
    paddingHorizontal: 10,
  },
  instructor: {
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
  accordionContent: {
    paddingVertical: 20,
    borderBottomEndRadius: 12,
    borderBottomStartRadius: 12,
    paddingHorizontal: 15,
    borderBottomRightRadius: 15,
    borderBottomLeftRadius: 15,
    marginHorizontal: 8,
    // marginTop: -10,
  },
});

export default StaticCategoryClasses;