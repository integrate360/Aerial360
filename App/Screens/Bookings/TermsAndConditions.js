// import {useNavigation} from '@react-navigation/native';
// import React, {useState} from 'react';
// import {Modal, ScrollView, StyleSheet, Text, View} from 'react-native';
// import {Button, Checkbox} from 'react-native-paper';

// const TermsAndConditions = ({modal, setModal, funcitonCall}) => {
//   const [isTnc, setIsTnc] = useState(false);
//   const navigation = useNavigation();
//   return (
//     <Modal
//       visible={modal}
//       transparent={true}
//       animationType="fade"
//       onRequestClose={() => setTNCModal(false)}>
//       <View style={styles.modalBackdrop}>
//         <View style={styles.modalContent}>
//           <Text variant="titleLarge" style={styles.title}>
//             Terms & Conditions
//           </Text>

//           <ScrollView style={styles.termsContainer}>
//             <Text variant="bodyMedium" style={{color: 'black'}}>
//               Please read and accept our terms and conditions before proceeding
//               with the payment. By accepting these terms, you agree to our
//               service agreement and privacy policy.
//             </Text>
//           </ScrollView>

//           <Text
//             variant="bodyMedium"
//             style={styles.link}
//             onPress={() => {
//               navigation?.navigate('TERMSCompnent');
//               setModal();
//             }}>
//             Read full Terms & Conditions
//           </Text>

//           <View style={styles.checkboxContainer}>
//             <Checkbox
//               status={isTnc ? 'checked' : 'unchecked'}
//               onPress={() => setIsTnc(!isTnc)}
//             />
//             <Text variant="bodyMedium" style={styles.checkboxLabel}>
//               I accept the terms and conditions
//             </Text>
//           </View>
//           <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
//             <Button mode="outlined" onPress={setModal} style={styles.payButton}>
//               Close
//             </Button>
//             <Button
//               mode="contained"
//               disabled={!isTnc}
//               onPress={() => {
//                 setModal();
//                 funcitonCall();
//               }}
//               style={styles.payButton}>
//               Pay Now
//             </Button>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// export default TermsAndConditions;

// const styles = StyleSheet.create({
//   modalBackdrop: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)', // Blackish semi-transparent background
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     borderRadius: 10,
//     padding: 20,
//     width: '90%',
//     maxHeight: '80%',
//   },
//   title: {
//     marginBottom: 15,
//     color: 'black',
//   },
//   termsContainer: {
//     maxHeight: 200,
//     marginBottom: 15,
//   },
//   link: {
//     color: '#6200ee',
//     marginBottom: 15,
//     textDecorationLine: 'underline',
//   },
//   checkboxContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   checkboxLabel: {
//     marginLeft: 8,
//     color: 'black',
//   },
//   payButton: {
//     marginTop: 10,
//   },
//   closeButton: {
//     marginBottom: 10,
//     width: '50%',
//     alignSelf: 'right',
//     marginLeft: 'auto',
//   },
// });

// import {useNavigation} from '@react-navigation/native';
// import React, {useState} from 'react';
// import {Modal, ScrollView, StyleSheet, Text, View} from 'react-native';
// import {Button, Checkbox} from 'react-native-paper';

// const TermsAndConditions = ({modal, setModal, funcitonCall}) => {
//   const [isTnc, setIsTnc] = useState(false);
//   const navigation = useNavigation();
  
//   const handlePayNow = () => {
//     setModal(false); // Close the modal first
    
//     // Use a small timeout to ensure the modal is closed before opening Razorpay
//     setTimeout(() => {
//       funcitonCall(); // Then open Razorpay
//     }, 300); // 300ms delay to ensure modal is fully closed
//   };

//   return (
//     <Modal
//       visible={modal}
//       transparent={true}
//       animationType="fade"
//       onRequestClose={() => setModal(false)}>
//       <View style={styles.modalBackdrop}>
//         <View style={styles.modalContent}>
//           <Text variant="titleLarge" style={styles.title}>
//             Terms & Conditions
//           </Text>

