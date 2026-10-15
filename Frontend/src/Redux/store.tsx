// store.ts
import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./appSlice";

const store = configureStore({
  reducer: {
    app: appReducer,
  },
});

// Define RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
