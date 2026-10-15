import {ToastAndroid} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
export const PaymentGetwayOpne = () => {
  try {
    var options = {
      description: 'Credits towards consultation',
      image: 'https://i.imgur.com/3g7nmJC.jpg',
      currency: 'INR',
      key: 'rzp_test_HdWdUGM3YBNvaQ',
      amount: 10 * 100,
      name: 'Aerial360',
      prefill: {
        email: 'Mehul@gmail.com',
        contact: '7045904102',
        name: 'Mehul',
      },
      theme: {color: '#3B1E82'},
    };

    RazorpayCheckout.open(options)
      .then(data => {
        // handle success
        console.log(`Success: ${data.razorpay_payment_id}`);
      })
      .catch(error => {
        // handle failure
        console.log(`Error: ${error.code} | ${error.description}`);
      });
    //  ToastAndroid.show('Payment successfully', ToastAndroid.SHORT);
  } catch (error) {
    console.log(error);
  }
};
