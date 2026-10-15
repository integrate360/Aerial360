import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Button,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
  TouchableOpacity,
} from 'react-native';
import {TextInput} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {Colors} from '../Config/Config';
import {PaymentGetwayOpne} from '../PaymentGetaway/PaymentCom';
// Modal Input Component
const ModalViews = ({
  label,
  keyboardType,
  icon,
  value,
  onChangeText,
  error,
}) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        mode="outlined"
        label={label}
        keyboardType={keyboardType}
        left={<TextInput.Icon icon={icon} />}
        value={value}
        onChangeText={onChangeText}
        error={!!error}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// Main Modal Component
const ModalView = ({isModalViewVisible}) => {
  const [modalVisible, setModalVisible] = useState(isModalViewVisible);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    emergencyContact: '',
    medical: '',
  });

  const [errors, setErrors] = useState({});
  const navigation = useNavigation();

  // Handle text input change
  const handleChange = (field, value) => {
    setFormData({...formData, [field]: value});
    setErrors({...errors, [field]: ''}); // Clear error on change
  };

  // Form validation
  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim())
      newErrors.fullName = 'Full Name is required.';
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = 'Enter a valid email address.';
    if (!formData.phoneNumber.trim() || !/^\d{10}$/.test(formData.phoneNumber))
      newErrors.phoneNumber = 'Enter a valid 10-digit phone number.';
    if (
      !formData.emergencyContact.trim() ||
      !/^\d{10}$/.test(formData.emergencyContact)
    )
      newErrors.emergencyContact =
        'Enter a valid 10-digit emergency contact number.';
    if (!formData.medical.trim())
      newErrors.medical = 'Add Medical Condition or injury/pre existing.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validate()) {
      setModalVisible(false);
      PaymentGetwayOpne();
    }
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={isModalViewVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              {/* Form Inputs */}
              <ModalViews
                label="Full Name"
                icon="account"
                value={formData.fullName}
                onChangeText={text => handleChange('fullName', text)}
                error={errors.fullName}
              />
              <ModalViews
                label="Email"
                keyboardType="email-address"
                icon="email"
                value={formData.email}
                onChangeText={text => handleChange('email', text)}
                error={errors.email}
              />
              <ModalViews
                label="Phone Number"
                keyboardType="phone-pad"
                icon="phone"
                value={formData.phoneNumber}
                onChangeText={text => handleChange('phoneNumber', text)}
                error={errors.phoneNumber}
              />
              <ModalViews
                label="Emergency Contact Number"
                keyboardType="phone-pad"
                icon="phone-alert"
                value={formData.emergencyContact}
                onChangeText={text => handleChange('emergencyContact', text)}
                error={errors.emergencyContact}
              />
              <ModalViews
                label="Add Medical Condition or injury/pre existing"
                icon="medical-bag"
                value={formData.medical}
                onChangeText={text => handleChange('medical', text)}
                error={errors.medical}
              />

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.closeButton]}
                  onPress={() => navigation.goBack()}>
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.continueButton]}
                  onPress={handleSubmit}>
                  <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 15,
    width: '100%',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: 'red', // Grey color for Close button
  },
  continueButton: {
    backgroundColor: Colors.primary, // Primary color for Continue button
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ModalView;
