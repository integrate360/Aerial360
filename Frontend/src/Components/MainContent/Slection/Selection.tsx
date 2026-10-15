import React, { useEffect, useState } from "react";
import Packages from "./Pacakges/Package";
import SingleSelect from "./SingleSelect/SingleSelect";
import SectionHeader from "../MainUtils/SectionHeader";
import { PackageClass } from "src/Utils/Types";
import { getPackages, getPackagesByClass } from "src/Utils/ApiCalls";
import { useAppDispatch, useAppSelector } from "src/Redux/hooks";
import BringingAnyoneModal from "./PeopleModal";
import { setPeople } from "src/Redux/appSlice";

const Selection = ({
  next,
  prev,
  jumpTo,
}: {
  next: () => void;
  prev: () => void;
  jumpTo: (num: number) => void;
}) => {
  const [packages, setPacakges] = useState<PackageClass[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const classes = useAppSelector((state) => state.app.class);
  const wasPrev = useAppSelector((state) => state.app.wasPrev);
  const dispatch = useAppDispatch();
  const handlePriceClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    next();
  };
  const handleModalConfirm = (additionalPeople: number) => {
    dispatch(setPeople(additionalPeople + 1));
    setIsModalOpen(false);
    next();
  };
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getPackagesByClass(classes?._id || "");
      if (res.data?.length === 0) {
        if (wasPrev) return prev();
        return next();
      }
      setPacakges(res.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  if (loading)
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        Loading...
      </div>
    );
  return (
    <div>
      <SectionHeader title="Selection" isPrev={true} prev={prev} />
      <Packages packages={packages} jumpTo={jumpTo} />
      <SingleSelect next={() => next()} />
      {isModalOpen && (
        <BringingAnyoneModal
          onClose={handleModalClose}
          onConfirm={handleModalConfirm}
        />
      )}
    </div>
  );
};

export default Selection;
