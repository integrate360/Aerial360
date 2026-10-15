import React, {useState, useRef} from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Card, Text, Appbar} from 'react-native-paper';
import {Colors} from './Config/Config';
import {useNavigation} from '@react-navigation/native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'; // Import FontAwesome5

const {width, height} = Dimensions.get('window');

const UBSeeAll = () => {
  const data = [
    {
      id: '1',
      title: 'Trial Areal',
      description:
        'Relaxing yoga session for beginners.Relaxing yoga session for beginners.',
      date: '2024-12-10',
      studioName: 'Yoga Studio A',
    },
    {
      id: '2',
      title: 'Meditation Session',
      description: 'Evening meditation to unwind',
      date: '2024-12-12',
      studioName: 'Peaceful Mind Studio',
    },
    {
      id: '3',
      title: 'Dance Workshop',
      description: 'Fun and energetic dance workshop',
      date: '2024-12-15',
      studioName: 'Dance Studio X',
    },
    {
      id: '4',
      title: 'Art Therapy',
      description: 'Explore your creativity through art',
      date: '2024-12-17',
      studioName: 'Artistic Minds Studio',
    },
    {
      id: '5',
      title: 'Trial Areal',
      description:
        'Relaxing yoga session for beginners.Relaxing yoga session for beginners.',
      date: '2024-12-10',
      studioName: 'Yoga Studio A',
    },
    {
      id: '6',
      title: 'Meditation Session',
      description: 'Evening meditation to unwind',
      date: '2024-12-12',
      studioName: 'Peaceful Mind Studio',
    },
    {
      id: '7',
      title: 'Dance Workshop',
      description: 'Fun and energetic dance workshop',
      date: '2024-12-15',
      studioName: 'Dance Studio X',
    },
    {
      id: '8',
      title: 'Art Therapy',
      description: 'Explore your creativity through art',
      date: '2024-12-17',
      studioName: 'Artistic Minds Studio',
    },
  ];

  // Function to format date in Indian format (DD-MM-YYYY)
  const formatIndianDate = dateString => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so we add 1
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Format dates using the Indian format
  const formattedData = data.map(item => ({
    ...item,
    date: formatIndianDate(item.date),
  }));

  const navigation = useNavigation();

  const renderItem = ({item}) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>{item?.title}</Text>

        <View style={styles.row}>
          <FontAwesome5
            name="calendar-alt"
            size={16}
            color={Colors.secondary}
            style={styles.icon}
          />
          <Text style={styles.date}>{item?.date}</Text>
        </View>

        <View style={styles.row}>
          <FontAwesome5
            name="store"
            size={16}
            color={Colors.secondary}
            style={styles.icon}
          />
          <Text style={styles.studioName}>{item?.studioName}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <>
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        start={{x: 0.0, y: 0.2}}
        end={{x: 0.7, y: 1.0}}
        style={{flex: 1}}>
        <Appbar.Header style={{backgroundColor: 'transparent'}}>
          <Appbar.BackAction
            size={30}
            color="#fff"
            onPress={() => navigation.goBack()}
          />
        </Appbar.Header>
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          <View style={styles.container}>
            <FlatList
              data={formattedData}
              renderItem={renderItem}
              keyExtractor={item => item?.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              scrollEnabled={false}
            />
          </View>
        </ScrollView>
      </LinearGradient>
    </>
  );
};

export default UBSeeAll;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: height * 0.02, // Adjust vertical padding based on screen height
  },
  listContainer: {
    paddingHorizontal: width * 0.03, // Add horizontal padding to the list
  },
  card: {
    marginBottom: height * 0.013, // Add margin between list items
    borderRadius: 13,

    backgroundColor: '#fff', // White background for cards
    elevation: 3, // Add shadow effect on Android
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: height * 0.01, // Vertical margin based on screen height
  },
  description: {
    fontSize: width * 0.04, // Font size based on screen width
    color: '#222',
    bottom: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5, // Space between title, date, and studio
  },
  icon: {
    marginRight: 5,
  },
  date: {
    fontSize: width * 0.04,
    color: Colors.secondary,
  },
  studioName: {
    fontSize: width * 0.04,
    color: Colors.secondary,
  },
});
