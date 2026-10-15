import axios from "axios";
import { bearerHeader, formDataHeader } from "./Config.js";


export const api = "http://localhost:6000/api/";
export const baseApi = "http://localhost:6000/";
export const getBearerHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  };
};

export const getFormDataHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  };
};
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

export const showAvailability = async (date, classId) => {
  try {
    const { data } = await axios.post(`${api}booking/availability/`, {
      date,
      classId,
    });

    return data;
  } catch (error) {
    console.log(error);
  }
};

export const userpackage = async (params = {}) => {
  try {
    const token = localStorage.getItem("token");
    const payments = await axios.get(`${api}user-package`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      params,
    });
    if (payments.status !== 200) {
      return { message: payments?.data?.message, status: payments?.status };
    }
    return {
      data: payments?.data?.data,
      pagination: payments?.data?.pagination,
      status: payments?.status,
    };
  } catch (error) {
    console.log(error);
    return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  }
};

export const extendPackageExpiry = async (packageId, extensionDays, reason) => {
  const token = localStorage.getItem("token");

  const response = await axios.patch(
    `${api}user-package/${packageId}/extend-expiry`,
    {
      extensionDays,
      reason,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
};

export const userpackageById = async (id) => {
  try {
    const response = await axios.get(`${api}user-package/${id}`, bearerHeader);
    const data = response?.data?.data;

    return {
      id: data?._id,
      data: data,
      status: response?.status,
    };
  } catch (error) {
    console.error("Error fetching user package by ID:", error);
    return {
      id: null,
      status: 300,
    };
  }
};

export const deleteuserpackage = async (id) => {
  try {
    const UserPackagedata = await axios.delete(
      `${api}/deleteUserPackageById/user/${id}`,
      bearerHeader,
    );
    return {
      data: UserPackagedata?.data?.data,
      status: UserPackagedata?.status,
    };
  } catch (error) {
    console.log(error);
    return { status: 300 };
  }
};

export const createCategories = async (data) => {
  try {
    const cats = await axios.post(`${api}category`, data, formDataHeader);
    return { data: cats?.data?.data, status: cats?.status };
  } catch (error) {
    console.log(error);
    return {};
  }
};

export const EditCategory = async (data, id) => {
  console.log(data, "sdkjd", id);
  try {
    const cats = await axios.put(`${api}category/${id}`, data, formDataHeader);
    return { data: cats?.data?.data, status: cats?.status };
  } catch (error) {
    console.log(error);
    return {};
  }
};

export const deleteCategory = async (id) => {
  try {
    const cats = await axios.delete(`${api}category/${id}`, bearerHeader);
    return { data: cats?.data?.data, status: cats?.status };
  } catch (error) {
    console.log(error);
    return { status: 300 };
  }
};

// Staff
export const getStaff = async () => {
  try {
    const cats = await axios.get(`${api}staff`);
    if (cats.status != 200)
      return { message: cats?.data?.message, status: cats?.status };
    return { data: cats?.data?.data, status: cats?.status };
  } catch (error) {
    console.log(error);
    return { data: [] };
  }
};

export const createStaff = async (data) => {
  try {
    const cats = await axios.post(`${api}staff`, data, formDataHeader);
    return { data: cats?.data?.data, status: cats?.status };
  } catch (error) {
    console.log(error);
    return {};
  }
};

export const EditStaff = async (data, id) => {
  try {
    const cats = await axios.put(`${api}staff/${id}`, data, formDataHeader);
    return { data: cats?.data?.data, status: cats?.status };
  } catch (error) {
    console.log(error);
    return {};
  }
};

export const deleteStaff = async (id) => {
  try {
    const cats = await axios.delete(`${api}staff/${id}`, bearerHeader);
    return { data: cats?.data?.data, status: cats?.status };
  } catch (error) {
    console.log(error);
    return { status: 300 };
  }
};

// Class
export const getClasses = async () => {
  try {
    const cats = await axios.get(`${api}getAdminClasses`);
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

export const createClass = async (data) => {
  try {
    const cats = await axios.post(`${api}class`, data, formDataHeader);
    return { data: cats?.data?.data, status: cats?.status };
  } catch (error) {
    console.log(error);
    return {};
  }
};

export const deleteClass = async (id) => {
  try {
    const cats = await axios.delete(`${api}class/${id}`, bearerHeader);
    return { data: cats?.data?.data, status: cats?.status };
  } catch (error) {
    console.log(error);
    return { status: 300 };
  }
};

export const updateClass = async (data, id) => {
  try {
    const cats = await axios.put(`${api}class/${id}`, data, formDataHeader);
    return { data: cats?.data?.data, status: cats?.status };
  } catch (error) {
    console.log(error);
    return { status: 300 };
  }
};

export const getClassById = async (id) => {
  try {
    const response = await axios.get(`${api}class/${id}`, bearerHeader);
    console.log(response);
    return { data: response?.data?.data, status: response?.status };
  } catch (error) {
    console.error(error);
    return { status: 300 };
  }
};

// Admin
export const AdminLogin = async (data) => {
  try {
    const cats = await axios.post(`${api}admin/login`, data, bearerHeader);
    return { token: cats?.data?.token, status: cats?.status };
  } catch (error) {
    console.log(error);
    return { status: 300 };
  }
};

// Ads
export const getAds = async () => {
  try {
    const cats = await axios.get(`${api}ads`);
    if (cats.status != 200)
      return { message: cats?.data?.message, status: cats?.status };
    return { data: cats?.data?.data, status: cats?.status };
  } catch (error) {
    console.log(error);
    return { data: [] };
  }
};

export const createAds = async (data) => {
  try {
    const cats = await axios.post(`${api}ads`, data, formDataHeader);
    return { data: cats?.data?.data, status: cats?.status };
  } catch (error) {
    console.log(error);
    return {};
  }
};

export const deleteAds = async (id) => {
  try {
    const cats = await axios.delete(`${api}ads/${id}`, bearerHeader);
    return { data: cats?.data?.data, status: cats?.status };
  } catch (error) {
    console.log(error);
    return { status: 300 };
  }
};

export const updateAds = async (data, id) => {
  try {
    const cats = await axios.put(`${api}ads/${id}`, data, formDataHeader);
    return { data: cats?.data?.data, status: cats?.status };
  } catch (error) {
    console.log(error);
    return { status: 300 };
  }
};

export const getAdsById = async (id) => {
  try {
    const cats = await axios.get(`${api}ads/${id}`, bearerHeader);
    if (cats.status != 200)
      return { message: cats?.data?.message, status: cats?.status };
    return { data: cats?.data?.data, status: cats?.status };
  } catch (error) {
    console.log(error);
    return { data: [] };
  }
};

// Users routes are here and the functions are below this line
export const getAllUsers = async () => {
  try {
    const cats = await axios.get(`${api}users`);
    if (cats.status != 200)
      return { message: cats?.data?.message, status: cats?.status };
    return { data: cats?.data, status: cats?.status };
  } catch (error) {
    console.log(error);
    return { data: [] };
  }
};

export const getAllUsersForAdmin = async (page = 1, search = "") => {
  try {
    const cats = await axios.get(`${api}getAllUsersforadmin`, {
      params: {
        page,
        limit: 10,
        search,
      },
    });
    if (cats.status != 200)
      return { message: cats?.data?.message, status: cats?.status };
    return { data: cats?.data, status: cats?.status };
  } catch (error) {
    console.log(error);
    return { data: [] };
  }
};

export const deleteUser = async (id) => {
  try {
    const cats = await axios.delete(`${api}users/${id}`, bearerHeader);
    return { data: cats?.data?.data, status: cats?.status };
  } catch (error) {
    console.log(error);
    return { status: 300 };
  }
};
export const updateUser = async (id, payload) => {
  try {
    const response = await axios.put(
      `${api}updateUseradmin/${id}`,
      payload,
      bearerHeader,
    );

    return { data: response?.data?.data, status: response?.status };
  } catch (error) {
    console.error(error);
    return { status: 300, error };
  }
};

export const getUserById = async (id) => {
  try {
    const cats = await axios.get(`${api}users/${id}`, bearerHeader);
    if (cats.status != 200)
      return { message: cats?.data?.message, status: cats?.status };
    return { data: cats?.data?.data, status: cats?.status };
  } catch (error) {
    console.log(error);
    return { data: [] };
  }
};

export const signup = async (data) => {
  try {
    const cats = await axios.post(`${api}user/register`, data);
    return { token: cats?.data?.token, status: cats?.status, cats };
  } catch (error) {
    console.log(error);
    if (axios.isAxiosError(error) && error.response) {
      return {
        status: error.response.status,
        message: error.response.data?.message || "Registration failed",
      };
    }
    return { status: 300, message: "An unexpected error occurred" };
  }
};

// Bookings
export const createBooking = async (data) => {
  try {
    const books = await axios.post(`${api}booking`, data, getBearerHeader());
    return { data: books?.data?.data, status: books?.status };
  } catch (error) {
    console.log(error);
    return {};
  }
};

export const updateBookingPartialAmount = async (bookingId, paymentAmount) => {
  try {
    const response = await axios.put(
      `${api}/update-partial-payment`,
      { bookingId, paymentAmount },
      bearerHeader,
    );
    return { data: response?.data?.data, status: response?.status };
  } catch (error) {
    console.error("Update partial payment error:", error);
    return {};
  }
};

export const updateUserPackagePartialPayment = async (
  userPackageId,
  paymentAmount,
) => {
  try {
    const response = await axios.put(
      `${api}update-user-package-partial-payment`,
      { userPackageId, paymentAmount },
      bearerHeader,
    );
    return { data: response?.data?.data, status: response?.status };
  } catch (error) {
    console.error("Update partial payment error:", error);
    return {};
  }
};

export const updateUserPackagePartialPaymnet = updateUserPackagePartialPayment;

export const deleteBooking = async (id) => {
  try {
    const response = await axios.delete(`${api}booking/${id}`, bearerHeader);
    return { data: response?.data?.data, status: response?.status };
  } catch (error) {
    console.error("Delete booking error:", error);
    return {};
  }
};

export const bookingforadmin = async (data) => {
  console.log("New Data:", data);
  try {
    const books = await axios.post(`${api}bookingforadmin`, data, bearerHeader);
    console.log("Booksssssss: ", books);
    return { data: books?.data, status: books?.status };
  } catch (error) {
    console.log(error);
    return {};
  }
};

export const getBookings = async (params = {}) => {
  try {
    const token = localStorage.getItem("token");
    const books = await axios.get(`${api}bookings`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      params,
    });
    if (books.status !== 200)
      return { message: books?.data?.message, status: books?.status };
    return {
      data: books?.data?.data,
      pagination: books?.data?.pagination,
      status: books?.status,
    };
  } catch (error) {
    console.log(error);
    return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  }
};

export const getAllBookingsdates = async () => {
  try {
    const books = await axios.get(`${api}getAllBookingsdates`, bearerHeader);
    if (books.status != 200)
      return { message: books?.data?.message, status: books?.status };
    return { data: books?.data?.data, status: books?.status };
  } catch (error) {
    console.log(error);
    return { data: [] };
  }
};

export const getBookingsByUser = async (id) => {
  try {
    const books = await axios.get(`${api}booking/user/${id}`, bearerHeader);
    if (books.status != 200)
      return { message: books?.data?.message, status: books?.status };
    return { data: books?.data?.data, status: books?.status };
  } catch (error) {
    console.log(error);
    return { data: [] };
  }
};

export const Bookingclass = async (date, id, previousDate, data) => {
  try {
    const books = await axios.put(
      `${api}/booking/reschedule/${id}`,
      { ...data, newDate: date, date: previousDate },
      bearerHeader,
    );
    return { data: books?.data?.data, status: books?.status };
  } catch (error) {
    console.log(error);
    return { status: 300 };
  }
};

export const rescheduleBooking = async (date, id, previousDate, data) => {
  try {
    const books = await axios.put(
      `${api}booking/reschedule/${id}`,
      { ...data, newDate: date, date: previousDate },
      bearerHeader,
    );
    return { data: books?.data?.data, status: books?.status };
  } catch (error) {
    console.log(error);
    return { status: 300 };
  }
};

export const ClassReschedule = async (data) => {
  try {
    const books = await axios.put(
      `${api}booking/class/reschedule/`,
      data,
      bearerHeader,
    );
    return { data: books?.data?.data, status: books?.status };
  } catch (error) {
    console.log(error);
    return { status: 300 };
  }
};

export const getTotalAmountofBookings = async () => {
  try {
    const books = await axios.get(`${api}getTotalAmount`, bearerHeader);
    if (books.status != 200)
      return { message: books?.data?.message, status: books?.status };
    return { data: books?.data?.data, status: books?.status };
  } catch (error) {
    console.log(error);
    return { data: [] };
  }
};

export const getTotalUsers = async () => {
  try {
    const users = await axios.get(`${api}totalUsers`, bearerHeader);
    if (users.status !== 200) {
      return { message: users?.data?.message, status: users?.status };
    }
    return { data: users?.data?.totalUsers, status: users?.status };
  } catch (error) {
    console.log(error);
    return { data: null };
  }
};

export const getTotalClasses = async () => {
  try {
    const classes = await axios.get(`${api}totalClasses`, bearerHeader);
    if (classes.status !== 200) {
      return { message: classes?.data?.message, status: classes?.status };
    }
    return { data: classes?.data?.totalClasses, status: classes?.status };
  } catch (error) {
    console.log(error);
    return { data: null };
  }
};

export const getTotalStaff = async () => {
  try {
    const staff = await axios.get(`${api}getTotalStaffs`, bearerHeader);
    if (staff.status !== 200) {
      return { message: staff?.data?.message, status: staff?.status };
    }
    return { data: staff?.data?.totalStaffs, status: staff?.status };
  } catch (error) {
    console.log(error);
    return { data: null };
  }
};

export const getAllLocations = async () => {
  try {
    const response = await axios.get(`${api}allocations`, bearerHeader);
    console.log(response, "locations");

    if (response.status !== 200) {
      return {
        message: response?.data?.message || "Error fetching locations",
        status: response?.status,
      };
    }

    return { data: response?.data, status: response?.status };
  } catch (error) {
    console.error("Error fetching locations:", error);
    return { data: [], status: 500, message: "Failed to fetch locations" };
  }
};

export const createLocation = async (data) => {
  try {
    const response = await axios.post(`${api}locations`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return { data: response?.data?.data, status: response?.status };
  } catch (error) {
    console.error("Error creating location:", error);
    return {};
  }
};

export const deleteLocation = async (id) => {
  try {
    const locations = await axios.delete(`${api}locations/${id}`, bearerHeader);
    return { data: locations?.data?.data, status: locations?.status };
  } catch (error) {
    console.log(error);
    return { status: 300 };
  }
};

export const EditLocation = async (data, id) => {
  try {
    const locations = await axios.put(
      `${api}locations/${id}`,
      data,
      formDataHeader,
    );
    return { data: locations?.data?.data, status: locations?.status };
  } catch (error) {
    console.log(error);
    return { status: 300 };
  }
};

export const getLocationById = async (id) => {
  try {
    const locations = await axios.get(`${api}locations/${id}`, bearerHeader);
    if (locations.status !== 200) {
      return { message: locations?.data?.message, status: locations?.status };
    }
    return { data: locations?.data?.data, status: locations?.status };
  } catch (error) {
    console.log(error);
    return { data: [] };
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

export const deletePackage = async (id) => {
  try {
    const cats = await axios.delete(`${api}package/${id}`, bearerHeader);
    return { data: cats?.data?.data, status: cats?.status };
  } catch (error) {
    console.log(error);
    return { status: 300 };
  }
};

export const createPackage = async (data) => {
  try {
    const cats = await axios.post(`${api}package`, data, bearerHeader);
    return { data: cats?.data?.data, status: cats?.status };
  } catch (error) {
    console.log(error);
    return {};
  }
};

export const updatePackage = async (data, id) => {
  try {
    const cats = await axios.put(`${api}package/${id}`, data, bearerHeader);
    return { data: cats?.data?.data, status: cats?.status };
  } catch (error) {
    console.log(error);
    return { status: 300 };
  }
};

export const getPayments = async ({
  page = 1,
  limit = 10,
  filter = "all",
  search = "",
} = {}) => {
  try {
    const payments = await axios.get(`${api}payment`, {
      ...bearerHeader,
      params: {
        page,
        limit,
        filter,
        search,
      },
    });

    if (payments.status !== 200) {
      return { message: payments?.data?.message, status: payments?.status };
    }

    return { data: payments?.data, status: payments?.status };
  } catch (error) {
    console.log(error);
    return { data: [], status: 500, message: "Request failed" };
  }
};

// Enquiry
export const getEnquiry = async () => {
  try {
    const payments = await axios.get(`${api}enquiry`, bearerHeader);
    if (payments.status !== 200) {
      return {
        message: payments?.data?.message || "Error getting enquires",
        status: payments?.status,
      };
    }
    return { data: payments?.data, status: payments?.status };
  } catch (error) {
    console.log(error);
    return { data: [] };
  }
};

export const deleteEnquiry = async (id) => {
  try {
    const locations = await axios.delete(`${api}enquiry/${id}`, bearerHeader);
    if (locations.status !== 200) {
      return {
        message: locations?.data?.message || "Error getting enquires",
        status: locations?.status,
      };
    }
    return { data: locations?.data?.data, status: locations?.status };
  } catch (error) {
    console.log(error);
    return { status: 300 };
  }
};

// Bachelorette
export const getbachelorette = async () => {
  try {
    const payments = await axios.get(`${api}bachelorette`, bearerHeader);
    if (payments.status !== 200) {
      return {
        message: payments?.data?.message || "Error getting bachelorette",
        status: payments?.status,
      };
    }
    return { data: payments?.data.data, status: payments?.status };
  } catch (error) {
    console.log(error);
    return { data: [] };
  }
};

export const deletebachelorette = async (id) => {
  try {
    const locations = await axios.delete(
      `${api}bachelorette/${id}`,
      bearerHeader,
    );
    if (locations.status !== 200) {
      return {
        message: locations?.data?.message || "Error getting bachelorette",
        status: locations?.status,
      };
    }
    return { data: locations?.data?.data, status: locations?.status };
  } catch (error) {
    console.log(error);
    return { status: 300 };
  }
};

export const createMultipleBookings = async (payload) => {
  try {
    const response = await axios.post(
      `${api}booking/multipleAdmin`,
      payload,
      bearerHeader,
    );

    return {
      status: response.status,
      success: true,
      message: "Bookings created successfully",
      data: response.data,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        status: error.response.status,
        success: false,
        message: error.response.data?.message || "Something went wrong",
      };
    }

    return {
      status: 500,
      success: false,
      message: "Something went wrong",
    };
  }
};

export const cancelBookingById = async (id) => {
  try {
    const response = await axios.delete(
      `${api}/delete-booking-from-package-by-admin/${id}`,
      bearerHeader,
    );
    const data = response?.data?.data;

    return {
      id: data?._id || id,
      data: data,
      status: response?.status,
      message: response?.data?.message,
    };
  } catch (error) {
    console.error("Error cancelling booking:", error);

    const status =
      axios.isAxiosError(error) && error.response ? error.response.status : 500;
    const message =
      axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : "Something went wrong";

    return {
      id: null,
      status,
      message,
    };
  }
};

export const getAllAppVersions = async () => {
  const response = await axios.get(`${api}getAllAppVersions`);
  return response.data;
};
export const getAdminDashBoard = async () => {
  const response = await axios.get(`${api}admin/dashboard/super`);
  return response.data;
};

export const upsertAppVersion = async (data) => {
  const response = await axios.post(`${api}app-version`, data, bearerHeader);
  return response.data;
};

export const getExistingBookingsCount = async (payload) => {
  try {
    const response = await axios.post(
      `${api}preview-booking-class-availbality`,
      payload,
      bearerHeader,
    );

    return {
      status: response.status,
      success: true,
      message:
        response.data?.slots?.[0]?.message ||
        "Existing bookings fetched successfully",
      data: response.data,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        status: error.response.status,
        success: false,
        message: error.response.data?.message || "Something went wrong",
        data: error.response.data || null,
      };
    }

    return {
      status: 500,
      success: false,
      message: "Something went wrong",
      data: null,
    };
  }
};
