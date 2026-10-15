import moment from "moment";
import React from "react";
import { useAppSelector } from "src/Redux/hooks";
import { convertTo12HourFormat } from "src/Utils/Functions";
import { IoMdTime } from "react-icons/io";
import { MdOutlineDateRange } from "react-icons/md";

const Summary = () => {
  const classes = useAppSelector((state) => state.app.class);
  const date = useAppSelector((state) => state.app.date);
  const time = useAppSelector((state) => state.app.time);

  const count = 1;

  return (
    <div className="p-6 mx-auto border rounded-lg shadow-md bg-white mx-3 my-3">
      <h2 className="text-lg font-semibold mb-4">Summary</h2>

      <div className="flex justify-between items-center mb-4 border-2 rounded-md p-2">
        <div>
          <p className="font-bold">
            {classes?.name + " " + `INR ${classes?.price}` + " x 1 person"}
          </p>
          <p className="flex items-center gap-1 text-sm">
            <MdOutlineDateRange />
            {moment(date).format("MMMM DD, YYYY")}
          </p>
          <p className="flex items-center gap-1 text-sm">
            <IoMdTime />
            {convertTo12HourFormat(time || "")}
          </p>
        </div>

        <div>
          <p className="font-medium mt-2">{`INR ${
            (classes?.price ?? 0) * count
          }`}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <p className="font-medium text-lg">Total Amount:</p>
        <p className="font-semibold text-lg">{`INR ${
          (classes?.price ?? 0) * count
        }`}</p>
      </div>
    </div>
  );
};

export default Summary;
