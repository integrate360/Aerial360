import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "src/Redux/hooks";
import { users } from "src/Utils/Types";
import { createClassOrder, verifyClassPayment } from "./submitHandler";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayIntegration = ({ prev }: { prev: (e: number) => void }) => {
  const classes = useAppSelector((state) => state.app.class);
  const people = useAppSelector((state) => state.app.people);
  const availability = useAppSelector((state) => state.app.availablity);
  const time = useAppSelector((state) => state.app.time);
  const date = useAppSelector((state) => state.app.date);
  const location = useAppSelector((state) => state.app.location);

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

    if (!classes || !classes._id || !classes.price) {
      alert("Class not selected");
      return;
    }

    if (!user || !user._id) {
      alert("User not logged in");
      return;
    }

    if (!date || !location) {
      alert("Missing booking details");
      return;
    }

    try {
      const finalPeople = people === 0 ? 1 : people;
      const totalAmount = classes.price * finalPeople;

      if (!location || !location._id) {
        alert("Location not selected");
        return;
      }

      const payload = {
        class: classes._id,
        user: user._id,
        dates: [new Date(date)],
        location: location._id,
        amount: totalAmount,
        time: time ? [time] : [],
        duration: availability?.duration,
        people: finalPeople,
      };
      const orderRes = await createClassOrder(payload);

      if (orderRes.status !== 201 || !orderRes.data) {
        alert(orderRes.message || "Failed to create class order");
        return;
      }

      const { orderId, amount, currency } = orderRes.data;

      const options = {
        key: "rzp_live_PT1TWsnM13NbjL",
        amount,
        currency,
        name: "AirBound",
        description: "Class Booking",
        order_id: orderId,
        handler: async (response: any) => {
          const verifyRes = await verifyClassPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verifyRes.status !== 200) {
            alert(verifyRes.message || "Payment verification failed");
            return;
          }

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
    } catch (error) {
      console.error("Class payment error:", error);
      alert("Error initiating payment");
    }
  };

  return (
    <div className="class-bottom-next bg-white">
      <button onClick={handlePayment}>Pay</button>
    </div>
  );
};

export default RazorpayIntegration;
