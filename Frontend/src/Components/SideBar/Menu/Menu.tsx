import React from "react";
import MenuItem from "./MenuItem";
import { RiShoppingBag3Line } from "react-icons/ri";
import { LuCalendarClock } from "react-icons/lu";
import { MdPersonOutline } from "react-icons/md";
import { MdOutlinePayments } from "react-icons/md";
import "./menu.css";
import { useAppSelector } from "src/Redux/hooks";
import moment from "moment";
import { convertTo12HourFormat } from "src/Utils/Functions";
import { FaRegCalendarCheck } from "react-icons/fa";
import { FiPackage } from "react-icons/fi";
import { MdOutlineEditCalendar } from "react-icons/md";

const Menu = () => {
  const steps = useAppSelector((state) => state.app.step);
  const isPackage = useAppSelector((state) => state.app.isPackage);
  const selectedClass = useAppSelector((state) => state.app.class);
  const selectedPackage = useAppSelector((state) => state.app.selectedPackage);
  const location = useAppSelector((state) => state.app.location);
  const date = useAppSelector((state) => state.app.date);
  const time = useAppSelector((state) => state.app.time);
  return (
    <>
      <div className="menu-item">
        <MenuItem
          title="Classes"
          isChecked={steps > 1}
          icon={<RiShoppingBag3Line />}
        />
        <div className={selectedClass || location ? "mt-05 gap-05 grid" : ""}>
          {selectedClass && (
            <p className="menu-item-redux-data">{selectedClass?.name}</p>
          )}
          {location && (
            <p
              className="menu-item-redux-data"
              style={{ borderTop: "1px dotted #5b4791", paddingTop: "5px" }}
            >
              {location?.name}
            </p>
          )}
        </div>
      </div>
      {/* <div className="menu-item">
        <MenuItem
          title="Date & Time"
          isChecked={steps > 3}
          icon={<LuCalendarClock />}
        />
        {date && time && (
          <div className="mt-05 gap-05 grid">
            <p className="menu-item-redux-data">
              {moment(date).format("MMMM DD, YYYY") +
                " " +
                convertTo12HourFormat(time || "")}
            </p>
          </div>
        )}
      </div> */}

      {steps >= 11 || isPackage ? (
        <>
          <div className="menu-item">
            <MenuItem
              title="Package"
              isChecked={steps > 11 || [4, 5].includes(steps)}
              icon={<FiPackage />}
            />
            {date && time && (
              <div className="mt-05 gap-05 grid">
                <p className="menu-item-redux-data">{selectedPackage?.name}</p>
              </div>
            )}
          </div>
          <div className="menu-item">
            <MenuItem
              title="Appointment"
              isChecked={steps > 12 || [4, 5].includes(steps)}
              icon={<MdOutlineEditCalendar />}
            />
          </div>
          <div className="menu-item">
            <MenuItem
              title="Booking Overview"
              isChecked={steps > 13 || [4, 5].includes(steps)}
              icon={<FaRegCalendarCheck />}
            />
          </div>
        </>
      ) : (
        <div className="menu-item">
          <MenuItem
            title="Date & Time"
            isChecked={steps > 3}
            icon={<LuCalendarClock />}
          />
          {date && time && (
            <div className="mt-05 gap-05 grid">
              <p className="menu-item-redux-data">
                {moment(date).format("MMMM DD, YYYY") +
                  " " +
                  convertTo12HourFormat(time || "")}
              </p>
            </div>
          )}
        </div>
      )}
      <div className="menu-item">
        <MenuItem
          title="Your Information"
          isChecked={steps > 4 && steps < 11}
          icon={<MdPersonOutline />}
        />
      </div>
      <div className="menu-item">
        <MenuItem
          title="Payments"
          isChecked={steps > 5 && steps < 11}
          icon={<MdOutlinePayments />}
        />
      </div>
    </>
  );
};

export default Menu;
