import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import HeaderComponent from '../Header/HeaderComponent';
import AllCategoty from '../Category/AllCategoty';
import GetAllClasess from '../Category/GetAllClasess';
const AllClasses = () => {
  return (
    <>
      <HeaderComponent />
      <ScrollView style={{}} contentContainerStyle={{paddingBottom: 60}}>
        <GetAllClasess />
      </ScrollView>
    </>
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
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  buttonContainer: {
    marginLeft: 12,
  },
  demoText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
});

export default AllClasses;
