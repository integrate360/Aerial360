import React from 'react';
import {View, Text, StyleSheet, TextInput, Dimensions} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const {width} = Dimensions.get('window');

const CustomTextInput = ({
  label,
  value,
  onChangeText,
  placeholder = '',
  keyboardType = 'default',
  error,
  editable = true,
  style,
  icon,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[styles.inputContainer, error && styles.inputErrorContainer]}>
        {icon && <FontAwesome5 name={icon} size={20} color="black" />}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          editable={editable}
          style={[styles.input, error && styles.inputError]}
          placeholderTextColor="#777"
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    width: width * 0.9, // Makes the input container 90% of screen width
    alignSelf: 'center', // Centers the input on the screen
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#000',
    marginLeft: 8,
  },
  inputError: {
    borderColor: 'red',
  },
  inputErrorContainer: {
    borderColor: 'red',
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginTop: 5,
  },
});

export default CustomTextInput;
