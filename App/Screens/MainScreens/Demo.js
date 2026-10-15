import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import HeaderComponent from '../Header/HeaderComponent';
import {Colors} from '../Config/Config';
import {bookingData} from '../BookingCard';
import moment from 'moment';
import {useNavigation} from '@react-navigation/native';
import {DatePickerModal} from 'react-native-paper-dates';

const CalendarScreen = () => {
  const today = moment().format('YYYY-MM-DD');
  const [activeTab, setActiveTab] = useState(bookingData[0].id);
  const [activeDate, setActiveDate] = useState(today);
  const [formattedDate, setFormattedDate] = useState('');
  const [userData, setUserData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    const formatted = moment(today).format('dddd, MMM D');
    setFormattedDate(formatted);
    FetchUserData();
  }, []);

  const FetchUserData = () => {
    fetch('https://randomuser.me/api/?results=15')
      .then(response => response.json())
      .then(data => {
        setUserData(data.results);
        setIsLoading(false);
      })
      .catch(error => console.error('Error fetching user data:', error));
  };

  const onConfirmDate = params => {
    const {date} = params;
    const selectedDate = moment(date).format('YYYY-MM-DD');
    setActiveDate(selectedDate);
    setFormattedDate(moment(date).format('dddd, MMM D'));
    setShowDatePicker(false);
    FetchUserData();
  };

  const renderTabItem = ({item}) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === item?.id && {}]}
      onPress={() => setActiveTab(item?.id) + FetchUserData()}>
      <Text
        style={[
          styles.tabText,
          activeTab === item?.id && {
            fontSize: 17,
            color: activeTab === item?.id ? '#fff' : '#777',
          },
        ]}>
        {item?.title?.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );

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

  return (
    <>
      <HeaderComponent
        onOpenCalendar={() => setShowDatePicker(true)}
        TrueFun={true}
      />
      <View style={{backgroundColor: '#fff'}}>
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          start={{x: 0.0, y: 0.2}}
          end={{x: 0.5, y: 1.0}}
          style={styles.tabContainer}>
          <FlatList
            data={bookingData}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item?.id}
            renderItem={renderTabItem}
            contentContainerStyle={styles.flatListContent}
            ItemSeparatorComponent={() => <View style={{width: 10}} />}
          />
        </LinearGradient>

        <View style={{padding: 10, alignItems: 'flex-start', marginLeft: 10}}>
          <Text style={{fontSize: 18, fontWeight: 'bold', color: '#777'}}>
            {formattedDate || 'Select a date'}
          </Text>
        </View>

        <ScrollView contentContainerStyle={{paddingBottom: '100%'}}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <FlatList
              data={userData}
              keyExtractor={item => item?.login?.uuid}
              renderItem={renderUserItem}
              scrollEnabled={false}
            />
          )}
        </ScrollView>
      </View>

      <DatePickerModal
        visible={showDatePicker}
        onDismiss={() => setShowDatePicker(false)}
        date={new Date(activeDate)}
        onConfirm={onConfirmDate}
        mode="single"
        locale="en" // You can customize this if needed
      />
    </>
  );
};

const styles = StyleSheet.create({
  flatListContent: {
    paddingHorizontal: 10,
  },
  tabContainer: {
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
    fontSize: 17,
    color: '#999',
  },
});

export default CalendarScreen;
