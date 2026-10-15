import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {
  BodyText,
  DangerText,
  FaddedText,
  HeaderText,
  ImportantText,
  SubHeaderText,
  SuccessText,
} from '../Helpers/Font';

const OrderSummary = () => {
  // Sample order data - in real app, this would come from props or state
  const orderItems = [
    {
      id: 1,
      name: 'Wireless Headphones',
      price: 129.99,
      quantity: 1,
      color: 'Black',
    },
    {
      id: 2,
      name: 'Phone Case',
      price: 24.99,
      quantity: 2,
      color: 'Clear',
    },
    {
      id: 3,
      name: 'Screen Protector',
      price: 19.99,
      quantity: 1,
      color: 'Transparent',
    },
  ];

  // Calculate order totals
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.08; // 8% tax rate
  const shipping = 5.99;
  const total = subtotal + tax + shipping;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <HeaderText style={styles.headerText}>Header Text</HeaderText>
        <SubHeaderText>Sub Header Text</SubHeaderText>
        <DangerText>Danger Text</DangerText>
        <SuccessText>Success Text</SuccessText>
        <ImportantText>Important Text</ImportantText>
        <FaddedText>FaddedText</FaddedText>
        <BodyText>
          Experience the art of pole dancing with ease and convenience through
          our booking app. Whether you're a beginner looking to build confidence
          or an expert perfecting your skills, our app offers tailored classes
          for all levels. Browse available sessions, book your spot with just a
          few taps, and stay updated with personalized reminders. Our sleek,
          user-friendly design ensures a seamless experience, empowering you to
          focus on your fitness and creativity. Start your journey to strength,
          flexibility, and self-expression today!
        </BodyText>
        <BodyText style={styles.orderNumber}>Order #12345</BodyText>
      </View>

      {/* Items List */}
      <View style={styles.itemsContainer}>
        {orderItems.map(item => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemColor}>Color: {item.color}</Text>
              <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>
              ${(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      {/* Price Breakdown */}
      <View style={styles.priceContainer}>
        <View style={styles.priceRow}>
          <Text>Subtotal</Text>
          <Text>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text>Tax</Text>
          <Text>${tax.toFixed(2)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text>Shipping</Text>
          <Text>${shipping.toFixed(2)}</Text>
        </View>
        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Shipping Address */}
      <View style={styles.addressContainer}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>
        <Text>John Doe</Text>
        <Text>123 Main Street</Text>
        <Text>Apt 4B</Text>
        <Text>New York, NY 10001</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerText: {
    // fontSize: 24,
    // fontWeight: 'bold',
    color: 'black',
  },
  orderNumber: {
    color: '#666',
    marginTop: 4,
  },
  itemsContainer: {
    marginBottom: 24,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemColor: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '500',
  },
  priceContainer: {
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 8,
    paddingTop: 16,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addressContainer: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
});

export default OrderSummary;
