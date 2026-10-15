import React, {useEffect, useState} from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {Avatar, Text} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '../Config/Config';
import {useNavigation} from '@react-navigation/native';
import {getAllCategerys} from '../Api/Allapi';
import fonts from '../FontFamily/FontFamily';
import CategoryItem from './CategoryItem';

const AllCategoty = () => {
  const [categories, setCategories] = useState([]);
  const navigation = useNavigation();
  const formatDateRange = (createdAt, updatedAt) => {
    const startDate = new Date(createdAt);
    const endDate = new Date(updatedAt);

    const formatDay = date =>
      new Intl.DateTimeFormat('en-US', {weekday: 'long'}).format(date);
    return `${formatDay(startDate)} - ${formatDay(endDate)}`;
  };

  useEffect(() => {
    // Fetch categories and set them in state
    const fetchCategories = async () => {
      try {
        const res = await getAllCategerys();
        if (res?.status == 200) {
          setCategories(res?.data);
        } else {
          setCategories([]);
          console.error('Error fetching categories:', res.message);
        }
      } catch (err) {
        console.error('API Error:', err);
      }
    };

    fetchCategories();
  }, []);

  const renderItem = ({item}) => (
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
              uri: item.image.startsWith('http')
                ? item.image
                : `https://your-image-base-url.com/${item.image}`,
            }}
          />
        </LinearGradient>
        <View style={styles.textContainer}>
          {/* <Text style={[{color: Colors.secondary}, {bottom: 10}]}>
            {formatDateRange(item?.createdAt, item?.updatedAt)}
          </Text> */}

          <Text style={[styles.title, {bottom: 20}]}>
            {item?.title?.substring(0, 30)}
          </Text>

          <Text style={[styles.description, {bottom: 20}]}>
            {item?.description?.length > 53
              ? item?.description?.substring(0, 53) + '...'
              : item?.description}
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('CategoryPackages', {
              id: item?._id,
            })
          }
          style={[styles.exploreButton, {bottom: -15}]}>
          <Text style={{color: '#fff', fontFamily: fonts.regular}}>
            EXPLORE
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{padding: 10}}>
      <FlatList
        data={categories}
        keyExtractor={item => item._id}
        renderItem={item => <CategoryItem item={item.item} isStatic={false} />}
        scrollEnabled={false}
      />
    </View>
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

export default AllCategoty;
