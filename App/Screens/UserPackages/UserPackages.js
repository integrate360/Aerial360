import React, { useEffect, useState, useContext } from 'react';
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Appbar, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
const { width } = Dimensions.get('window');
import { Colors } from '../Config/Config';
import UserContext from '../../context/UserContext';
import axios from 'axios';
import { BaseUrl } from '../Api/BaseUrl';
import fonts from '../FontFamily/FontFamily'; // Assuming you have a fonts file
import moment from 'moment';
import { getUserPackgeById } from '../Api/Allapi';

const UserPackages = () => {
  const navigation = useNavigation();
  const { userId, token } = useContext(UserContext);
  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(false);
  const [selectedUserPackage, setSelectedUserPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    getPackageByUser();
  }, []);
  // const clickHandler = async (id, remainingSlots) => {
  //   try {
  //     setLoading(true);
  //     const pack = await getUserPackgeById(id, token);
  //     console.log('====================================');
  //     console.log("pack: ",pack);
  //         console.log("pack.data: ",pack.data);

  //     console.log('====================================');
  //     setLoading(false);
  //     if (pack?.status !== 200) return Alert.alert(pack.message);

  //     // Find the user package from the data array
  //     const userPackage = data.find(pkg => pkg._id === id);


  //     navigation.navigate('RemainigPackage', {
  //       packageId: id,
  //       item: pack?.data?.data?.package,
  //       bookings: pack?.data?.data?.bookings,
  //       remainingSlots,
  //       userPackage: userPackage, // Pass the user package data including extendedValidityEndDate
  //     });
  //   } catch (error) {
  //     setLoading(false);
  //   }
  // };

  const clickHandler = async (id, remainingSlots) => {
    try {
      setLoading(true);
      const pack = await getUserPackgeById(id, token);
      console.log('====================================');
      console.log("pack: ", pack);
      console.log("pack.data: ", pack.data);
      console.log('====================================');
      setLoading(false);
      if (pack?.status !== 200) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: pack.message || 'Something went wrong',
          position: 'top',
          visibilityTime: 4000,
        });
        return;
      }
      // Find the user package from the data array
      const userPackage = data.find(pkg => pkg._id === id);

      navigation.navigate('RemainigPackage', {
        packageId: id,
        item: pack?.data?.data?.package,
        bookings: pack?.data?.data?.bookings,
        remainingSlots,
        userPackage: pack?.data?.data, // Pass the actual user package data with createdAt
      });
    } catch (error) {
      setLoading(false);
    }
  };

  const getPackageByUser = async () => {
    setLoader(true);
    try {
      const response = await axios.get(
        `${BaseUrl}user-package/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // console.log('===============USER PACKAGE DATA=====================');
      // console.log("Our Booking data response: ",response.data);
      // console.log('==================USER PACKAGE DATA==================');
      if (response?.data?.data) {
        setData(response?.data?.data?.reverse());
      } else {
        setData([]);
      }
    } catch (error) {
      console.error(
        'Error fetching bookings:',
        error.response?.data || error.message,
      );
    } finally {
      setLoader(false);
    }
  };

  const getPackageEndDate = (item) => {
    if (item?.extendedValidityEndDate) {
      return moment(item.extendedValidityEndDate);
    }

    const startDate = moment(item?.createdAt);
    const durationInDays = item?.package?.duration || 0;

    return startDate.clone().add(durationInDays, 'days');
  };

  const isPackageExpired = (item) => {
    const endDate = getPackageEndDate(item);
    return moment().isAfter(endDate, 'day');
  };


  const renderUserPackageItem = ({ item }) => {
    const remainingSlots = item?.totalSlots - item?.slots;

    const endDate = getPackageEndDate(item);
    const expired = isPackageExpired(item);

    return (
      <View style={[styles.card, expired && styles.cardExpired]}>
        <View style={styles.content}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.cardTitle}>{item?.package?.name}</Text>
            <Text style={styles.cardLocation}>
              {`${item?.slots}/${item?.totalSlots}`}
            </Text>
          </View>

          <Text style={styles.cardDate}>
            Started on {moment(item?.createdAt).format('DD MMM YYYY')}
          </Text>

          <Text style={styles.cardDate}>
            Valid till {endDate.format('DD MMM YYYY')}
          </Text>

          <View style={{ flexDirection: 'row', gap: 10, alignSelf: 'flex-end' }}>
            {expired ? (
              <Button mode="outlined" disabled>
                Package Expired
              </Button>
            ) : (
              <Button
                mode="outlined"
                onPress={() =>
                  clickHandler(item?._id, remainingSlots)
                }>
                {remainingSlots > 0 ? 'Book Remaining' : 'View Bookings'}
              </Button>
            )}
          </View>
        </View>
      </View>
    );
  };


  return (
    <>
      <LinearGradient
        style={styles.gradient}
        colors={[Colors.primary, Colors.secondary]}
        start={{ x: 0.0, y: 0.3 }}
        end={{ x: 0.7, y: 0.4 }}>
        <Appbar.Header style={styles.appbarHeader}>
          <Appbar.BackAction
            size={30}
            color="#fff"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>My Packages</Text>
        </Appbar.Header>
      </LinearGradient>
      <View style={styles.container}>
        {loader ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderUserPackageItem}
            contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}   // ✅ DISABLE RIGHT LINE
            ListEmptyComponent={
              <Text style={styles.emptyText}>No Package Yet.</Text>
            }
          />
        )}
      </View>
    </>
  );
};

// Styles for the UI with font family applied globally
const styles = StyleSheet.create({
  gradient: {},
  appbarHeader: {
    backgroundColor: 'transparent',
  },
  headerTitle: {
    color: '#FFF',
    fontWeight: '400',
    fontSize: 21,
    textAlign: 'left',
    flex: 1,

    fontFamily: fonts.regular, // Apply font family
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 10,
    paddingTop: 20,
    fontFamily: fonts.regular, // Apply font family globally
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 25,
    alignItems: 'center',
    backgroundColor: '#ddd',
    color: 'black',
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    fontFamily: fonts.regular, // Apply font family
  },
  activeTabText: {
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  cardExpired: {
    opacity: 0.5,
  },
  image: {
    width: 140,
    height: 150,
    borderRadius: 10,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    marginRight: 6,
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    padding: 12,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 14,
    color: 'black',

    marginBottom: 2,
  },
  cardTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  cardLocation: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    marginTop: 6,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#555',
    fontSize: 16,
    marginTop: 20,
    fontFamily: fonts.regular, // Apply font family
  },
  button: {
    // backgroundColor: 'lightblue', // Blue color
    paddingVertical: 6,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#007bff',
    textDecorationLine: 'underline',
    fontSize: 16,
    textAlign: 'right',
    fontWeight: 'bold',
  },
});

export default UserPackages;
