import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import BookingPackageCalender from '../Bookings/BookingPackageCalender';
import {Colors} from '../Config/Config';
const PackageDetailsScreen = () => {
  const [expandedServices, setExpandedServices] = useState({});
  const [isModalVisible, setModalVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const navigation = useNavigation();
  const routes = useRoute();
  const item = routes?.params?.item;
  const days = item?.days;
  const prices = item?.price;
  const calculateSavings = () => {
    if (!item) return 0;
    const originalPrice = item?.offerPrice;
    const discountedPrice = item?.price;
    return Math.round(
      ((originalPrice - discountedPrice) / originalPrice) * 100,
    );
  };

  const toggleService = serviceId => {
    setExpandedServices(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId],
    }));
  };

  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          if (isModalVisible) return setModalVisible(false);
          navigation.goBack();
        }}>
        <Icon name="chevron-left" size={24} color="#000" />
        <Text style={styles.headerTitle}>Package</Text>
      </TouchableOpacity>
    </View>
  );

  const openModal = () => setModalVisible(true);

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.content}>
          <Text>No package data available</Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <Header />

      {isModalVisible == true ? (
        <BookingPackageCalender
          packageId={item?._id}
          packageDuration={item?.duration}
          data={item?.services || []}
          days={days}
          prices={prices}
          index={index}
        />
      ) : (
        <ScrollView style={styles.content}>
          <Text style={styles.title}>{item.name}</Text>

          <View style={styles.priceContainer}>
            <View style={styles.saveTag}>
              <Text style={styles.saveText}>Save {calculateSavings()}%</Text>
            </View>
            <Text style={styles.price}>INR{item?.price?.toLocaleString()}</Text>
          </View>

          <Text style={styles.subtitle}>
            You can select any classes from below please click continue to make
            your appointment.
          </Text>

          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Icon name="clock-outline" size={20} color="#666" />
              <Text style={styles.infoText}>
                Expires after {item?.duration} days
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="map-marker-outline" size={20} color="#666" />
              <Text style={styles.infoText}>Multiple Locations</Text>
            </View>
          </View>

          <Text style={styles.description}>{item?.description}</Text>

          <Text style={styles.selectionTitle}>Classes:</Text>

          {item?.services?.map((service, i) => (
            <TouchableOpacity
              key={service._id}
              style={styles.optionButton}
              onPress={() => {
                setModalVisible(true);
                setIndex(i);
              }}>
              <View style={styles.optionContent}>
                <Image
                  source={{uri: service?.image[0] ?? ''}}
                  style={styles.optionImage}
                />
                <View style={styles.serviceDetails}>
                  <Text style={styles.optionText}>{service.name}</Text>
                  <View style={styles.expandedContent}>
                    <Text style={styles.serviceDescription}>
                      {service?.description}
                    </Text>
                    <Text style={styles.servicePrice}>
                      Price: INR{service?.price}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.continueButton} onPress={openModal}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 8,
    color: '#555',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#777',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  saveTag: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  saveText: {
    color: '#4caf50',
    fontWeight: '500',
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors?.primary,
  },
  subtitle: {
    color: '#666',
    marginBottom: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    color: '#666',
    marginLeft: 4,
  },
  description: {
    marginBottom: 16,
    lineHeight: 20,
    color: '#777',
  },
  selectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 12,
    color: '#777',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 12,
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
  },
  serviceDetails: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#777',
  },
  expandedContent: {
    marginTop: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 14,
    color: '#4a148c',
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: '#4a148c',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#4a148c',
    padding: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PackageDetailsScreen;
