import React, {useContext, useState, useEffect, useRef} from 'react';
import {
  Text,
  View,
  Image,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {
  Appbar,
  IconButton,
  Badge,
  Drawer,
  Divider,
  Icon,
  Menu,
  Button,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import UserContext from '../../context/UserContext';
import {Colors} from '../Config/Config';
import fonts from '../FontFamily/FontFamily';
import {getAllClasses, removeFcmToken} from '../Api/Allapi';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message'; // Add this import

const {width, height} = Dimensions.get('window');
const isTablet = width > 600;

const HeaderComponent = ({
  openBottom,
  onOpenCalendar,
  TrueFun,
  Arrow,
  hide,
  shareit,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const translateX = useState(new Animated.Value(-width * 0.8))[0];
  const navigation = useNavigation();
  const {logout, saveLocation, refreshData, email, userId, token} =
    useContext(UserContext);
  const [visible, setVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Khar');
  const [locations, setLocations] = useState([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Add loading state

  useEffect(() => {
    getAllClasses().then(res => {
      if (res?.data) {
        const locationNames = res?.data?.flatMap(item =>
          item?.availability.flatMap(avail =>
            avail?.locations
              .filter(location => location.name)
              .map(location => location.name),
          ),
        );
        const uniqueLocations = [...new Set(locationNames)];

        const rearrangedLocations = uniqueLocations.sort((a, b) => {
          if (a === 'Khar') return -1;
          if (b === 'Khar') return 1;
          return 0;
        });

        setLocations(rearrangedLocations);
        setSelectedLocation(rearrangedLocations[0]);
        saveLocation(selectedLocation);
      }
    });
  }, []);

  const handleSelectOption = () => {
    openBottom(true);
    setVisible(true);
    refreshData();
  };

  const openDrawer = () => {
    setModalVisible(true);
    Animated.timing(translateX, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(translateX, {
      toValue: -width * 0.8,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  const LogOut = async () => {
    // Custom confirmation instead of Alert.alert
    setModalVisible(false);
    
    // Show custom confirmation dialog
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          
          style: 'cancel',
        },
        {
          text: 'Log Out',
          onPress: async () => {
            setIsLoggingOut(true);
            
            try {
              // Show loading toast
              Toast.show({
                type: 'info',
                text1: 'Logging Out',
                text2: 'Please wait...',
                autoHide: false,
              });

              // Remove FCM token from backend before logging out
              if (token) {
                try {
                  await removeFcmToken(token);
                  console.log('FCM token removed successfully');
                } catch (error) {
                  console.error('Error removing FCM token:', error);
                  // Continue with logout even if FCM token removal fails
                }
              }

              // Hide the loading toast
              Toast.hide();
              
              // Perform logout
              logout();
              
              // Show success message
              Toast.show({
                type: 'success',
                text1: 'Logged Out Successfully',
                text2: 'You have been logged out',
                visibilityTime: 3000,
                onHide: () => {
                  navigation.navigate('Login');
                },
              });

            } catch (error) {
              console.error('Logout error:', error);
              
              // Hide any existing toast
              Toast.hide();
              
              // Show error message
              Toast.show({
                type: 'error',
                text1: 'Logout Failed',
                text2: 'An error occurred during logout',
                visibilityTime: 3000,
              });
              
              setIsLoggingOut(false);
            }
          },
          style: 'destructive',
        },
      ],
      {cancelable: true},
    );
  };

  return (
    <>
      <Appbar.Header
        style={{
          backgroundColor: '#fff',
          shadowColor: '#874d3b',
          shadowOffset: {width: 0, height: 10},
          shadowOpacity: 0.6,
          shadowRadius: 50,
          elevation: 10,
          height: height * 0.08,
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
          {Arrow == true ? (
            <Appbar.BackAction onPress={() => navigation.goBack()} />
          ) : (
            <IconButton
              icon="menu"
              color="#000"
              size={isTablet ? 40 : 30}
              onPress={openDrawer}
            />
          )}

          <Image
            source={require('../../assets/AirbLogo.png')}
            style={{
              width: isTablet ? width * 0.15 : width * 0.25,
              height: isTablet ? height * 0.06 : height * 0.05,
              resizeMode: 'contain',
              marginLeft: width * 0.02,
            }}
          />
        </View>

        {TrueFun === true ? (
          <>
            <View style={{}}>
              <Button
                mode="outlined"
                onPress={() => handleSelectOption()}
                style={{
                  borderRadius: 4,
                  borderWidth: 0,
                  backgroundColor: '#f9f9f9',
                }}
                icon={'chevron-down'}
                textColor={Colors.primary}>
                {shareit ? shareit : selectedLocation}
              </Button>
            </View>

            <IconButton
              icon="calendar"
              size={28}
              color="black"
              onPress={() => onOpenCalendar()}
            />
          </>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              position: 'absolute',
              right: width * 0.03,
              top: height * 0.01,
            }}>
            {hide == true ? null : (
              <TouchableOpacity
                onPress={() => navigation.navigate('SearchClasses')}>
                <Image
                  source={require('../../assets/search.png')}
                  width={20}
                  style={{width: 21, height: 21, top: 10, right: 10}}
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </Appbar.Header>

      <Modal
        transparent
        visible={modalVisible}
        animationType="none"
        onRequestClose={closeDrawer}>
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.drawer, {transform: [{translateX}]}]}>
          <View style={{flex: 1, backgroundColor: '#fff'}}>
            <View style={styles.drawerHeader}>
              <Image
                source={require('../../assets/Airbound-Logo-.png')}
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
            </View>

            <IconButton
              icon="close"
              size={30}
              style={styles.drawerCloseButton}
              iconColor="#fff"
              onPress={closeDrawer}
            />

            {/* Drawer Items */}

            <ScrollView
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}>
              <Drawer.Section style={styles.drawerSection} showDivider={false}>
                {[
                  {
                    label: 'How It Works',
                    icon: 'table',
                    screen: 'How_it_Works',
                  },
                  {
                    label: 'Our Trainers',
                    icon: 'account-group',
                    screen: 'Our_Trainers',
                  },
                  {
                    label: 'Bookings',
                    icon: 'calendar-check',
                    screen: 'Booking',
                  },
                  {
                    label: 'My Packages',
                    icon: 'package',
                    screen: 'UserPackages',
                  },
                  {
                    label: 'Gifting',
                    icon: 'gift',
                    screen: 'Gifting',
                  },
                  {
                    label: 'Terms & Conditions',
                    icon: 'file-document',
                    screen: 'TERMSCompnent',
                  },
                  {
                    label: 'FAQs',
                    icon: 'account-question',
                    screen: 'FAQsection',
                  },
                  {
                    label: 'Book A Private/Party',
                    icon: 'book-variant',
                    screen: 'BookBatchelorette',
                  },
                ].map(item => (
                  <Drawer.Item
                    key={item.label}
                    style={{right: 20}}
                    labelMaxFontSizeMultiplier={23}
                    icon={({color, size}) => (
                      <>
                        <IconButton
                          icon={item.icon}
                          iconColor="#fff"
                          size={21}
                          style={{
                            alignContent: 'center',
                            alignSelf: 'center',
                            alignItems: 'center',
                            backgroundColor: Colors.secondary,
                            borderRadius: 10,
                            opacity: 0.7,
                          }}
                        />
                        <Text
                          style={{
                            color: 'black',
                            marginLeft: 10,
                            fontSize: 15,
                            fontWeight: '600',
                            opacity: 0.8,
                            fontFamily: fonts.regular,
                          }}>
                          {item?.label}
                        </Text>
                        <View
                          style={{
                            opacity: 0.8,
                          }}>
                          <IconButton
                            name="chevron-right"
                            size={25}
                            color="red"
                            style={{}}
                          />
                        </View>
                      </>
                    )}
                    onPress={() => {
                      navigation.navigate(item?.screen);
                      setModalVisible(false);
                    }}
                    contentStyle={styles.drawerItemContent}
                  />
                ))}
              </Drawer.Section>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footerContainer}>
              <View
                style={{
                  borderWidth: 0.2,
                  borderColor: Colors.secondary,
                  opacity: 0.6,
                }}></View>
              <Drawer.Section
                style={styles.drawerFooterSection}
                showDivider={false}>
                {email && userId ? (
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      opacity: isLoggingOut ? 0.7 : 1,
                    }}
                    onPress={() => LogOut()}
                    disabled={isLoggingOut}>
                    <IconButton
                      icon={isLoggingOut ? "loading" : "exit-to-app"}
                      size={24}
                      color={Colors.primary}
                      style={{marginRight: 3}}
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        color: 'black',
                        fontFamily: fonts.regular,
                      }}>
                      {isLoggingOut ? 'Logging Out...' : 'Sign Out'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                    }}
                    onPress={() => {
                      closeDrawer();
                      navigation.navigate('Login');
                    }}>
                    <IconButton
                      icon="exit-to-app"
                      size={24}
                      color={Colors.primary}
                      style={{marginRight: 3}}
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        color: 'black',
                        fontFamily: fonts.regular,
                      }}>
                      Login
                    </Text>
                  </TouchableOpacity>
                )}
              </Drawer.Section>

              <View style={styles.developerSection}>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#777',
                    fontFamily: fonts.medium,
                    marginRight: 10,
                  }}>
                  Developer
                </Text>

                <View style={{flexDirection: 'row'}}>
                  <TouchableOpacity
                    onPress={() => Linking.openURL('tel:7977105170')}
                    style={{marginRight: 12}}>
                    <Ionicons name="call" size={18} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL('mailto:mehul@integrate360.in')
                    }>
                    <Ionicons name="mail" size={18} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    width: width * 0.8,
    height: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 5, height: 0},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  drawerHeader: {
    backgroundColor: '#f2f2f2',
    height: height * 0.25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerCloseButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 1,
  },
  scrollViewContent: {
    padding: 10,
    flexGrow: 1,
  },
  drawerSection: {
    marginVertical: 10,
  },
  drawerItem: {
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerContainer: {
    marginTop: 'auto',
    paddingBottom: 20,
  },
  drawerFooterSection: {
    padding: 10,
    fontFamily: fonts.regular,
  },
  developerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginHorizontal: 10,
    marginTop: 15,
  },
});

export default HeaderComponent;