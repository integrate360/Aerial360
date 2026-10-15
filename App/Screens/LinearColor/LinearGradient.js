import React from 'react';
import {Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '../Config/Config';
const LinearGradients = ({Text}) => {
  return (
    <LinearGradient
      start={{x: 0.0, y: 0.2}}
      end={{x: 0.7, y: 1.0}}
      colors={[Colors.primary, Colors.secondary]}>
      <Text>{Text}</Text>
    </LinearGradient>
  );
};

export default LinearGradients;
