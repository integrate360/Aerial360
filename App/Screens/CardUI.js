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
import {Colors} from './Config/Config';

const {width, height} = Dimensions.get('window');
const CARD_WIDTH = width * 0.88;
const SPACING = width * 0.02;

const CardUI = () => {
  const [data, setData] = useState([]);
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    getAllAds(true).then(res => {
      if (Array.isArray(res) && res.length > 0) {
        setData(res);
      }
    });
  }, []);

  useEffect(() => {
    if (!data || data.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % data.length;
      setCurrentIndex(nextIndex);
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({index: nextIndex, animated: true});
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex, data]);

  const onViewableItemsChanged = useRef(({viewableItems}) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  if (!data || data.length === 0) {
    return null;
  }

  const renderItem = ({item}) => (
    <Card style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => {
          if (item?.class) {
            navigation.navigate('CalendarDetails', {item: item.class});
          }
        }}>
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
        keyExtractor={item => item?._id || String(Math.random())}
        horizontal
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{viewAreaCoveragePercentThreshold: 50}}
        snapToInterval={CARD_WIDTH + SPACING * 2}
        decelerationRate="fast"
        contentContainerStyle={styles.flatListContent}
        getItemLayout={(data, index) => ({
          length: CARD_WIDTH + SPACING * 2,
          offset: (CARD_WIDTH + SPACING * 2) * index,
          index,
        })}
      />
      {data.length > 1 && (
        <View style={styles.dotContainer}>
          {data.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
  },
  flatListContent: {
    paddingHorizontal: width * 0.04,
  },
  card: {
    marginHorizontal: SPACING,
    width: CARD_WIDTH,
    height: height * 0.22,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  activeDot: {
    width: 20,
    backgroundColor: Colors.secondary,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#D1D5DB',
  },
});

export default CardUI;
