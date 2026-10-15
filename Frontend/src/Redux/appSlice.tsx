// appSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Class, Location, PackageClass, slotDataType } from "src/Utils/Types";

interface AppState {
  step: number;
  selectedLocations: string[];
  bookings: string[];
  packages: string[];
  location: Location | null;
  availablity: {
    day: string;
    time: string;
    trainers: string[];
    duration: number;
    maxPeople: number;
    locations: string[];
    people: number;
    _id: string;
  } | null;
  selectedPackage: PackageClass | null;
  people: number;
  maxPeople: number;
  wasPrev: boolean;
  slots: slotDataType[];
  isPackage: boolean;
  class: Class | null;
  date: string | null; // Assuming date as ISO string, adjust type if necessary
  time: string | null; // Assuming time as string, adjust type if necessary
}

const initialState: AppState = {
  step: 1,
  selectedLocations: [],
  bookings: [],
  packages: [],
  location: null,
  class: null,
  people: 0,
  selectedPackage: null,
  date: null,
  time: null,
  wasPrev: false,
  availablity: null,
  slots: [],
  maxPeople: 0,
  isPackage: false,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setStep(state, action: PayloadAction<number>) {
      state.step = action.payload;
    },
    setSelectedLocations(state, action: PayloadAction<string[]>) {
      state.selectedLocations = action.payload;
    },
    setBookings(state, action: PayloadAction<string[]>) {
      state.bookings = action.payload;
    },
    setPackages(state, action: PayloadAction<string[]>) {
      state.packages = action.payload;
    },
    setClass(state, action: PayloadAction<Class | null>) {
      state.class = action.payload;
    },
    setDate(state, action: PayloadAction<string | null>) {
      state.date = action.payload;
    },
    setTime(state, action: PayloadAction<string | null>) {
      state.time = action.payload;
    },
    setLocation(state, action: PayloadAction<Location | null>) {
      state.location = action.payload;
    },
    setWasPrev(state, action: PayloadAction<boolean>) {
      state.wasPrev = action.payload;
    },
    setPeople(state, action: PayloadAction<number>) {
      state.people = action.payload;
    },
    setSelectedPackage(state, action: PayloadAction<PackageClass>) {
      state.selectedPackage = action.payload;
    },
    setMaxPeople(state, action: PayloadAction<number>) {
      state.maxPeople = action.payload;
    },
    setSlots(state, action: PayloadAction<slotDataType[]>) {
      action.payload.forEach((incomingSlot) => {
        const existingIndex = state.slots.findIndex(
          (slot) => slot.sectionId === incomingSlot.sectionId
        );

        if (existingIndex >= 0) {
          state.slots[existingIndex] = incomingSlot;
          return;
        }

        state.slots.push(incomingSlot);
      });
    },
    removeSlot(state, action: PayloadAction<string>) {
      state.slots = state.slots.filter(slot => slot.sectionId !== action.payload);
    },
    setSlotsEmpty(state) {
      state.slots = [];
    },
    setIsPackage(state, action: PayloadAction<boolean>) {
      state.isPackage = action?.payload;
    },
    setAvailablity(
      state,
      action: PayloadAction<{
        day: string;
        time: string;
        trainers: string[];
        duration: number;
        maxPeople: number;
        locations: string[];
        people: number;
        _id: string;
      } | null>
    ) {
      state.availablity = action.payload;
    },
  },
});

export const {
  setStep,
  setSelectedLocations,
  setBookings,
  setPackages,
  setClass,
  setDate,
  setTime,
  setLocation,
  setWasPrev,
  setPeople,
  setAvailablity,
  setSelectedPackage,
  setSlots,
  removeSlot,
  setSlotsEmpty,
  setMaxPeople,
  setIsPackage,
} = appSlice.actions;

export default appSlice.reducer;
