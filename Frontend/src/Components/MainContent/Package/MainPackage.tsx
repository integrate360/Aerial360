import React, { useState } from "react";
import SectionHeader from "../MainUtils/SectionHeader";
import PackageDetails from "./PackageDetails";

const MainPackage = ({
  next,
  prev,
}: {
  next: () => void;
  prev: () => void;
}) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        // overflowY: "scroll",
        position: "relative",
        paddingBottom: "4rem",
      }}
    >
      <SectionHeader title="Packages" isPrev={true} prev={prev} />
      <PackageDetails next={next} prev={prev} />
      <div className="class-bottom-next bg-white">
        <button
          onClick={next}
          style={{
            color: "white",
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default MainPackage;
