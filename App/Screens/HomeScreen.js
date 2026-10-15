import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import {
  ScrollView,
  Text,
  View,
  Dimensions,
  Image,
  TouchableOpacity,
  RefreshControl, // Import RefreshControl
} from 'react-native';
import {Card} from 'react-native-paper';
import CardUI from './CardUI';
import UpcommingBatches from './UpcommingBatches';
import LinearGradient from 'react-native-linear-gradient';
import AllCategoty from './Category/AllCategoty';
import HeaderComponent from './Header/HeaderComponent';
import {Colors} from './Config/Config';
const {width, height} = Dimensions.get('window');
const isTablet = width > 600; // Basic check to determine if the device is a tablet
import fonts from './FontFamily/FontFamily';
import {refreshAllData} from './Api/Allapi';
import useDoubleBackExit from './UseDoubleBackExit';
import StaticCategory from './Category/StaticCategories';
const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const refreshedData = await refreshAllData();
    } catch (error) {
      console.log('Error refreshing data:', error);
    } finally {
      setRefreshing(false); // Stop the refreshing indicator
    }
  };

  useDoubleBackExit();

  // const onRefreshs = async () => {
  //   try {
  //     const refreshedData = await refreshAllData();
  //   } catch (error) {
  //   }
  // };

  // useEffect(() => {
  //   const fetchDataOnce = async () => {
  //     await onRefreshs();  // Call the refresh function once
  //   };

  //   fetchDataOnce(); // Trigger the fetch when component mounts

  // }, []); // Empty dependency array ensures it's called only once when component mounts

  return (
    <>
      <HeaderComponent />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: isTablet ? height * 0.05 : height * 0.1,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]} // Optional: change the spinner color
          />
        }>
        <View style={{flex: 1, paddingBottom: 10, marginTop: 5}}>
          <CardUI />
        </View>

        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          start={{x: 0.0, y: 0.2}}
          end={{x: 0.7, y: 1.0}}
          style={{
            paddingVertical: isTablet ? 20 : 10,
            paddingHorizontal: isTablet ? 20 : 10,
            marginVertical: isTablet ? height * 0.02 : height * 0.01,
            bottom: 15,
          }}>
          <View>
            <Text
              style={{
                fontSize: isTablet ? 20 : width * 0.05,
                marginBlock: 0.7,
                color: '#fff',
                left: 13,
                fontWeight: 'bold',
                fontFamily: fonts.regular,
              }}>
              Upcoming Batches
            </Text>

            <UpcommingBatches />
          </View>
        </LinearGradient>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <View
            style={{
              flex: 1,
              height: 1,
              backgroundColor: Colors.secondary,
              paddingHorizontal: 100,
              paddingVertical: 1.5,
            }}
          />
          <Text
            style={{
              marginHorizontal: width * 0.02,
              fontSize: isTablet ? 22 : width * 0.05,
              color: Colors.primary,
              fontWeight: '400',
              fontFamily: fonts.regular,
            }}>
            OUR PROGRAMS
          </Text>
          <View
            style={{
              flex: 1,
              paddingVertical: 1.5,
              backgroundColor: Colors.secondary,
            }}
          />
        </View>

        <View>
          <Image
            source={require('../assets/backgroundLogo.jpeg')}
            style={{
              position: 'absolute',
              alignContent: 'center',
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              marginTop: 200,
              width: '100%',
              height: 300,
            }}
          />
        </View>

        <StaticCategory />
        {/* 
        <View style={{flex: 1, marginTop: 40}}>
          <Card
            style={{
              backgroundColor: 'black',
              padding: 20,
              width: '100%',
              borderRadius: 0,
            }}>
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
                color: '#fff',
                paddingBottom: 5,
                fontFamily: fonts.regular,
              }}>
              BACHELORETTE
            </Text>
            <Text
              variant="bodyMedium"
              style={{
                color: '#aaa',
                fontFamily: fonts.regular,
              }}>
              This is a description of Book A. It's perfect for a bachelorette
              party, featuring fun and exciting activities.
            </Text>
            <TouchableOpacity
              style={{
                paddingVertical: 13,
                alignItems: 'center',
                backgroundColor: Colors.primary,
                borderRadius: 5,
                marginTop: 26,
                width: '99%',
                alignSelf: 'center',
              }}>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 10,
                  fontFamily: fonts.regular,
                }}>
                ENQUIRE NOW
              </Text>
            </TouchableOpacity>
          </Card>
        </View> */}
      </ScrollView>
    </>
  );
};

export default HomeScreen;
