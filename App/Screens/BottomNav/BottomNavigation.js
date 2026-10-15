import React, {useContext, useState} from 'react';
import {View, StyleSheet, TouchableOpacity, Animated, Text} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from '../HomeScreen';
import ProfileScreen from '../MainScreens/ProfileScreen';
import LinearGradient from 'react-native-linear-gradient';
import Calendars from '../MainScreens/Calendar';
import {Colors} from '../Config/Config';
import useDoubleBackExit from '../UseDoubleBackExit';
import AllClasses from '../Classes/AllClasses';
import Classes_Scheduls from '../classes_schedule/Classes_Scheduls';
import fonts from '../FontFamily/FontFamily';
import UserContext from '../../context/UserContext';
import Login from '../AuthScreen/Login';
import AllCategoty from '../Category/AllCategoty';
import AllCategoryForBottomNav from '../Category/AllCategoryForBottomNav';
const BottomNavigation = () => {
  const [index, setIndex] = useState(1);
  const {email, userId} = useContext(UserContext);

  const animation = useState(new Animated.Value(1))[0];
  useDoubleBackExit();

  const handleIndexChange = newIndex => {
    setIndex(newIndex);
    triggerAnimation();
  };

  const triggerAnimation = () => {
    Animated.sequence([
      Animated.spring(animation, {
        toValue: 1.2,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.spring(animation, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animatedStyle = {transform: [{scale: animation}]};

  const renderScreen = () => {
    switch (index) {
      case 0:
        return <Calendars />;
      case 1:
        return <HomeScreen />;
      case 2:
        return <Classes_Scheduls />;
      case 3:
        return <AllCategoryForBottomNav />;
      case 4:
        return email && userId ? <ProfileScreen hide={true} /> : <Login />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderScreen()}</View>
      <View style={styles.bottomNav}>
        {renderTabButton(
          'home',
          25,
          1,
          handleIndexChange,
          index,
          animatedStyle,
          'Home',
        )}
        {renderTabButton(
          'lightbulb-multiple',
          28,
          2,
          handleIndexChange,
          index,
          animatedStyle,
          'Schedule',
          Icon,
        )}

        {renderHomeButton(index, handleIndexChange)}
        {renderTabButton(
          'dropbox',
          27,
          3,
          handleIndexChange,
          index,
          animatedStyle,
          'Programs',
        )}
        {renderUserProfileButton(index, handleIndexChange)}
      </View>
    </View>
  );
};

const renderTabButton = (
  iconName,
  iconSize,
  tabIndex,
  handleIndexChange,
  currentIndex,
  animatedStyle,
  label,
  IconComponent = Icon,
) => (
  <TouchableOpacity
    onPress={() => handleIndexChange(tabIndex)}
    style={styles.tabButton}>
    <Animated.View style={currentIndex === tabIndex ? animatedStyle : null}>
      <IconComponent
        name={iconName}
        size={iconSize}
        color={currentIndex === tabIndex ? Colors.secondary : 'rgb(32, 31, 31)'}
      />
    </Animated.View>
    {label && (
      <Text
        style={[
          styles.tabLabel,
          currentIndex === tabIndex && styles.activeTab,
        ]}>
        {label}
      </Text>
    )}
  </TouchableOpacity>
);

const renderHomeButton = (currentIndex, handleIndexChange) => (
  <TouchableOpacity
    onPress={() => handleIndexChange(0)}
    style={styles.homeButtonContainer}
    activeOpacity={0.9}>
    <LinearGradient
      colors={[Colors.primary, Colors.secondary]}
      start={{x: 0.0, y: 0.2}}
      end={{x: 0.7, y: 1.0}}
      style={{
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#2eb89f',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.29,
        shadowRadius: 4.65,
        elevation: 7,
        marginBottom: 50,
      }}>
      <View style={{alignItems: 'center', justifyContent: 'center'}}>
        <Icon name="calendar-month" size={22} color="#fff" />
        <Text
          style={{
            fontSize: 10,
            color: '#fff',
            fontWeight: '500',
            fontFamily: fonts.regular,
          }}>
          Book
        </Text>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const renderUserProfileButton = (currentIndex, handleIndexChange) => (
  <TouchableOpacity
    onPress={() => handleIndexChange(4)}
    style={styles.tabButton}>
    <Animated.View>
      <Icon
        name="account-circle"
        size={30}
        color={currentIndex === 4 ? Colors.secondary : 'black'}
      />
    </Animated.View>
    <Text style={[styles.tabLabel, currentIndex === 4 && styles.activeTab]}>
      Profile
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {flex: 1},
  content: {flex: 1},
  bottomNav: {
    height: 75,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.2,
    shadowRadius: 3.5,
  },
  tabButton: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  tabLabel: {
    fontSize: 12,
    color: 'black',
    marginTop: 5,
    fontFamily: fonts.regular,
  },
  activeTab: {
    color: Colors.secondary,
  },
  homeButtonContainer: {alignItems: 'center', justifyContent: 'center'},
  homeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2eb89f',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7,
    marginBottom: 50,
  },
});

export default BottomNavigation;
