import React, {useEffect, useState} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Text,
  RefreshControl, // Import RefreshControl
} from 'react-native';
import {Avatar} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import SearchBar from 'react-native-dynamic-search-bar';
import {Appbar} from 'react-native-paper'; // Import Appbar
import {getAllClasses} from '../Api/Allapi';
import {Colors} from '../Config/Config';
import Icon from 'react-native-vector-icons/FontAwesome';
import fonts from '../FontFamily/FontFamily';
import Icons from 'react-native-vector-icons/Ionicons'; // Import your desired icon set

const SearchClasses = () => {
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false); // State for refresh control

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    getAllClasses()
      .then(res => {
        if (res?.data) {
          setData(res.data);
          setFilteredData(res.data);
          setNoData(res.data.length === 0);
        } else {
          setNoData(true);
        }
      })
      .catch(() => setNoData(true))
      .finally(() => setLoading(false));
  };

  const handleSearch = query => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredData(filtered);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
    setIsRefreshing(false);
  };

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
    const formattedMinutes = minutes.toString().padStart(2, '0');

    return `${adjustedHours}:${formattedMinutes} ${period}`;
  };
  const renderItem = ({item}) => {
    const time = item?.availability?.[0]?.time; // Display only the first time
    const maxPeople = item?.availability?.[0]?.maxPeople; // Display only the first time
    const trainers = item?.availability?.[0]?.trainers[0]?.name; // Display only the first time
    const locationsData = [
      ...new Set(
        item?.availability?.flatMap((res) => res?.locations.map((location) => location.name))
      ),
    ];
    

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

              <View>
                {item?.availability?.locations?.map((location, index) => (
                  <Text key={index} style={{color: Colors?.secondary}}>
                    {location?.name}
                  </Text>
                ))}
              </View>
              <Text style={styles.description}>Instructor: {trainers}.</Text>
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
                  }}
                >
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
    <View style={{}}>
      <Appbar.Header style={{marginRight: 30}}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <SearchBar
          placeholder="Search classes"
          onChangeText={handleSearch}
          value={searchQuery}
          inputStyle={{fontFamily: fonts.regular}}
        />
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={{marginTop: 5, paddingBottom: 100}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : noData ? (
          <Text style={styles.noDataText}>
            No classes found for this category.
          </Text>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={item => item?.id}
            renderItem={renderItem}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </View>
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
    fontSize: 16,
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
    color: 'black',
    textAlign: 'center',
    marginTop: 20,
  },
});
export default SearchClasses;
