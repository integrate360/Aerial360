import React from 'react';
import {
  ScrollView,
  Text,
  View,
  TextInput,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '../Config/Config';
import HeaderComponent from '../Header/HeaderComponent';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
const {width} = Dimensions.get('window');
import BookingCard from '../BookingCard';
const Wallet = () => {
  return (
    <>
      <>
        {<HeaderComponent />}
        <ScrollView contentContainerStyle={{paddingBottom: 20}}>
          <BookingCard />
        </ScrollView>
      </>
    </>
  );
};

export default Wallet;
