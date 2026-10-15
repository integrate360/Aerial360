import React from "react";
import { useAppSelector } from "src/Redux/hooks";

const SingleSelect = ({ next }: { next: () => void }) => {
  const price = useAppSelector((state) => state.app.class?.price);

  return (
    <div
      style={{
        backgroundColor: "rgba(51, 22, 130, 1)",
        padding: "16px",
        color: "white",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        margin: "1rem",
        borderRadius: "5px",
        justifyContent: "space-between",
      }}
    >
      <p>Continue with the selected service</p>
      <button
        onClick={next}
        style={{
          background: "white",
          borderRadius: "25px",
          padding: ".3rem 1rem",
          border: "none",
        }}
      >
        <span
          style={{
            color: "#6b46c1",
            fontWeight: "500",
            fontSize: "12px",
          }}
        >
          INR{price?.toLocaleString()}
        </span>
      </button>
    </div>
  );
};

export default SingleSelect;
