import axios from "axios";
import { use } from "react";
import { api } from "src/Utils/ApiCalls";
import { bearerHeader } from "src/Utils/Config";
import { Booking, slotDataType } from "src/Utils/Types";

interface RazorPaySubmitHandlerResponse {
  status: number;
  message?: string;
  data?: any;
}

export const RazorPaySubmitHandler = async (
  userId: string,
  classId: string,
  amount: number,
  bookings: Booking[],
  isPackage: boolean
): Promise<RazorPaySubmitHandlerResponse> => {
  try {
    const res = await axios.post(
      `${api}payment`,
      { class: classId, amount, isPackage, user: userId, bookings },
      bearerHeader
    );
    if (res.status != 201)
      return { status: res.status, message: res.data?.message };
    return { status: 201, data: res.data };
  } catch (error) {
    console.log(error);
    return { status: 404 };
  }
};
export const PackageRazorPaySubmitHandler = async (
  packageId: string,
  userId: string,
  amount: number,
  bookings: slotDataType[],
  isPackage: boolean
): Promise<RazorPaySubmitHandlerResponse> => {
  try {
    const res = await axios.post(
      `${api}payment/package`,
      { package: packageId, amount, isPackage, user: userId, bookings },
      bearerHeader
    );
    if (res.status != 201)
      return { status: res.status, message: res.data?.message };
    return { status: 201, data: res.data };
  } catch (error) {
    console.log(error);
    return { status: 404 };
  }
};

export const createPackageOrder = async (
  packageId: string,
  userId: string,
  amount: number,
  bookings: slotDataType[]
): Promise<RazorPaySubmitHandlerResponse> => {
  try {
    const res = await axios.post(
      `${api}create-package-order`,
      {
        packageId,
        user: userId,
        amount,
        bookings,
      },
      bearerHeader
    );

    if (res.status !== 201) {
      return {
        status: res.status,
        message: res.data?.message || "Order creation failed",
      };
    }

    return {
      status: 201,
      data: res.data,
    };
  } catch (error: any) {
    console.error("Create Package Order Error:", error);
    return {
      status: error?.response?.status || 500,
      message: error?.response?.data?.message || "Server error",
    };
  }
};

export interface VerifyPackagePaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPackagePaymentResponse {
  status: number;
  success?: boolean;
  message?: string;
}

export const verifyPackagePayment = async (
  payload: VerifyPackagePaymentPayload
): Promise<VerifyPackagePaymentResponse> => {
  try {
    const res = await axios.post(
      `${api}verify-package-payment`,
      payload,
      bearerHeader
    );

    if (res.status !== 200) {
      return {
        status: res.status,
        success: false,
        message: res.data?.message || "Payment verification failed",
      };
    }

    return {
      status: 200,
      success: true,
      message: res.data?.message,
    };
  } catch (error: any) {
    console.error("Verify Package Payment Error:", error);

    return {
      status: error?.response?.status || 500,
      success: false,
      message:
        error?.response?.data?.message || "Server error during verification",
    };
  }
};

export const createClassOrder = async (
  payload: {
    class: string;
    user: string;
    dates: Date[];
    location: string;
    amount: number;
    time?: string[];
    duration?: number;
    people?: number;
  }
): Promise<RazorPaySubmitHandlerResponse> => {
  try {
    const res = await axios.post(
      `${api}create-class-order`,
      payload,
      bearerHeader
    );

    if (res.status !== 201) {
      return {
        status: res.status,
        message: res.data?.message || "Class order creation failed",
      };
    }

    return {
      status: 201,
      data: res.data,
    };
  } catch (error: any) {
    console.error("Create Class Order Error:", error);
    return {
      status: error?.response?.status || 500,
      message: error?.response?.data?.message || "Server error",
    };
  }
};

export interface VerifyClassPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyClassPaymentResponse {
  status: number;
  success?: boolean;
  message?: string;
}

export const verifyClassPayment = async (
  payload: VerifyClassPaymentPayload
): Promise<VerifyClassPaymentResponse> => {
  try {
    const res = await axios.post(
      `${api}verify-class-order`,
      payload,
      bearerHeader
    );

    if (res.status !== 200) {
      return {
        status: res.status,
        success: false,
        message: res.data?.message || "Class payment verification failed",
      };
    }

    return {
      status: 200,
      success: true,
      message: res.data?.message,
    };
  } catch (error: any) {
    console.error("Verify Class Payment Error:", error);
    return {
      status: error?.response?.status || 500,
      success: false,
      message:
        error?.response?.data?.message || "Server error during verification",
    };
  }
};
