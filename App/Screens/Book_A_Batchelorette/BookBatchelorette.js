import React, {useContext, useEffect, useState} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  ImageBackground,
  Dimensions,
} from 'react-native';
import {Card, Appbar, TextInput, Button} from 'react-native-paper';
import fonts from '../FontFamily/FontFamily';
import {Colors} from '../Config/Config';
import {useNavigation} from '@react-navigation/native';
import UserContext from '../../context/UserContext';
import {Bachelorette} from '../Api/Allapi';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import {Calendar} from 'react-native-calendars';

const {width, height} = Dimensions.get('screen');
const BookBatchelorette = () => {
  const navigation = useNavigation();
  const {email, userId} = useContext(UserContext);
  const [dState, setDState] = useState({
    people: null,
    date: '',
    staticDate: '',
  });
  const [modalVisible, setModalVisible] = useState(false); // State to control modal visibility

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
    Bachelorette({...dState, user: userId});
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
      <ImageBackground
        source={{
          uri: 'https://airbound.in/wp-content/uploads/2024/02/Airbound-26-jan-20247499-704x1024.jpg',
        }}
        style={{
          width,
          height: height * 0.48,
        }}>
        <Appbar.Header style={{backgroundColor: 'transparent'}}>
          <Appbar.BackAction
            size={30}
            color="black"
            onPress={() => navigation.goBack()}
          />
        </Appbar.Header>
      </ImageBackground>
      <View style={{flex: 1}}>
        <Card
          style={{
            backgroundColor: 'white',
            padding: 20,
            width: '100%',
            borderRadius: 0,
            height: '100%',
            top: 10,
          }}>
          <View style={{top: 50}}>
            <Text
              variant="headlineSmall"
              style={{
                color: '#2eb89f',
                paddingBottom: 5,
                fontSize: 20,
                fontFamily: fonts.regular,
              }}>
              BOOK A
            </Text>
            <Text
              variant="headlineMedium"
              style={{
                color: 'black',
                paddingBottom: 5,
                fontFamily: fonts.regular,
              }}>
              PRIVATE/PARTY
            </Text>
            <Text
              variant="bodyMedium"
              style={{
                color: '#aaa',
                fontFamily: fonts.regular,
              }}>
              This is a description of Book A. It's perfect for a private/party,
              featuring fun and exciting activities.
            </Text>
            <View
              style={{
                paddingBottom: 30,
                alignItems: 'center',
                backgroundColor: '#fff',
              }}>
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                start={{x: 0.0, y: 0.2}}
                end={{x: 0.7, y: 1.0}}
                style={{
                  borderRadius: 10,
                  overflow: 'hidden',
                  top: 20,
                }}>
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
          </View>
        </Card>
      </View>
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
                value={dState.people ?? 1}
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

export default BookBatchelorette;
const styles = StyleSheet.create({
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
