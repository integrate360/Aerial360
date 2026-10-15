import { BaseUrl } from './BaseUrl';
import axios from 'axios';

// Cache variables
let cachedCategories = null;
let cachedClasses = null;
let cachedPackages = null;
let cachedLocations = null;
let cachedAds = null;
let cachedAllTrainers = null;



export const Register = async (
  fullname,
  email,
  phonenumber,
  password,
  emergencyPhone,
  medicalcondition,
  token,
) => {
  try {
    const requestData = {
      name: fullname,
      email: email,
      phone: phonenumber,
      password: password,
      emergencyPhone: emergencyPhone,
      medicalcondition: medicalcondition,
      medicalCondition: medicalcondition,
      deviceToken: token,
    };

    const res = await axios.post(`${BaseUrl}user/register/`, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return res.data; // ✔ Success response

  } catch (err) {
    // 🔥 If backend sent 400/500, return backend JSON
    if (err.response && err.response.data) {
      return err.response.data; // ✔ return backend validation errors
    }

    // 🔥 Only for true network failures
    return { message: 'Network error. Please try again.' };
  }
};


export const login = async (Email, Password) => {
  try {
    const { data } = await axios.post(`${BaseUrl}user/login/`, {
      email: Email,
      password: Password,
    });
    return data;
  } catch (err) {
    console.log(err.response?.data?.message || 'Something went wrong');
    return err.response?.data?.message;
  }
};

export const emailOtp = async email => {
  try {
    const res = await axios.post(`${BaseUrl}user/forgot/otp`, {
      email,
    });
    if (res?.status !== 200)
      return { status: res?.status, message: res?.data?.message };
    return { status: res?.status, message: res?.data?.message };
  } catch (err) {
    console.log(err.response?.data?.message || 'Something went wrong');
    return { status: 400, message: err.response?.data?.message };
  }
};

export const forgot = async ({ email, password, otp }) => {
  try {
    const res = await axios.post(`${BaseUrl}user/forgot/password`, {
      email,
      password,
      otp,
    });
    if (res?.status !== 200)
      return { status: res?.status, message: res?.data?.message };
    return { status: res?.status, message: res?.data?.message };
  } catch (err) {
    console.log(err.response?.data?.message || 'Something went wrong');
    return { status: 400, message: err.response?.data?.message };
  }
};

export const getAllCategerys = async (forceRefresh = false) => {
  if (!forceRefresh && cachedCategories) {
    return { data: cachedCategories, status: 200 };
  }
  try {
    const res = await axios.get(`${BaseUrl}category/`);
    if (res?.status !== 200)
      return { status: res?.status, message: res?.body?.message, data: [] };
    cachedCategories = res?.data?.data;
    return { data: res?.data?.data, status: res?.status };
  } catch (error) {
    console.log(error);
    return { data: [], status: 300, message: error?.message };
  }
};

export const getAllClasses = async (forceRefresh = false) => {
  if (!forceRefresh && cachedClasses) {
    return cachedClasses;
  }
  try {
    const { data } = await axios.get(`${BaseUrl}classes`);
    console.log('====================================');
    console.log("Limit Reached Data:  ", data, "ENDD....");
    console.log('====================================');
    cachedClasses = data;
    return data;
  } catch (error) {
    console.log(error);
  }
};
export const getPackgeById = async id => {
  try {
    const res = await axios.get(`${BaseUrl}package/${id}`);
    if (res?.status !== 200) return { status: 300, message: res?.data?.message };
    return { status: res?.status, data: res?.data };
  } catch (error) {
    console.log(error);
    return { status: 300, message: error?.message };
  }
};
export const getUserPackgeById = async (id, token) => {
  try {
    const res = await axios.get(`${BaseUrl}user-package/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res?.status !== 200) return { status: 300, message: res?.data?.message };
    return { status: res?.status, data: res?.data };
  } catch (error) {
    console.log(error);
    return { status: 300, message: error?.message };
  }
};
export const getAllPackges = async (forceRefresh = false) => {
  if (!forceRefresh && cachedPackages) {
    return cachedPackages;
  }
  try {
    const { data } = await axios.get(`${BaseUrl}package/`);
    cachedPackages = data;
    return data;
  } catch (error) {
    console.log(error);
  }
};
export const getCategoryPackges = async id => {
  try {
    const res = await axios.get(`${BaseUrl}package/category/${id}`);
    cachedPackages = res?.data?.packages;
    return res?.data?.packages;
  } catch (error) {
    console.log(error);
  }
};
export const getAllLocations = async (forceRefresh = false) => {
  if (!forceRefresh && cachedLocations) {
    return cachedLocations;
  }
  try {
    const { data } = await axios.get(`${BaseUrl}allocations`);
    cachedLocations = data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const PaymentRequest = async (
  id,
  packageId,
  userId,
  isPackage,
  bookings,
  amount,
) => {
  try {
    const res = await axios.post(`${BaseUrl}payment/`, {
      class: id,
      user: userId,
      amount: amount || 500,
      isPackage,
      bookings,
    });
    if (res?.status != 201)
      return { status: res?.status, data: {}, message: res?.data?.message };
    return { status: res?.status, data: res?.data };
  } catch (err) {
    return { status: 300, data: {}, message: 'Something went wrong' };
  }
};
export const PackagePayment = async (
  packageId,
  prices,
  userId,
  isPackage,
  storedata,
) => {
  try {
    const res = await axios.post(`${BaseUrl}payment/package`, {
      package: packageId,
      user: userId,
      amount: prices,
      isPackage,
      bookings: storedata,
    });
    if (res?.status != 201)
      return { status: res?.status, data: {}, message: res?.data?.message };
    return { status: res?.status, data: res?.data };
  } catch (err) {
    console.log({ err });
    return { status: 300, data: {}, message: 'Something went wrong' };
  }
};

export const MultipleBookings = async ({ bookings, uPackageId, token }) => {
  try {
    const res = await axios.post(
      `${BaseUrl}booking/multiple`,
      {
        bookings,
        uPackageId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (res?.status !== 201)
      return { status: res?.status, message: res?.data?.message };
    return {
      data: res?.data?.data,
      status: res?.status,
      message: res?.data?.message,
    };
  } catch (error) {
    console.log(error);
    return { data: {}, message: 'Something Went Wrong!', status: 3000 };
  }
};

export const showAvailability = async (date, classId) => {
  try {
    const { data } = await axios.post(`${BaseUrl}booking/availability/`, {
      date,
      classId,
    });

    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getAllAds = async (forceRefresh = false) => {
  if (!forceRefresh && cachedAds) {
    return cachedAds;
  }
  try {
    const { data } = await axios.get(`${BaseUrl}ads`);
    cachedAds = data.data;
    return data.data;
  } catch (error) {
    console.log(error);
  }
};

export const getAllTrainers = async (forceRefresh = false) => {
  if (!forceRefresh && cachedAllTrainers) {
    return cachedAllTrainers;
  }
  try {
    const { data } = await axios.get(`${BaseUrl}staff/`);
    cachedAllTrainers = data.data;
    return data.data;
  } catch (error) {
    console.log(error);
  }
};

export const Enquire = async D => {
  try {
    const { data } = await axios.post(`${BaseUrl}enquiry/`, D);
    return data;
  } catch (err) {
    console.log(err.response?.data?.message || 'Something went wrong');
  }
};
export const Bachelorette = async D => {
  try {
    const { data } = await axios.post(`${BaseUrl}bachelorette/`, D);
    return data;
  } catch (err) {
    console.log(err.response?.data?.message || 'Something went wrong');
  }
};
export const GetUsers = async (userId, token) => {
  try {
    const { data } = await axios.get(`${BaseUrl}user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("User data", data);
    return data;
  } catch (err) {
    console.log(err.response?.data?.message || 'Something went wrong');
  }
};



export const UpDateAllUser = async (
  userId,
  token,
  fullName,
  email,
  phone,
  emergencyContact,
  medicalCondition,
  image,
) => {
  try {
    const formData = new FormData();
    formData.append('name', fullName);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('emergencyPhone', emergencyContact);
    formData.append('medicalCondition', medicalCondition);
    if (image) formData.append('image', image);
    const { data } = await axios.put(`${BaseUrl}user/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (err) {
    console.log(err.response?.data?.message || err.message || 'Something went wrong');
    const backendData = err.response?.data;
    if (backendData) {
      return typeof backendData === 'object'
        ? { ...backendData, isError: true }
        : { message: backendData, isError: true };
    }
    return { message: 'Network error. Please try again.', isError: true };
  }
};

// Utility to refresh all cached data
export const refreshAllData = async () => {
  try {
    const categories = await getAllCategerys(true);
    const classes = await getAllClasses(true);
    const packages = await getAllPackges(true);
    const locations = await getAllLocations(true);
    const ads = await getAllAds(true);
    const trainers = await getAllTrainers(true);

    return {
      categories,
      classes,
      packages,
      locations,
      ads,
      trainers,
    };
  } catch (error) {
    console.error('Error refreshing all data:', error?.message);
    return null;
  }
};
export const rescheduleBooking = async (
  date,
  id,
  previousDate,
  token,
  data,
) => {
  try {
    const books = await axios.put(
      `${BaseUrl}booking/reschedule/${id}`,
      { ...data, newDate: date, date: previousDate },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return { data: books?.data?.data, status: books?.status };
  } catch (error) {
    console.log(error);
    return { status: 300 };
  }
};

export const DeleteUser = async (userId, token) => {
  try {
    const { data } = await axios.delete(`${BaseUrl}users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (err) {
    console.log(err.response?.data?.message || 'Something went wrong');
    throw err; // Important to throw the error so we can catch it in the component
  }
};

export const saveDeviceToken = async (token, deviceToken) => {
  try {
    const { data } = await axios.post(
      `${BaseUrl}save-device-token`,
      { deviceToken },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (err) {
    console.log(err.response?.data?.message || 'Something went wrong');
    throw err; // Re-throw the error to handle it in the calling function
  }
};

export const removeFcmToken = async (token) => {
  try {
    const { data } = await axios.patch(
      `${BaseUrl}remove-fcm-token`,
      {}, // Empty body if not needed, or add any required data
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (err) {
    console.log(err.response?.data?.message || 'Something went wrong');
    throw err;
  }
};

export const getMe = async (token) => {
  try {
    const { data } = await axios.get(`${BaseUrl}user/me/get`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (err) {
    console.log(err.response?.data?.message || err.message || 'Error fetching user data');
    return null;
  }
};