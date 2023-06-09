import React from "react";
import { MdCheck, MdCopyAll } from "react-icons/md";

export const VINComponent = ({ vin }) => {
  const [isCopying, setIsCopying] = React.useState("");

  const handleCopy = (text) => {
    setIsCopying(text);
    navigator.clipboard.writeText(text);
    setTimeout(() => {
      setIsCopying("");
    }, 1000); // Delay of 1 second (1000 milliseconds)
  };

  const boldStockNumber = vin.slice(-8); // Extract the last 8 symbols for stock number
  const regularVIN = vin.slice(0, -8); // Remove the last 8 symbols from the VIN

  if (!!isCopying)
    return (
      <div className="bg-lime-500 bg-opacity-60 px-1 py-0.5 rounded flex items-center">
       <MdCheck /> <MdCopyAll /> {isCopying}
      </div>
    );

  return (
    <div
      className="flex space-x-1 group cursor-copy"
      onClick={(e) => handleCopy(vin)}
    >
      {/* <span className="opacity-30 group-hover:opacity-70 transition-all">
        {regularVIN}
      </span> */}
      <span
        className="opacity-70 transition-all group-hover:opacity-100 hover:text-indigo-400 "
        onClick={(e) => e.stopPropagation() || handleCopy(boldStockNumber)}
      >
        {boldStockNumber}
      </span>
    </div>
  );
};
