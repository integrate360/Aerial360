import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Colors} from '../Config/Config';

const BookingSuccessModalWithoutInput = ({isVisible, onClose}) => {
  const [count, setCount] = useState(5);
  const navigation = useNavigation();
  const goToPackages = () => {
    navigation.reset({
      index: 1,
      routes: [{name: 'BottomNavigation'}, {name: 'UserPackages'}],
    });
    onClose();
  };

  useEffect(() => {
    // Reset count when modal becomes visible
    if (isVisible) {
      setCount(5);
    }

    // Only start countdown if modal is visible
    let intervalId;
    if (isVisible) {
      intervalId = setInterval(() => {
        setCount(prevCount => {
          if (prevCount <= 1) {
            clearInterval(intervalId);
            goToPackages();
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
    }

    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={isVisible}
      onRequestClose={goToPackages}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.header}>Slots Booked</Text>
          <Text style={styles.message}>
            Your booking has been confirmed. Thank you for choosing us!
          </Text>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%',
            }}>
            <View></View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                goToPackages();
              }}>
              <Text style={styles.closeButtonText}>
                {`Redirecting in ${count}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default BookingSuccessModalWithoutInput;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: 300,
    position: 'relative',
  },
  header: {
    fontSize: 24,
    color: '#2d9cdb',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 5,
    backgroundColor: '#2d9cdb',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  closeBtnText: {
    color: 'white',
    fontSize: 20,
  },
  closeButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: 'black',
  },
  closeButtonText: {
    color: 'black',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
