import React, { useEffect, useState } from "react";
import SectionHeader from "../MainUtils/SectionHeader";
import RegistrationForm from "./Registration/Register";
import Login from "./Login/Login";
import { users } from "src/Utils/Types";
import "./UserInformation.css";
import { FaPhoneAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { getInitials } from "src/Utils/Functions";
import { useAppDispatch, useAppSelector } from "src/Redux/hooks";
import { setPeople } from "src/Redux/appSlice";

const UserInformation = ({
  next,
  prev,
}: {
  next: () => void;
  prev: () => void;
}) => {
  const [login, setLogin] = useState<boolean>(true);
  const [user, setUser] = useState<users>();
  const dispatch = useAppDispatch();
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setUser(JSON.parse(user));
    }
  }, []);
  return (
    <div>
      <SectionHeader
        title="Your Information"
        isPrev={true}
        prev={() => {
          prev();
          dispatch(setPeople(1));
        }}
      />
      {user && (
        <div
          className="flex justify-center items-center mt-4"
          style={{ marginInline: "2rem" }}
          onClick={next}
        >
          <div className="flex bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-lg overflow-hidden w-full p-1">
            <div className="bg-white rounded-lg w-full p-4 flex-col">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-base font-semibold">
                  {getInitials(user?.name || "")}
                </div>
                <h2 className="text-lg font-semibold ml-3 text-gray-800">
                  {user?.name}{" "}
                  <span style={{ fontWeight: "lighter", fontSize: "12px" }}>
                    (previous login)
                  </span>
                </h2>
              </div>

              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <div className="flex items-center bg-blue-50 rounded-lg px-2 py-1 hover:bg-blue-100 transition-all">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                    @
                  </div>
                  <span className="ml-2 text-sm text-gray-700">
                    {user?.email}
                  </span>
                </div>

                <div className="flex items-center bg-purple-50 rounded-lg px-2 py-1 hover:bg-purple-100 transition-all">
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
                    #
                  </div>
                  <span className="ml-2 text-sm text-gray-700">
                    {user?.phone}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {login ? (
        <Login setLogin={(e) => setLogin(e)} next={next} />
      ) : (
        <RegistrationForm setLogin={(e) => setLogin(e)} next={next} />
      )}
    </div>
  );
};

export default UserInformation;
