import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "src/Redux/hooks";
import { users } from "src/Utils/Types";
import { setSlotsEmpty } from "src/Redux/appSlice";
import { createPackageOrder, verifyPackagePayment } from "./submitHandler";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PackageRazorpayIntegration = ({
  prev,
}: {
  prev: (e: number) => void;
}) => {
  const selectedPackage = useAppSelector((state) => state.app.selectedPackage);
  const slots = useAppSelector((state) => state.app.slots);
  const dispatch = useAppDispatch();

  const [user, setUser] = useState<users>();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert("Razorpay SDK failed to load");
      return;
    }

    if (!selectedPackage) {
      alert("Package not selected");
      return;
    }

    if (!user || !user._id) {
      alert("User not logged in");
      return;
    }

    if (!slots || slots.length === 0) {
      alert("No slots selected");
      return;
    }

    console.log("Slots being sent:", slots); // Debug

    try {
      if (!selectedPackage?._id || !user?._id) {
        console.error("Missing required IDs");
        return;
      }

      // ✅ Pass slots directly without formatting
      const orderRes = await createPackageOrder(
        selectedPackage._id,
        user._id,
        selectedPackage.price,
        slots, // No formatting needed
      );

      if (orderRes.status !== 201 || !orderRes.data) {
        alert(orderRes.message || "Failed to create order");
        return;
      }

      const { orderId, amount, currency } = orderRes.data;

      // Rest of your Razorpay code...
      const options = {
        key: "rzp_live_PT1TWsnM13NbjL",
        amount,
        currency,
        name: "AirBound",
        description: "Package Booking",
        order_id: orderId,
        handler: async (response: any) => {
          const verifyRes = await verifyPackagePayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verifyRes.status !== 200) {
            alert(verifyRes.message || "Payment verification failed");
            return;
          }

          dispatch(setSlotsEmpty());
          prev(1);
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone,
        },
        theme: {
          color: "#1f0e4e",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on("payment.failed", () => {
        alert("Payment failed. Please try again.");
      });
    } catch (error) {
      console.error("Payment error:", error);
      alert("Error initiating payment");
    }
  };

  return (
    <div className="class-bottom-next bg-white">
      <button onClick={handlePayment}>Pay</button>
    </div>
  );
};

export default PackageRazorpayIntegration;
