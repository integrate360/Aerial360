import React, {useState} from 'react';
import {ScrollView, Text, View, TouchableOpacity, FlatList} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '../Config/Config';
import {Appbar} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import fonts from '../FontFamily/FontFamily';

const HowItWorks = () => {
  const tabs = ['TRIAL CLASS', 'PACKAGES'];
  const [activeTab, setActiveTab] = useState('TRIAL CLASS');
  const navigation = useNavigation();

  const trialSteps = [
    {
      id: '1',
      title: 'Getting Started',
      description: 'Launch the app and navigate to the Programs section.',
    },
    {
      id: '2',
      title: 'Select Category',
      description:
        'Browse through our available categories and select your preferred program.',
    },
    {
      id: '3',
      title: 'Choose Class',
      description:
        'Within your selected category, explore the available classes and select your preferred option.',
    },
    {
      id: '4',
      title: 'View Details',
      description:
        'Review the class details and click "Book Class" to proceed.',
    },
    {
      id: '5',
      title: 'Select Trial Package',
      description:
        'Choose the "Single Session - 1 Day Validity" option from the available packages.',
    },
    {
      id: '6',
      title: 'Schedule Selection',
      description:
        'Select your preferred date from the available options. Available time slots will be displayed accordingly.',
    },
    {
      id: '7',
      title: 'Location & Terms',
      description:
        'Choose your preferred location, review and accept the Terms and Conditions.',
    },
    {
      id: '8',
      title: 'Payment & Confirmation',
      description:
        "Complete your booking by processing the payment. Once confirmed, you'll be directed to your bookings page.",
    },
  ];

  const packageSteps = [
    {
      id: '1',
      title: 'Getting Started',
      description: 'Launch the app and navigate to the Programs section.',
    },
    {
      id: '2',
      title: 'Select Category',
      description:
        'Browse through our available categories and select your preferred program.',
    },
    {
      id: '3',
      title: 'Choose Class',
      description:
        'Within your selected category, explore the available classes and select your preferred option.',
    },
    {
      id: '4',
      title: 'View Details',
      description:
        'Review the class details and click "Book Class" to proceed.',
    },
    {
      id: '5',
      title: 'Package Selection',
      description:
        'Browse through our available packages and select the one that best suits your needs.',
    },
    {
      id: '6',
      title: 'Package Overview',
      description:
        'Review the comprehensive package details, including included classes and validity.',
    },
    {
      id: '7',
      title: 'Class Selection',
      description:
        'Choose from the available classes included in your package.',
    },
    {
      id: '8',
      title: 'Schedule Selection',
      description:
        'Select your preferred dates and times from the available slots within the package validity period.',
    },
    {
      id: '9',
      title: 'Session Planning',
      description:
        'Add your selected classes to your schedule. You can schedule multiple sessions across different classes.',
    },
    {
      id: '10',
      title: 'Review Selections',
      description:
        'Review your selected classes and schedules. You can distribute sessions across different classes within your package limit.',
    },
    {
      id: '11',
      title: 'Flexible Booking',
      description:
        'Schedule remaining sessions at your convenience through the "My Packages" page within the package validity period.',
    },
    {
      id: '12',
      title: 'Payment & Confirmation',
      description:
        'Complete your purchase through our secure payment gateway. Your package will appear in your purchased package list.',
    },
  ];

  const currentData = activeTab === 'TRIAL CLASS' ? trialSteps : packageSteps;

  const renderItem = ({item, index}) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        marginVertical: 6,
        marginHorizontal: 16,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}>
      <View
        style={{
          backgroundColor: Colors.primary,
          width: 28,
          height: 28,
          borderRadius: 14,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '500',
            color: '#ffffff',
            fontFamily: fonts.regular,
          }}>
          {index + 1}
        </Text>
      </View>
      <View style={{flex: 1}}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '500',
            color: Colors.secondary,
            marginBottom: 6,
            fontFamily: fonts.regular,
          }}>
          {item.title}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: '#666666',
            fontWeight: '400',
            fontFamily: fonts.regular,
            lineHeight: 20,
          }}>
          {item.description}
        </Text>
      </View>
    </View>
  );

  return (
    <>
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        start={{x: 0.0, y: 0.3}}
        end={{x: 0.7, y: 0.4}}
        style={{}}>
        <Appbar.Header style={{backgroundColor: 'transparent'}}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Appbar.BackAction size={30} color="#fff" />
          </TouchableOpacity>
          <Text
            style={{
              color: '#FFF',
              fontWeight: '500',
              fontSize: 20,
              fontFamily: fonts.regular,
            }}>
            How It Works
          </Text>
        </Appbar.Header>
      </LinearGradient>

      <View style={{paddingHorizontal: 16, paddingTop: 20}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={{
                flex: 1,
                marginHorizontal: 6,
                paddingVertical: 12,
                borderRadius: 25,
                backgroundColor: activeTab === tab ? Colors.primary : '#e0e0e0',
                elevation: activeTab === tab ? 2 : 0,
              }}
              onPress={() => setActiveTab(tab)}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 16,
                  color: activeTab === tab ? '#FFF' : '#757575',
                  fontWeight: activeTab === tab ? '600' : '500',
                  fontFamily: fonts.regular,
                }}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{paddingTop: 16, paddingBottom: 24}}>
        <FlatList
          data={currentData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />
      </ScrollView>
    </>
  );
};

export default HowItWorks;
