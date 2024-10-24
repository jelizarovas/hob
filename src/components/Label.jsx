import React from "react";

export const Label = ({ label = "" }) => {
  return (
    <label className="text-xs font-sans text-justify pl-2 flex justify-between items-center ">
      {label}
    </label>
  );
};
