import React, {useContext, useState} from 'react';
import {
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {Appbar, TextInput} from 'react-native-paper';
const {width, height} = Dimensions.get('screen');
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from './Config/Config';
import UserContext from '../context/UserContext';
import {Enquire} from './Api/Allapi';
import fonts from './FontFamily/FontFamily';
import moment from 'moment';
import {Calendar} from 'react-native-calendars';
const data = [
  {
    id: '1',
    title: 'Welcome to Gifting',
    description: `Looking for the perfect gift for someone special? 🎉 Choose any of our classes or packages, and we'll create a beautifully designed gift voucher just for you! Whether it’s for fitness, wellness, or a fun experience, this is the perfect way to surprise your loved ones.

Let us know your selection, and we'll take care of the rest! ✨.`,
  },
];

const Gifting = () => {
  const navigation = useNavigation();
  const {email, userId} = useContext(UserContext);
  const [modalVisible, setModalVisible] = useState(false); // State to control modal visibility
  const [dState, setDState] = useState({
    people: null,
    date: '',
    staticDate: '',
  });
  const renderItem = ({item}) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item?.title}</Text>
      <Text style={styles.cardDescription}>{item?.description}</Text>
    </View>
  );

  const showModal = () => {
    if (!email || !userId) {
      navigation.navigate('Login');
    } else {
      setModalVisible(true);
    }
  };
  const submitHandler = async () => {
    if (!dState.people || !dState.date)
      return alert('Please fill all the fields');
    Enquire({...dState, user: userId});
    alert('Enquiry Submitted');
    setModalVisible(false);
  };
  const closeModal = () => {
    setModalVisible(false);
  };
  const handleInputChange = (field, value) => {
    setDState({...dState, [field]: value});
  };
  const handleDayPress = day => {
    setDState({
      ...dState,
      date: moment(day.timestamp),
      staticDate: moment(day.dateString).format('YYYY-MM-DD'),
    });
  };

  const markedDates = {
    [dState?.staticDate]: {
      selected: true,
      selectedColor: '#2E66E7',
      selectedTextColor: '#ffffff',
    },
  };
  return (
    <>
      <View style={styles.container}>
        <ImageBackground
          source={{
            uri: 'https://airbound.in/wp-content/uploads/2024/02/Airbound-26-jan-20247499-704x1024.jpg',
          }}
          style={styles.headerBackground}>
          <Appbar.Header style={{backgroundColor: 'transparent'}}>
            <Appbar.BackAction
              size={30}
              color="black"
              onPress={() => navigation.goBack()}
            />
          </Appbar.Header>
          {/* <View
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              alignContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              padding: 7,
              paddingHorizontal: 20,
              marginTop: 150,
              borderRadius: 50,
            }}>
            <Text
              style={{
                color: '#fff',
                fontSize: 18,
                letterSpacing: 1,
                fontFamily: fonts.regular,
              }}>
              GIFTING
            </Text>
          </View> */}
        </ImageBackground>

        <ScrollView style={{flex: 1, backgroundColor: '#fff'}}>
          <FlatList
            data={data}
            keyExtractor={item => item?.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            scrollEnabled={false}
          />
        </ScrollView>
      </View>

      <ScrollView
        style={{flex: 1, backgroundColor: '#fff'}}
        contentContainerStyle={{paddingBottom: 30}} // Ensures there's space for the button
      >
        <FlatList
          data={data}
          keyExtractor={item => item?.id}
          renderItem={renderItem}
          scrollEnabled={false}
        />

        {/* Enquire Button (placed inside scroll) */}
        <View style={{alignItems: 'center', marginTop: 10}}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{x: 0.0, y: 0.2}}
            end={{x: 0.7, y: 1.0}}
            style={{borderRadius: 10, overflow: 'hidden'}}>
            <TouchableOpacity
              style={{
                paddingVertical: 13,
                paddingHorizontal: 120,
                alignItems: 'center',
              }}
              onPress={showModal}>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 14,
                  fontFamily: fonts.regular,
                }}>
                ENQUIRE NOW
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Fill The Required Details</Text>
              <TextInput
                style={styles.input}
                placeholder="Number of People"
                keyboardType="numeric"
                value={dState.people}
                onChangeText={value => handleInputChange('people', value)}
              />
              <Calendar
                markingType={'simple'}
                onDayPress={handleDayPress}
                markedDates={markedDates}
                minDate={moment().format('YYYY-MM-DD')}
                hideExtraDays={true}
                disableMonthChange={false}
                theme={{
                  textDayFontFamily: fonts.regular,
                  textMonthFontFamily: fonts.regular,
                  textDayHeaderFontFamily: fonts.regular,
                  selectedDayBackgroundColor: '#2E66E7',
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: '#2E66E7',
                  dayTextColor: '#2d4150',
                  textDisabledColor: '#d9e1e8',
                }}
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 60,
                }}>
                <TouchableOpacity
                  style={{
                    ...styles.modalButton,
                    backgroundColor: 'white',
                  }}
                  onPress={closeModal}>
                  <Text
                    style={{
                      ...styles.modalButtonText,
                      color: 'black',
                      textDecorationLine: 'underline',
                    }}>
                    Close
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={submitHandler}>
                  <Text style={styles.modalButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  headerBackground: {
    width,
    height: height * 0.5, // Set header height as 30% of screen height
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '400',
    color: '#333',
    // eslint-disable-next-line no-dupe-keys
    fontWeight: '700',
    fontFamily: fonts.regular, // Apply font family
  },
  cardDescription: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
    fontFamily: fonts.regular, // Apply font family
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dim the background
  },
  modalContent: {
    width: '80%',
    marginHorizontal: 'auto',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    // alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#777',
    fontFamily: fonts.regular, // Apply font family
  },
  modalMessage: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: fonts.regular, // Apply font family
  },
  input: {
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#f8f8f8',
  },
  textArea: {
    height: 80,
  },
  modalButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    letterSpacing: 1,
    fontFamily: fonts.regular, // Apply font family for the header text
  },
});

export default Gifting;