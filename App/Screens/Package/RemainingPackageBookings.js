import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import {Colors} from '../Config/Config';
import fonts from '../FontFamily/FontFamily';
import moment from 'moment';

const {width} = Dimensions.get('window');

const RemainingPackageBookings = ({
  item,
  setModal,
  setSelectedBooking,
  packageName,
}) => {
  const convertTo12HourFormat = time24 => {
    if (!time24 || typeof time24 !== 'string') {
      return 'Invalid time';
    }
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const adjustedHours = hours % 12 || 12;
    const formattedMinutes = minutes?.toString()?.padStart(2, '0');
    return `${adjustedHours}:${formattedMinutes} ${period}`;
  };

  const isCurrentSame =
    moment(item?.dates?.[0]).format('DD-MM-YYYY') !==
    moment(Date.now()).format('DD-MM-YYYY');

  const isThreeHoursBefore =
    moment(item?.dates?.[0]).diff(moment(Date.now()), 'hours') > 3;

  const isEditable = isCurrentSame && isThreeHoursBefore;

  return (
    <View style={styles.card}>
      {/* Show class image (first one only) */}
      {item?.class?.[0]?.image?.[0] && (
        <Image
          source={{uri: item?.class?.[0]?.image?.[0]}}
          style={styles.image}
        />
      )}

      <View style={styles.content}>
        <Text style={styles.cardTitle}>{item?.class?.[0]?.name}</Text>
        {packageName && <Text style={styles.cardSubtitle}>{packageName}</Text>}

        {item?.dates?.[0] && (
          <Text style={styles.cardDate}>
            {moment(item?.dates?.[0]).format('DD MMM YYYY')}
          </Text>
        )}

        <Text style={styles.cardTime}>
          Time: {convertTo12HourFormat(item?.time?.[0])}
        </Text>

        <View style={styles.rowBetween}>
          <Text style={styles.cardLocation}>{item?.location?.name}</Text>
          {/* {isEditable && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setModal();
                setSelectedBooking(item);
              }}>
              <Text style={styles.buttonText}>Reschedule</Text>
            </TouchableOpacity>
          )} */}
        </View>
      </View>
    </View>
  );
};

export default RemainingPackageBookings;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  image: {
    width: 140,
    height: 150,
    borderRadius: 10,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    marginRight: 6,
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    padding: 12,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 14,
    color: 'black',
    marginBottom: 2,
  },
  cardTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  cardLocation: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#007bff',
    textDecorationLine: 'underline',
    fontSize: 16,
    textAlign: 'right',
    fontWeight: 'bold',
  },
});
