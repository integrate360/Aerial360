import {useEffect, useRef, useCallback} from 'react';
import {BackHandler, ToastAndroid} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

const useDoubleBackExit = () => {
  const backHandler = useRef(null);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (!backHandler.current) {
          backHandler.current = true;
          setTimeout(() => {
            backHandler.current = false;
          }, 2000); // Adjust timeout as needed (e.g., 2000 milliseconds = 2 seconds)
          ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
          return true;
        } else {
          BackHandler.exitApp();
          return true;
        }
      };

      const backHandlerListener = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => backHandlerListener.remove();
    }, []),
  );
};

export default useDoubleBackExit;
