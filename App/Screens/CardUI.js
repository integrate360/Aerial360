import React, {useState, useRef, useEffect} from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {Card} from 'react-native-paper';
import {getAllAds} from './Api/Allapi';
import {useNavigation} from '@react-navigation/native';
const {width, height} = Dimensions.get('window');

const CardUI = () => {
  const [data, setData] = useState([]);
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    getAllAds().then(res => setData(res));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (data?.length > 0) {
        const nextIndex = (currentIndex + 1) % data?.length;
        setCurrentIndex(nextIndex);
        flatListRef.current.scrollToIndex({index: nextIndex, animated: true});
      }
    }, 3000); // Adjust the scroll interval (in ms)

    return () => clearInterval(interval); // Cleanup on unmount
  }, [currentIndex, data]);

  const onViewableItemsChanged = ({viewableItems}) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  };

  const renderItem = ({item}) => (
    <Card style={styles.card}>
      <TouchableOpacity
        // onPress={() =>
        //   navigation.navigate('CalendarDetails', {item: item?.class})
        // }
        >
        <Card.Cover
          source={{uri: item.image}}
          style={styles.image}
          resizeMode="cover"
        />
      </TouchableOpacity>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item?._id} // Assuming _id is the unique identifier
        horizontal
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{viewAreaCoveragePercentThreshold: 50}}
        // Use `getItemLayout` to improve performance when using `scrollToIndex`
        getItemLayout={(data, index) => ({
          length: width * 0.7, // Card width
          offset: width * 0.7 * index, // Card width * index
          index,
        })}
      />
      <View style={styles.dotContainer}>
        {data?.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 2,
  },
  card: {
    marginHorizontal: width * 0.02,
    width: width * 0.7, // Set width to 70% of screen width
    height: height * 0.2, // Set height to 25% of screen height
    borderRadius: 12,
    elevation: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  image: {
    width: '100%', // Ensure the image fills the card's width
    height: '100%', // Ensure the image fills the card's height
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 5,
    marginHorizontal: 1.5,
    bottom: 5,
  },
  activeDot: {
    backgroundColor: 'black',
  },
  inactiveDot: {
    backgroundColor: '#777',
  },
});

export default CardUI;
