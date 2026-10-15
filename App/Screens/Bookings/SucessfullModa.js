import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Colors} from '../Config/Config';

const BookingSuccessModal = ({isVisible, onClose, isPackage}) => {
  if (!isVisible) return null;
  const navigation = useNavigation();

  const goToTarget = () => {
    navigation.reset({
      index: 1,
      routes: [
        {name: 'BottomNavigation'},
        {name: isPackage ? 'UserPackages' : 'Booking'},
      ],
    });
    onClose();
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={isVisible}
      onRequestClose={goToTarget}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>X</Text>
          </TouchableOpacity> */}
          <Text style={styles.header}>
            {isPackage ? 'Package Booked' : 'Booking Successful!'}
          </Text>
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
            <TouchableOpacity
              style={[styles.closeButton, styles.primaryButton]}
              onPress={goToTarget}>
              <Text style={styles.primaryButtonText}>
                {isPackage ? 'View Packages' : 'View Bookings'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default BookingSuccessModal;
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
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
