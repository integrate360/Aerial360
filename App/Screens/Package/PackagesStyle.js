import {StyleSheet} from 'react-native';
import {Colors} from '../Config/Config';

export const packageStyles = StyleSheet.create({
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
    // flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Blackish semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedLocation: {
    color: 'black',
    fontSize: 15,
    marginTop: 10,
  },
  selectedDate: {
    color: 'black',
    marginTop: 10,
    fontSize: 15,
    fontWeight: 'bold',
  },
  selectedTime: {
    color: 'black',
    fontSize: 15,
  },
  selectedTitle: {
    color: 'black',
    fontSize: 20,
  },
});
