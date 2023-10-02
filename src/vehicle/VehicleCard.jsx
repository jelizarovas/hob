import React from "react";
import { Link } from "react-router-dom";
import { parseMileage } from "../utils";
import { useSettings } from "../SettingsContext";
import {
  MdAddCircle,
  MdAnchor,
  MdOutlineHistory,
  MdRequestQuote,
  MdShare,
  MdVisibilityOff,
  MdCheck,
  MdCopyAll,
} from "react-icons/md";
import { RxExternalLink } from "react-icons/rx";
import { BsPinFill } from "react-icons/bs";
import { formatCurrency } from "../utils";

export const VehicleCard = ({ v, num, activeActionBarId, setActiveActionBarId, ...props }) => {
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
      <div
        className="flex flex-col lg:flex-row w-full items-center lg:space-x-4 my-0.5"
        onClick={() => setActiveActionBarId(activeActionBarId === v?.vin ? null : v?.vin)}
      >
        <div className="w-full max-w-full flex    border border-white hover:bg-white hover:bg-opacity-20 transition-all border-opacity-20 md:rounded  ">
          <Link
            to={{
              pathname: `/${v?.stock}`,
              state: v,
            }}
            style={backgroundStyle}
            className="w-24 h-16    flex-shrink-0 overflow-hidden hover:scale-95 transition-all "
          ></Link>
          <div className="flex flex-col justify-between items-start flex-grow truncate px-1">
            <div className="flex w-full justify-between">
              <div className="whitespace-pre-wrap text-sm ">
                {`${v?.year} ${v?.make} ${v?.model}`} <span className="opacity-40">{v?.trim}</span>
                {v?.certified > 0 && (
                  <span className="mx-2 border rounded text-xs px-1 py-0 bg-blue-600 bg-opacity-50">CPO</span>
                )}
              </div>
              <div className="flex items-center space-x-4">
                {/* <a
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
                )} */}
                {showPrice && v?.our_price && (
                  <span className="px-2 " onClick={() => console.log(v)}>
                    {formatCurrency(v.our_price)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between text-xs w-full ">
              <div className="text-sm ">
                <VINComponent vin={v?.vin} />
                {/* {v?.vin && "#" + v.vin.slice(-8)} */}
              </div>
              <div className="text-xs">{v?.miles && parseMileage(v.miles)}</div>
            </div>
            {/* <div className="flex justify-between text-xs w-full ">
        <div className="text-sm ">{v?.doors}</div>
        <div className="text-xs">{v?.city_mpg} {v?.hw_mpg}</div>
      </div> */}
          </div>
        </div>
        {activeActionBarId === v?.vin && <ActionBar v={v} />}
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

const ActionBar = ({ v, ...props }) => {
  const {
    settings: { vehicleListDisplayMode, showPrice, showCarfax },
  } = useSettings();

  return (
    <div className="w-full flex items-center justify-around rounded-b-lg lg:rounded border mb-4">
      {showCarfax && (
        <ActionButton
          label="History"
          Icon={MdOutlineHistory}
          href={`http://www.carfax.com/VehicleHistory/p/Report.cfx?partner=DEY_0&vin=${v?.vin}`}
        />
      )}
      <ActionButton label="URL" Icon={RxExternalLink} href={v?.link} disabled={!v?.link} />
      <ActionButton
        label="Share"
        Icon={MdShare}
        onClick={() => {
          navigator.clipboard.writeText(v?.link);
          window.alert("URL Copied!");
        }}
      />
      <ActionButton label="Note" Icon={MdAddCircle} disabled />
      <ActionButton label="Pin" Icon={BsPinFill} disabled />
      <ActionButton label="Quote" Icon={MdRequestQuote} disabled />
      <ActionButton label="Hide" Icon={MdVisibilityOff} disabled />
    </div>
  );
};

const ActionButton = ({ label, Icon, href, ...props }) => {
  const className =
    "p-0 flex px-2 flex-col hover:bg-white hover:bg-opacity-20 transition-all justify-center items-center disabled:opacity-60 disabled:hover:bg-transparent  w-full py-1";

  const Content = () => (
    <>
      {Icon && <Icon className="text-2xl" />} <span className="text-xs">{label}</span>
    </>
  );

  if (href)
    return (
      <a href={href} className={className} target="_blank" {...props} disabled>
        <Content />
      </a>
    );

  return (
    <button type="button" onClick={(e) => e.stopPropagation()} className={className} {...props}>
      <Content />
    </button>
  );
};

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
      onClick={(e) => {
        e.stopPropagation();
        handleCopy(vin);
      }}
    >
      <span className="opacity-30 group-hover:opacity-70 transition-all">{regularVIN}</span>
      <span
        className="opacity-70 transition-all group-hover:opacity-100 hover:text-indigo-400 "
        onClick={(e) => {
          e.stopPropagation();
          handleCopy(boldStockNumber);
        }}
      >
        {boldStockNumber}
      </span>
    </div>
  );
};
