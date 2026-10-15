import moment from "moment";
import React, { use, useState } from "react";
import { FiCheckSquare } from "react-icons/fi";
import { useAppSelector } from "src/Redux/hooks";
import { convertTo12HourFormat } from "src/Utils/Functions";
import { IoMdTime } from "react-icons/io";
import { MdOutlineDateRange } from "react-icons/md";

const PackageSummary = () => {
  const people = useAppSelector((state) => state.app.people);
  const selectedPackage = useAppSelector((state) => state.app?.selectedPackage);
  return (
    <div className="p-6 mx-auto border rounded-lg shado-md bg-white mx-3 my-3">
      <h2 className="text-lg font-semibold mb-4">Summary</h2>

      <div className="flex justify-between items-center mb-4 border-2 rounded-md     p-2">
        <div>
          <p
            className="font-medium font-bold"
            style={{ fontSize: "12px", color: "gray", marginBottom: ".5rem" }}
          >
            Package
          </p>
          <p className="font-medium font-bold">{selectedPackage?.name}</p>
        </div>
        <div>
          <p className="font-medium">{`INR ${selectedPackage?.price}`}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <p className="font-medium text-lg">Total Amount:</p>
        <p className="font-semibold text-lg">{`INR ${
          selectedPackage?.price ?? 0
        }`}</p>
      </div>
    </div>
  );
};

export default PackageSummary;
