import React from "react";
import { Link } from "react-router-dom";
import { parseMileage } from "../utils";
import { useSettings } from "../SettingsContext";
import { MdAnchor, MdOutlineHistory } from "react-icons/md";
import { RxExternalLink } from "react-icons/rx";
import { formatCurrency } from "../utils";

export const VehicleCard = ({ v, num, ...props }) => {
  // console.log({ v });
  const backgroundStyle = {
    backgroundImage: `url(${v?.thumbnail})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const {
    settings: { vehicleListDisplayMode, showPrice, showCarfax },
  } = useSettings();

  if (vehicleListDisplayMode === "list")
    return (
      <div className="w-full max-w-full flex my-0.5   border border-white hover:bg-white hover:bg-opacity-20 transition-all border-opacity-20 md:rounded ">
        <div
          style={backgroundStyle}
          className="w-24 h-16   rounded flex-shrink-0 overflow-hidden hover:scale-95 transition-all "
        ></div>
        <div className="flex flex-col justify-between items-start flex-grow truncate px-1">
          <div className="flex w-full justify-between">
            <Link
              to={{
                pathname: `/${v?.stock}`,
                state: v,
              }}
              className="whitespace-pre-wrap text-sm "
            >
              {`${v?.year} ${v?.make} ${v?.model}`} <span className="opacity-40">{v?.trim}</span>
            </Link>
            <div className="flex items-center space-x-4">
              <a
                href={v?.link}
                target="_blank"
                aria-describedby="audioeye_new_window_message"
                className="rounded-full    border-opacity-25 hover:bg-white hover:bg-opacity-20"
              >
                <RxExternalLink />
              </a>

              {showCarfax && (
                <a
                  href={`http://www.carfax.com/VehicleHistory/p/Report.cfx?partner=DEY_0&vin=${v?.vin}`}
                  target="_blank"
                  aria-describedby="audioeye_new_window_message"
                  className="rounded-full    border-opacity-25 hover:bg-white hover:bg-opacity-20"
                >
                  <MdOutlineHistory />
                </a>
              )}
              {showPrice && v?.our_price && (
                <span className="px-2 " onClick={() => console.log(v)}>
                  {formatCurrency(v.our_price)}
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-between text-xs w-full ">
            <div className="text-sm ">{v?.vin && "#" + v.vin.slice(-8)}</div>
            <div className="text-xs">{v?.miles && parseMileage(v.miles)}</div>
          </div>
          {/* <div className="flex justify-between text-xs w-full ">
        <div className="text-sm ">{v?.doors}</div>
        <div className="text-xs">{v?.city_mpg} {v?.hw_mpg}</div>
      </div> */}
        </div>
      </div>
    );

  return (
    <Link
      to={{
        pathname: `/${v?.stock}`,
        state: v,
      }}
      className="w-2/5 sm:w-1/3 flex-grow-0  md:w-72 max-w-full flex flex-col   border border-white hover:bg-white hover:bg-opacity-20 transition-all border-opacity-20 md:rounded "
    >
      <div
        style={backgroundStyle}
        className="w-full h-28 sm:h-28 md:h-48  rounded-t flex-shrink-0 overflow-hidden hover:scale-95 transition-all "
      ></div>
      <div className="flex flex-col justify-between items-start flex-grow truncate px-1">
        <span className="whitespace-pre-wrap text-sm ">
          {`${v?.year} ${v?.make} ${v?.model}`} <span className="opacity-40">{v?.trim}</span>
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
