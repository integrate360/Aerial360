import axios from "axios";
import { bearerHeader, formDataHeader } from "./Config";
import { Booking, PackageClass } from "./Types";

// export const api = "http://localhost:5000/api/";
// export const baseApi = "http://localhost:5000/";
export const api = "https://api.airbound.in/api/";
export const baseApi = "https://api.airbound.in/";
export const imageApi = "";

export const getCategories = async () => {
  try {
    const cats = await axios.get(`${api}category`);
    if (cats.status != 200)
      return { message: cats?.data?.message, status: cats?.status };
    return { data: cats?.data?.data, status: cats?.status };
  } catch (error) {
    console.log(error);
    return { data: [] };
  }
};

// Class
export const getClasses = async () => {
  try {
    const cats = await axios.get(`${api}classes`);
    if (cats.status != 200)
      return { message: cats?.data?.message, status: cats?.status };
    return { data: cats?.data?.data, status: cats?.status };
  } catch (error) {
    console.log(error);
    return { data: [] };
  }
};
export const getPopulatedClasses = async () => {
  try {
    const cats = await axios.get(`${api}classes/populated`);
    if (cats.status != 200)
      return { message: cats?.data?.message, status: cats?.status };
    return { data: cats?.data?.data, status: cats?.status };
  } catch (error) {
    console.log(error);
    return { data: [] };
  }
};

export const signup = async (data: { email: string; password: string }) => {
  try {
    const cats = await axios.post(`${api}user/register`, data);
    return { token: cats?.data?.token, status: cats?.status };
  } catch (error) {
    console.log(error);
    return { status: 300 };
  }
};

export const createBooking = async (data: Booking) => {
  try {
    const books = await axios.post(`${api}booking`, data, bearerHeader);
    return { data: books?.data?.data, status: books?.status };
  } catch (error) {
    console.log(error);
    return {};
  }
};

export const getAllLocations = async () => {
  try {
    const response = await axios.get(`${api}allocations`, bearerHeader); // Corrected endpoint
    if (response.status !== 200) {
      return {
        message: response?.data?.message || "Error fetching locations",
        status: response?.status,
      };
    }

    // Assuming `response.data` contains the array of locations directly
    return { data: response?.data, status: response?.status };
  } catch (error) {
    console.error("Error fetching locations:", error);
    return { data: [], status: 500, message: "Failed to fetch locations" };
  }
};

export const getAvailableOfClass = async (value: {
  classId: string;
  date: string;
}) => {
  try {
    const response = await axios.post(
      `${api}booking/availability`,
      value,
      bearerHeader
    );
    if (response.status !== 200) {
      return {
        message: response?.data?.message || "Error fetching locations",
        status: response?.status,
      };
    }

    // Assuming `response.data` contains the array of locations directly
    return { data: response?.data, status: response?.status };
  } catch (error) {
    console.error("Error fetching locations:", error);
    return { data: [], status: 500, message: "Failed to fetch locations" };
  }
};

// Package
export const getPackages = async () => {
  try {
    const cats = await axios.get(`${api}package`);
    if (cats.status != 200)
      return { message: cats?.data?.message, status: cats?.status };
    return { data: cats?.data?.data, status: cats?.status };
  } catch (error) {
    console.log(error);
    return { data: [] };
  }
};
export const getPackagesByClass = async (id: string) => {
  try {
    const cats = await axios.get(`${api}package/class/${id}`);
    if (cats.status != 200)
      return { message: cats?.data?.message, status: cats?.status };
    return { data: cats?.data?.data, status: cats?.status };
  } catch (error) {
    console.log(error);
    return { data: [] };
  }
};

// Authenticaiton
export const UserLogin = async (data: { email: string; password: string }) => {
  try {
    const res = await axios.post(`${api}user/login`, data);
    if (res.status != 200)
      return { status: res.status, message: res.data?.message };
    return { status: 200, data: res.data };
  } catch (error) {
    console.log(error);
    return { status: 404 };
  }
};
export const genrateOtp = async (email: string) => {
  const res = await axios.post(`${api}user/forgot/otp`, { email });
  if (res.status != 200)
    return { status: res.status, message: res.data?.message };
  return { status: 200, data: res.data };
};
export const forgotPassword = async (
  email: string,
  otp: string,
  password: string
) => {
  try {
    const res = await axios.post(`${api}user/forgot/password`, {
      email,
      otp,
      password,
    });
    if (res.status != 200)
      return { status: res.status, message: res.data?.message };
    return { status: 200, data: res.data };
  } catch (error) {
    console.log(error);
    return { status: 404 };
  }
};
export const changePassword = async (
  email: string,
  password: string,
  newPassword: string
) => {
  try {
    const res = await axios.post(`${api}user/change`, {
      email,
      password,
      newPassword,
    });
    if (res.status != 200)
      return { status: res.status, message: res.data?.message };
    return { status: 200, data: res.data };
  } catch (error) {
    console.log(error);
    return { status: 404 };
  }
};
export const UserRegistration = async (data: {
  email: string;
  password: string;
  phone: string;
  name: string;
  emergencyPhone: string;
  medicalCondition: string;
}) => {
  try {
    const res = await axios.post(`${api}user/register`, data);
    if (res.status != 200)
      return { status: res.status, message: res.data?.message };
    return { status: 200, data: res.data };
  } catch (error) {
    console.log(error);
    return { status: 404 };
  }
};

// Payment
export const CreateOrder = async (amount: number) => {
  try {
    const res = await axios.post(
      `${api}payment/create-order`,
      { amount },
      bearerHeader
    );
    if (res.status != 200) return { status: res.status };
    return { status: 200, json: res.data };
  } catch (error) {
    console.log(error);
    return { status: 404 };
  }
};
