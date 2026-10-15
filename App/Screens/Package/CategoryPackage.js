import React, {useEffect, useState, useRef, useContext} from 'react';
import {
  ScrollView,
  View,
  FlatList,
  Text,
  Dimensions,
  Animated,
  TouchableOpacity,
  Linking,
  PanResponder,
  StyleSheet,
  Modal,
} from 'react-native';
import {Card, Title, Paragraph, Appbar} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation, useRoute} from '@react-navigation/native';
import {getAllPackges, getCategoryPackges} from '../Api/Allapi';
import {Colors} from '../Config/Config';
const {height} = Dimensions.get('window'); // Get screen height
import UserContext from '../../context/UserContext';
import fonts from '../FontFamily/FontFamily';
// CategoryPackages Component
const CategoryPackages = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const id = route?.params?.id;
  const [data, setData] = useState([]);
  const [noData, setNoData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [packageId, setPackageId] = useState('');

  const {userId, email} = useContext(UserContext);

  useEffect(() => {
    getCategoryPackges(id)
      .then(res => {
        setData(res);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleCardPress = item => {
    if (userId) {
      navigation.navigate('PackagesDetails', {item});
    } else {
      navigation.navigate('Login');
    }
  };

  const renderItem = ({item}) => (
    <Card
      style={{margin: 10, backgroundColor: '#fff'}}
      onPress={() => handleCardPress(item)}>
      <Card.Content>
        <Title
          style={{color: 'black', fontSize: 18, fontFamily: fonts.regular}}>
          {item?.name}
        </Title>
        <Paragraph style={styles.cardDescription}>
          {item?.description}
        </Paragraph>
        <View style={{flexDirection: 'row', alignSelf: 'flex-end'}}>
          <Paragraph style={styles.cardTag}>
            <Text style={{color: 'green', fontFamily: fonts.regular}}>
              Days {item?.days}
            </Text>
          </Paragraph>
          <Paragraph style={styles.cardTag}>
            <Text style={{color: Colors.primary, fontFamily: fonts.regular}}>
              ₹ {item?.price}
            </Text>
          </Paragraph>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <LinearGradient
      style={{flex: 1}}
      colors={[Colors.primary, Colors.secondary]}
      start={{x: 0.0, y: 0.2}}
      end={{x: 0.7, y: 1.0}}>
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <Appbar.Header style={{backgroundColor: 'transparent'}}>
          <Appbar.BackAction
            size={27}
            color="#fff"
            onPress={navigation.goBack}
          />
          <Appbar.Content
            title="Packages"
            titleStyle={{
              color: '#fff',
              fontSize: 18,
              fontFamily: fonts.regular,
            }}
          />
        </Appbar.Header>

        <View style={{padding: 5}}>
          <Text
            style={{
              textAlign: 'justify',
              color: '#fff',
              marginHorizontal: 10,
              fontFamily: fonts.regular,
            }}>
            Hey, there are special packages with this service, check them out!
          </Text>
          {loading ? (
            <Text
              style={{
                color: '#fff',
                textAlign: 'center',
                marginTop: 20,
                fontFamily: fonts.regular,
              }}>
              Loading...
            </Text>
          ) : noData ? (
            <Text
              style={{
                color: '#fff',
                textAlign: 'center',
                marginTop: 20,
                fontFamily: fonts.regular,
              }}>
              No packages found for this service.
            </Text>
          ) : (
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default CategoryPackages;

const styles = StyleSheet.create({
  bottomSheet: {
    position: 'absolute',
    width: '100%',
    height: height,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: Colors.primary,
    textAlign: 'left',
  },
  address: {
    fontSize: 14,
    color: '#555',
    marginVertical: 5,
  },
  linkButton: {
    marginTop: 10,
    padding: 8,
    borderRadius: 10,
    backgroundColor: Colors.secondary,
    alignSelf: 'flex-start',
  },
  linkText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  cardDescription: {
    color: 'grey',
    marginTop: 5,
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 10,
    fontFamily: fonts.regular,
  },
  cardTag: {
    color: 'grey',
    marginTop: 5,
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 10,
  },
});
