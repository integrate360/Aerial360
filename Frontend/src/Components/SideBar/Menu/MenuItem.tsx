import React from "react";

const MenuItem = ({
  title,
  isChecked,
  icon,
}: {
  title: string;
  isChecked: boolean;
  icon: React.ReactNode;
}) => {
  return (
    <div className="menu-item-div">
      <div className="flex gap-05">
        {icon}
        <p className="menu-item-div-title">{title}</p>
      </div>

      <label className="checkbox-container">
        <input type="checkbox" checked={isChecked} />
        <span className="checkmark"></span>
      </label>
    </div>
  );
};

export default MenuItem;
