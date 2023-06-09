import React, { useState, useEffect } from "react";
import { MdKeyboardArrowDown, MdOutlineHistory } from "react-icons/md";
import { VINComponent } from "./VINdisplay";

export const VehicleCard = ({ v, num, ...props }) => {
  const [isOpen, setOpen] = React.useState(false);

  const toggleOpen = () => setOpen((v) => !v);

  const backgroundStyle = {
    backgroundImage: `url(${v?.thumbnail})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <>
      <div className="w-full md:w-72 max-w-full flex flex-col   border border-white hover:bg-white hover:bg-opacity-20 transition-all border-opacity-20 md:rounded ">
        <div
          className="w-full h-48  rounded-t flex-shrink-0 overflow-hidden"
          style={backgroundStyle}
        >
          {/* <img className="w-full h-auto" src={v?.thumbnail} /> */}
        </div>
        <div className="flex flex-col justify-between items-start flex-grow truncate">
          <a
            className="whitespace-pre-wrap text-sm "
            // href={v?.link}
            // target="_blank"
          >
            {`${v?.year} ${v?.make} ${v?.model}`}{" "}
            <span className="opacity-40">{v?.trim}</span>
          </a>
          <div className="flex justify-between text-xs w-full ">
            <div className="text-sm ">{v?.vin && "#" + v.vin.slice(-8)}</div>
            <div className="text-xs">{v?.miles && parseMileage(v.miles)}</div>
          </div>
        </div>
      </div>
      {isOpen && (
        <pre className="bg-white bg-opacity-10 rounded border border-white border-opacity-20 text-xs w-full overflow-x-scroll">
          {JSON.stringify(v, null, 2)}
        </pre>
      )}
      {/*  */}
    </>
  );
};

function parseMileage(mileage) {
  return (
    Math.floor(Number(mileage.toString().replace(/\D/g, "")) / 1000) + "k miles"
  );
}
