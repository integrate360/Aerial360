import React from 'react';
import {Colors} from '../Config/Config';
import fonts from '../FontFamily/FontFamily';
import {View, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Avatar, Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

const CategoryItem = ({item, isStatic}) => {
  const navigation = useNavigation();
  return (
    <View style={styles.card}>
      <View style={styles.rowContainer}>
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          start={{x: 0.0, y: 0.2}}
          end={{x: 0.7, y: 1.0}}
          style={styles.gradientContainer}>
          <Avatar.Image
            size={90}
            source={{
              uri: item?.image?.startsWith('http')
                ? item.image
                : `https://your-image-base-url.com/${item.image}`,
            }}
          />
        </LinearGradient>
        <View style={styles.textContainer}>
          {/* <Text style={[{color: Colors.secondary}, {bottom: 10}]}>
                {formatDateRange(item?.createdAt, item?.updatedAt)}
              </Text> */}

          <Text style={[styles.title, {bottom: 16}]}>
            {item?.title?.length > 20
              ? item.title.substring(0, 20) + '...'
              : item.title}
          </Text>

          <Text style={[styles.description, {bottom: 20}]}>
            {item?.description?.length > 46
              ? item?.description?.substring(0, 46) + '...'
              : item?.description}
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() =>
            // navigation.navigate('CategoryPackages', {
            //   id: item?._id,
            // })
            {
              if (isStatic)
                return navigation.navigate('StaticBookingCard', {
                  item: item?._id,
                  bool: true,
                });
              navigation.navigate('BookingCard', {
                item: item?._id,
                bool: true,
              });
            }
          }
          style={[styles.exploreButton, {bottom: -19}]}>
          <Text style={{color: '#fff', fontFamily: fonts.regular}}>
            EXPLORE
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CategoryItem;

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
  gradientContainer: {
    marginRight: 10,
    bottom: 30,
    elevation: 4,
    borderRadius: 50,
    padding: 5,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    fontFamily: fonts.regular,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontFamily: fonts.regular,
  },
  footer: {
    bottom: 20,
  },
  footerText: {
    fontSize: 13,
    color: 'black',
    fontWeight: '400',
  },
  exploreButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 15,
    position: 'absolute',
    alignSelf: 'flex-end',
    // marginTop: 25,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
