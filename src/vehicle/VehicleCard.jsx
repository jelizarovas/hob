import React from "react";
import { Link } from "react-router-dom";
import { parseMileage } from "../utils";

export const VehicleCard = ({ v, num, ...props }) => {
  const backgroundStyle = {
    backgroundImage: `url(${v?.thumbnail})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <Link
      to={{
        pathname: `/${v?.stock}`,
        state: v,
      }}
      className="w-2/5 sm:w-1/3  md:w-72 max-w-full flex flex-col   border border-white hover:bg-white hover:bg-opacity-20 transition-all border-opacity-20 md:rounded "
    >
      <div
        style={backgroundStyle}
        className="w-full h-28 sm:h-28 md:h-48  rounded-t flex-shrink-0 overflow-hidden hover:scale-95 transition-all "
      ></div>
      <div className="flex flex-col justify-between items-start flex-grow truncate px-1">
        <span className="whitespace-pre-wrap text-sm ">
          {`${v?.year} ${v?.make} ${v?.model}`}{" "}
          <span className="opacity-40">{v?.trim}</span>
        </span>
        <div className="flex justify-between text-xs w-full ">
          <div className="text-sm ">{v?.vin && "#" + v.vin.slice(-8)}</div>
          <div className="text-xs">{v?.miles && parseMileage(v.miles)}</div>
        </div>
        {/* <div className="flex justify-between text-xs w-full ">
          <div className="text-sm ">{v?.doors}</div>
          <div className="text-xs">{v?.city_mpg} {v?.hw_mpg}</div>
        </div> */}
      </div>
    </Link>
  );
};
