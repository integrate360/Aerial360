import {configureStore} from '@reduxjs/toolkit';
import rootReducer from '../reducer'; // Combined Reducers
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Redux Persist Config
const persistConfig = {
  key: 'root', // key for the storage
  storage: AsyncStorage, // Storage engine
};

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false, // Prevent warnings for non-serializable values
    }),
});

// Persistor for persisting the store
export const persistor = persistStore(store);

export default store;
