import React from "react";
import { IoLocationOutline } from "react-icons/io5";
import { BsCalendar3, BsClock } from "react-icons/bs";
import { slotDataType } from "src/Utils/Types";
import { MdSportsGymnastics } from "react-icons/md";
import { IoPersonSharp } from "react-icons/io5";

const AppointmentCard = ({ data }: { data: slotDataType }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="w-full mx-auto">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4">
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-start space-x-4 border-b border-purple-100 pb-3 mb-3">
              {/* <div className="text-center w-8">
                <span className="text-gray-500">1</span>
              </div> */}
              <div className="flex-1 space-y-3">
                <div className="flex items-start space-x-2 align-center">
                  <MdSportsGymnastics className="text-gray-500" />
                  <div className="text-gray-700">
                    <div>{data?.className}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <BsCalendar3 className="text-gray-500" />
                  <span className="text-gray-700">
                    {formatDate(data?.date)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <BsClock className="text-gray-500" />
                  <span className="text-gray-700">{data?.time}</span>
                </div>
                <div className="flex items-start space-x-2 align-center">
                  <IoPersonSharp className="text-gray-500" />
                  <div className="text-gray-700">
                    <div>{data?.trainer?.name}</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2 align-center">
                  <IoLocationOutline className="text-gray-500" />
                  <div className="text-gray-700">
                    <div>{data?.location?.name}</div>
                    <div className="text-sm text-gray-600">
                      {data?.location?.address}
                    </div>
                    {data?.location?.googleMapLink && (
                      <a
                        href={data?.location?.googleMapLink || "airbound.in"}
                        target="_blank"
                        style={{
                          color: "blue",
                          fontSize: "12px",
                          textDecoration: "underline",
                        }}
                      >
                        view in map
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
