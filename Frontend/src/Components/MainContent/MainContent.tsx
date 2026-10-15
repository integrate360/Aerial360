import { use, useEffect, useState } from "react";
import Classes from "./Classes/Classes";
import Selection from "./Slection/Selection";
import UserInformation from "./UserInformation/UserInformation";
import Payments from "./Payments/Payments";
import Appointment from "./Appointment/Appointment";
import { getCategories, getClasses } from "src/Utils/ApiCalls";
import { Category, Class, Location } from "src/Utils/Types";
import { useAppDispatch, useAppSelector } from "src/Redux/hooks";
import { setStep } from "src/Redux/appSlice";
import PackageDetails from "./Package/PackageDetails";
import MainPackage from "./Package/MainPackage";
import PackageAppointment from "./Package/PackageAppointment/PackageAppointment";
import MainOverview from "./Package/OverView/MainOverview";

const MainContent = () => {
  const [step, setStepp] = useState<number>(1);
  const [classes, setClasses] = useState<Class[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const dispatch = useAppDispatch();
  const steps = useAppSelector((state) => state.app?.step);
  const isPackage = useAppSelector((state) => state.app?.isPackage);
  const fetchData = async () => {
    try {
      const cla = await getClasses();
      const cat = await getCategories();
      setClasses(cla.data);
      setCategories(cat.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="main-content">
      {step == 1 && (
        <Classes
          next={() => {
            dispatch(setStep(2));
            setStepp(2);
          }}
          // location={locaton}
          classes={classes}
          categories={categories}
        />
      )}
      {step == 2 && (
        <Selection
          next={() => {
            dispatch(setStep(3));
            setStepp(3);
          }}
          prev={() => {
            dispatch(setStep(1));
            setStepp(1);
          }}
          jumpTo={(e) => {
            dispatch(setStep(e));
            setStepp(e);
          }}
        />
      )}
      {step == 3 && (
        <Appointment
          next={() => {
            dispatch(setStep(4));
            setStepp(4);
          }}
          prev={() => {
            dispatch(setStep(2));
            setStepp(2);
          }}
        />
      )}
      {step == 4 && (
        <UserInformation
          next={() => {
            dispatch(setStep(5));
            setStepp(5);
          }}
          prev={() => {
            dispatch(setStep(isPackage ? 13 : 3));
            setStepp(isPackage ? 13 : 3);
          }}
        />
      )}
      {step == 5 && (
        <Payments
          prev={(e) => {
            dispatch(setStep(e));
            setStepp(e);
          }}
        />
      )}
      {/* For Packages */}
      {step == 11 && (
        <MainPackage
          next={() => {
            dispatch(setStep(12));
            setStepp(12);
          }}
          prev={() => {
            dispatch(setStep(2));
            setStepp(2);
          }}
        />
      )}{" "}
      {step == 12 && (
        <PackageAppointment
          next={() => {
            dispatch(setStep(13));
            setStepp(13);
          }}
          prev={() => {
            dispatch(setStep(11));
            setStepp(11);
          }}
        />
      )}{" "}
      {step == 13 && (
        <MainOverview
          next={() => {
            dispatch(setStep(4));
            setStepp(4);
          }}
          prev={() => {
            dispatch(setStep(12));
            setStepp(12);
          }}
        />
      )}
    </div>
  );
};

export default MainContent;