//           <ScrollView style={styles.termsContainer}>
//             <Text variant="bodyMedium" style={{color: 'black'}}>
//               Please read and accept our terms and conditions before proceeding
//               with the payment. By accepting these terms, you agree to our
//               service agreement and privacy policy.
//             </Text>
//           </ScrollView>

//           <Text
//             variant="bodyMedium"
//             style={styles.link}
//             onPress={() => {
//               navigation?.navigate('TERMSCompnent');
//               setModal(false);
//             }}>
//             Read full Terms & Conditions
//           </Text>

//           <View style={styles.checkboxContainer}>
//             <Checkbox
//               status={isTnc ? 'checked' : 'unchecked'}
//               onPress={() => setIsTnc(!isTnc)}
//             />
//             <Text variant="bodyMedium" style={styles.checkboxLabel}>
//               I accept the terms and conditions
//             </Text>
//           </View>
//           <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
//             <Button mode="outlined" onPress={() => setModal(false)} style={styles.payButton}>
//               Close
//             </Button>
//             <Button
//               mode="contained"
//               disabled={!isTnc}
//               onPress={handlePayNow}
//               style={styles.payButton}>
//               Pay Now
//             </Button>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// export default TermsAndConditions;

// const styles = StyleSheet.create({
//   modalBackdrop: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     borderRadius: 10,
//     padding: 20,
//     width: '90%',
//     maxHeight: '80%',
//   },
//   title: {
//     marginBottom: 15,
//     color: 'black',
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   termsContainer: {
//     maxHeight: 200,
//     marginBottom: 15,
//   },
//   link: {
//     color: '#6200ee',
//     marginBottom: 15,
//     textDecorationLine: 'underline',
//   },
//   checkboxContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   checkboxLabel: {
//     marginLeft: 8,
//     color: 'black',
//   },
//   payButton: {
//     marginTop: 10,
//   },
// });
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {Modal, ScrollView, StyleSheet, View, TouchableOpacity} from 'react-native';
import {Button, Text} from 'react-native-paper';

const TermsAndConditions = ({modal, setModal, funcitonCall}) => {
  const [isTnc, setIsTnc] = useState(false);
  const navigation = useNavigation();
  
  const handlePayNow = () => {
    setTimeout(() => {
      funcitonCall();
    }, 1000);
    setModal(false);
  };

  return (
    <Modal
      visible={modal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setModal(false)}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <Text variant="titleLarge" style={styles.title}>
            Terms & Conditions
          </Text>

          <ScrollView style={styles.termsContainer}>
            <Text variant="bodyMedium" style={{color: 'black'}}>
              Please read and accept our terms and conditions before proceeding
              with the payment. By accepting these terms, you agree to our
              service agreement and privacy policy.
            </Text>
          </ScrollView>

          <Text
            variant="bodyMedium"
            style={styles.link}
            onPress={() => {
              navigation?.navigate('TERMSCompnent');
              setModal(false);
            }}>
            Read full Terms & Conditions
          </Text>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity 
              onPress={() => setIsTnc(!isTnc)}
              style={[styles.customCheckbox, isTnc && styles.checkedBox]}
            >
              {isTnc && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <Text variant="bodyMedium" style={styles.checkboxLabel}>
              I accept the terms and conditions
            </Text>
          </View>
          
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Button mode="outlined" onPress={() => setModal(false)} style={styles.payButton}>
              Close
            </Button>
            <Button
              mode="contained"
              disabled={!isTnc}
              onPress={handlePayNow}
              style={styles.payButton}>
              Pay Now
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TermsAndConditions;

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  title: {
    marginBottom: 15,
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
  termsContainer: {
    maxHeight: 200,
    marginBottom: 15,
  },
  link: {
    color: '#6200ee',
    marginBottom: 15,
    textDecorationLine: 'underline',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  customCheckbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#6200ee',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  checkedBox: {
    backgroundColor: '#6200ee',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    marginLeft: 2,
    color: 'black',
    flex: 1,
  },
  payButton: {
    marginTop: 10,
  },
});