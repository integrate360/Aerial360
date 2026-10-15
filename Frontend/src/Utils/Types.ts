export type Category = {
  _id?: string;
  image: string;
  title: string;
  description: string;
  createdAt?: string;
};
export type Staff = {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  emergencyPhone: string;
};
export type Location = {
  _id?: string;
  name: string;
  address: string;
  googleMapLink: string;
  createdAt?: string;
};
export type users = {
  _id?: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  image: string;
  createdAt?: string;
};
export type Package = {
  days: number;
  duration: number;
  amount: number;
};

export type PackageClass = {
  _id?: string;
  name: string;
  services: Class[] | string[];
  description: string;
  duration: number;
  price: number;
  offerPrice: number;
  days: number;
  createdAt?: string;
};
export type Availability = {
  day: number;
  time: string;
  duration: number;
  trainers: string[] | Staff[];
  maxPeople: number;
  locations: Location[];
};
export interface Class {
  price?: number;
  _id?: string;
  name: string;
  category: Category | string;
  description: string;
  availability: Availability[];
  image?: string[];
  images?: string[] | File[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id?: string;
  id?: string;
  trainer: Staff | string;
  class: Class | string;
  time: string;
  user: users | string;
  duration: number;
  dates?: Date[];
  date?: Date;
  location: string;
  amount: number;
  createdAt?: string;
  updatedAt?: string;
}

export type slotDataType = {
  classId: string;
  classDuration: number;
  date: string;
  time: string;
  location: Location;
  sectionId: string;
  trainer: Staff;
  className: string;
};
