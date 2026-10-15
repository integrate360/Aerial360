import { useState, useEffect } from "react";
import { getClasses } from "../Apis/ApiCalls";
import ClassList from "../components/class/ClassList";
import ClassCalender from "../components/class/ClassCalender";

const ClassPage = () => {
  const [classes, setClasses] = useState([]);
  const [isCalender, setIsCalender] = useState(false);

  const fetchData = async () => {
    try {
      const classRes = await getClasses();
      if (classRes?.status !== 200) {
        return;
      }
      // Reverse the array as in original code
      setClasses(classRes?.data?.reverse() || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {isCalender ? (
        <ClassCalender data={classes} chooseList={() => setIsCalender(false)} />
      ) : (
        <ClassList
          fetchClasses={fetchData}
          classess={classes}
          chooseCalender={() => setIsCalender(true)}
        />
      )}
    </div>
  );
};

export default ClassPage;
