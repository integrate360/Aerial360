import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {Colors} from './Config/Config';
import {Appbar} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';

const BcDetails = () => {
  const [expandedItem, setExpandedItem] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const item = route?.params?.item;

  const toggleAccordion = id => {
    setExpandedItem(expandedItem === id ? null : id); // Toggle expansion
  };

  // Ensure data is always an array
  const combinedData = Array.isArray(item?.combined)
    ? item?.combined
    : [item?.combined];

  return (
    <LinearGradient
      style={styles.gradientBackground}
      colors={[Colors?.primary, Colors?.secondary]}
      start={{x: 0.0, y: 0.2}}
      end={{x: 0.7, y: 1.0}}>
      <Appbar.Header style={{backgroundColor: 'transparent'}}>
        <Appbar.BackAction
          size={30}
          color="#fff"
          onPress={() => navigation.goBack()}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerText}>{item?.title}</Text>

        <FlatList
          data={combinedData}
          keyExtractor={(subItem, index) => index?.toString()}
          scrollEnabled={false}
          renderItem={({item: subItem, index}) => (
            <View style={styles.accordionItem}>
              <View style={styles.accordionHeader}>
                <Text style={styles.accordionTitle}>
                  {index + 1}. {subItem?.subcategory}
                </Text>
                <Text style={{color: 'black', alignSelf: 'center'}}>-</Text>
                <Text style={{color: 'black'}}>{subItem?.price}</Text>

                <TouchableOpacity
                  onPress={() => toggleAccordion(index)}
                  style={{
                    backgroundColor: Colors.primary,
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                    borderRadius: 8,
                  }}>
                  <Text style={{color: '#fff'}}>Book</Text>
                </TouchableOpacity>
              </View>
              {expandedItem === index && (
                <View style={styles.accordionContent}>
                  {item?.location?.map((location, locationIndex) => (
                    <TouchableOpacity
                      key={locationIndex}
                      onPress={() => {
                        // Action on click (e.g., navigate to a location map screen)
                        navigation.navigate('Packages');
                      }}
                      style={styles.locationItem}>
                      <Text style={styles.locationText}>{location}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 10,
  },
  headerText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 25,
    letterSpacing: 2,
    textAlign: 'center',
    marginVertical: 20,
  },
  accordionItem: {
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  accordionHeader: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accordionTitle: {
    color: 'black',
    fontWeight: '400',
    fontSize: 14,
  },
  accordionContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 10,
    paddingVertical: 20,
    borderBottomEndRadius: 12,
    borderBottomStartRadius: 12,
    paddingHorizontal: 10,
    flexDirection: 'row',
  },
  contentText: {
    color: 'black',
    fontSize: 14,
    letterSpacing: 0.5,
    lineHeight: 20,
  },
  locationItem: {
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    alignSelf: 'flex-start',
    marginHorizontal: 5,
  },
  locationText: {
    fontSize: 14,
    color: Colors.primary,
  },
});

export default BcDetails;
