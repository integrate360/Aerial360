import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from './Config/Config';
import { Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Avatar } from 'react-native-paper';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { getAllTrainers } from './Api/Allapi';
import fonts from './FontFamily/FontFamily';

const Our_Trainers = () => {
  const [expandedItem, setExpandedItem] = useState(null);
  const [userData, setUserData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const [data, setData] = useState([]);

  const toggleAccordion = id => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  useEffect(() => {
    FetchUserData();
    getAllTrainers().then(res => setData(res));
  }, []);

  const FetchUserData = () => {
    setRefreshing(true);
    fetch('https://randomuser.me/api/?results=15')
      .then(response => response.json())
      .then(data => {
        setUserData(data?.results);
        setRefreshing(false);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        setRefreshing(false); // Set refreshing to false in case of an error
      });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    FetchUserData();
  };

  const renderAccordionItem = ({ item }) => {
    const isExpanded = expandedItem === item?._id;
    return (
      <TouchableWithoutFeedback onPress={() => toggleAccordion(item?._id)}>
        <View style={styles.accordionItem}>
          {/* Header Section */}
          <View style={styles.accordionHeader}>
            <Avatar.Image size={70} source={{ uri: item?.image }} />
            <Text style={styles.accordionTitle}>{item?.name}</Text>
            <Icon
              name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={20}
              color="black"
              style={{ marginRight: 10 }}
            />
          </View>

          {/* Expanded Section */}
          {isExpanded && (
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0.0, y: 0.1 }}
              end={{ x: 0.7, y: 0.4 }}
              style={styles.accordionContent}>
              <Text style={styles.contentText}>{item?.description}</Text>
            </LinearGradient>
          )}
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <>
      <LinearGradient
        style={{  }}
        colors={[Colors.primary, Colors.secondary]}
        start={{ x: 0.0, y: 0.3 }}
        end={{ x: 0.7, y: 0.4 }}>
        <Appbar.Header style={{ backgroundColor: 'transparent' }}>
          <Appbar.BackAction
            size={30}
            color="#fff"
            onPress={() => navigation.goBack()}
          />
          <Text style={{
          color: '#FFF',
          fontWeight: '400',
          fontSize: 22,
          textAlign: 'center',
          fontFamily: fonts.regular,
        }}>OUR TRAINERS</Text>
        </Appbar.Header>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh} 
          />
        }>
        <FlatList
          data={data}
          renderItem={renderAccordionItem}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item?._id}
        />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    width: '100%',
    alignSelf: 'center',
  },
  headerText: {
    color: '#FFF',
    fontWeight: '400',
    fontSize: 25,
    textAlign: 'center',


    fontFamily: fonts.regular,
  },
  listContainer: {
    flex: 1,
  },
  accordionItem: {
    marginVertical: 8,
    elevation: 5,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginHorizontal:2,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  accordionTitle: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: fonts.regular,
  },
  accordionContent: {
    paddingVertical: 20,
    borderBottomEndRadius: 12,
    borderBottomStartRadius: 12,
    paddingHorizontal: 15,
    borderBottomRightRadius: 15,
    borderBottomLeftRadius: 15,
  },
  contentText: {
    color: '#fff',
    fontSize: 14,
    letterSpacing: 0.5,
    lineHeight: 20,
    fontFamily: fonts.regular,
  },
});

export default Our_Trainers;
