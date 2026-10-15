import React, { use, useState } from "react";
import SectionHeader from "../MainUtils/SectionHeader";
import { Category, Class, Location } from "src/Utils/Types";
import "./class.css";
import { useAppDispatch } from "src/Redux/hooks";
import { setClass, setLocation } from "src/Redux/appSlice";

const Classes = ({
  next,
  classes,
  categories,
}: {
  next: () => void;
  classes: Class[];
  categories: Category[];
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [location, setLocationState] = useState<Location[] | null>([]);
  const [isError, setIsError] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const dispatch = useAppDispatch();

  const [selectedLocations, setSelectedLocations] = useState<Location | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);
  const [locIsOpen, setLocIsOpen] = useState(false);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(
    null
  );

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleClassSelect = (classItem: Class) => {
    setSelectedClass(classItem);
    dispatch(setClass(classItem));
    setIsOpen(false);
    const allUniqueLocations = Array.from(
      new Map(
        classItem?.availability?.flatMap((availabilityItem) =>
          availabilityItem.locations.map((location) => [
            location._id,
            {
              id: location._id,
              _id: location._id,
              name: location.name,
              address: location.address,
              googleMapLink: location.googleMapLink,
            },
          ])
        )
      ).values()
    );
    if (allUniqueLocations?.length > 0) handleLocSelect(allUniqueLocations[0]);
    setLocationState(allUniqueLocations);
  };

  const handleLocSelect = (locItem: Location) => {
    setSelectedLocations(locItem);
    dispatch(setLocation(locItem));
    setLocIsOpen(false);
  };

  const groupedClasses = classes.reduce(
    (acc: Record<string, Class[]>, curr) => {
      const categoryId =
        typeof curr.category !== "string" ? curr.category._id : curr.category;
      if (categoryId) {
        if (!acc[categoryId]) {
          acc[categoryId] = [];
        }
        acc[categoryId].push(curr);
      }
      return acc;
    },
    {}
  );

  return (
    <div className="classes-container">
      <SectionHeader title="Classes" isPrev={false} prev={() => {}} />
      <div className="classes-select-grp">
        <div className="select-wrapper">
          <p style={{ marginBottom: ".4rem" }}>
            <span style={{ color: "red" }}>*</span> Classes
          </p>
          <button
            onClick={() => {
              setIsOpen(!isOpen);
              setLocIsOpen(false);
            }}
            className="select-button"
          >
            <span>{selectedClass ? selectedClass.name : "Select Classes"}</span>
            <span className={`arrow ${isOpen ? "open" : ""}`}>▼</span>
          </button>
          {isOpen && (
            <div className="dropdown-container">
              <div className="dropdown-content">
                <div className="categories-list">
                  {categories.map((category) => {
                    const categoryClasses = category._id
                      ? groupedClasses[category._id] || []
                      : [];
                    return (
                      <div
                        key={category._id}
                        className="category-item"
                        onClick={() => handleCategorySelect(category)}
                        onMouseEnter={() =>
                          setHoveredCategoryId(category._id ?? null)
                        }
                        // onMouseLeave={() => setHoveredCategoryId(null)}
                      >
                        <div className="category-title">
                          {category.title}
                          <span className="class-count">
                            ({categoryClasses.length})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="classes-list">
                  {hoveredCategoryId &&
                    groupedClasses[hoveredCategoryId]?.map((classItem) => (
                      <div
                        key={classItem._id}
                        className="class-item"
                        onClick={() => handleClassSelect(classItem)}
                      >
                        <span className="class-name">{classItem.name}</span>
                        <span className="class-price">
                          INR {classItem.price?.toFixed(2)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
          {isError && (
            <p style={{ marginBottom: ".4rem", fontSize: "12px" }}>
              <span style={{ color: "red" }}>
                Please select a class to book
              </span>
            </p>
          )}
        </div>
        {selectedClass && (
          <div className="select-wrapper">
            <p style={{ marginBottom: ".4rem" }}>Location</p>
            <button
              onClick={() => {
                setLocIsOpen(!locIsOpen);
                setIsOpen(false);
              }}
              className="select-button"
            >
              <span>
                {selectedLocations ? selectedLocations.name : "Select Location"}
              </span>
              <span className={`arrow ${locIsOpen ? "open" : ""}`}>▼</span>
            </button>
            {locIsOpen && (
              <div className="dropdown-container">
                <div className="dropdown-content">
                  <div className="categories-list-loc">
                    {location?.map((category) => {
                      return (
                        <div
                          key={category._id}
                          className="category-item"
                          onClick={() => handleLocSelect(category)}
                          // onMouseLeave={() => setHoveredCategoryId(null)}
                        >
                          <div className="category-title">{category?.name}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="class-bottom-next">
        <button
          onClick={() => {
            if (!selectedClass) {
              setIsError(true);
              setTimeout(() => {
                setIsError(false);
              }, 1000);
              return;
            }
            next();
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default Classes;
