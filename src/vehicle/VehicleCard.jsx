import React from "react";
import { Link } from "react-router-dom";
import {
  getColorNameByCode,
  getGenericColor,
  parseAddress,
  parseMileage,
} from "../utils";
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
  MdListAlt,
  MdBarcodeReader,
  MdDirectionsCar,
  MdNewReleases,
  MdFileOpen,
} from "react-icons/md";
import { RxExternalLink } from "react-icons/rx";
import { BsClipboard, BsPinFill } from "react-icons/bs";
import { formatCurrency } from "../utils";
import QRCode from "react-qr-code";
import { isNumber } from "lodash";
import { FaBarcode } from "react-icons/fa6";
import useSearchSettings from "../hooks/useSearchSettings";
import { useVehicles } from "../VehicleContext";

export const VehicleCard = ({
  v,
  num,
  activeActionBarId,
  setActiveActionBarId,
  togglePinnedCar,
  isPinned = false,
  showPin,
  ...props
}) => {
  // console.log({ v });
  const backgroundStyle = {
    backgroundImage: `url(${v?.thumbnail})`,
    backgroundSize: "cover",
    backgroundPosition: "center right",
  };

  const {
    settings: {
      vehicleListDisplayMode,
      showPrice,
      showCarfax,
      showDays,
      showMiles,
      showLocation,
      showColor,
    },
  } = useSettings();

  if (vehicleListDisplayMode === "card")
    return (
      <div
        className="flex flex-col  w-full items-center  first:mt-0 last:mb-0 mt-0.5 mb-0.5"
        onClick={() =>
          setActiveActionBarId(activeActionBarId === v?.vin ? null : v?.vin)
        }
      >
        <div
          className={`w-full max-w-full flex  flex-row print:border-black print:my-1 print:px-2 print:py-1   border border-white hover:bg-white hover:bg-opacity-20 transition-all border-opacity-20 print:border-opacity-100 md:rounded ${
            activeActionBarId === v?.vin
              ? "bg-indigo-800 hover:bg-indigo-600 hover:bg-opacity-100"
              : ""
          }  `}
        >
          <div
            style={backgroundStyle}
            className="w-24 h-[68px] print:w-48 print:h-36  relative  flex-shrink-0 overflow-hidden hover:scale-105 transition-all "
          >
            {showPin && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  togglePinnedCar(v);
                }}
                className="group absolute w-full h-full flex items-center justify-center bg-black bg-opacity-80 hover:bg-slate-800 z-10 text-2xl transition-all"
              >
                <BsPinFill className="group-hover:rotate-45 transition-all" />
              </button>
            )}
            <img
              src={v?.thumbnail}
              alt="car"
              className="w-48 hidden print:block"
            />
            <div className="text-[10px] print:text-sm px-1 py-0.5 flex justify-between absolute w-full bg-black bg-opacity-80 left-0   bottom-0  leading-none">
              {showDays && (
                <span
                  className={`${
                    v?.days_in_stock > 60
                      ? "text-red-400"
                      : v?.days_in_stock > 30
                      ? "text-orange-400"
                      : ""
                  }`}
                >
                  {v?.days_in_stock} days
                </span>
              )}
              {showMiles && <span>{parseMileage(v.miles)}</span>}
            </div>
            {!!v?.miles && parseMileage(v.miles) && (
              <div
                title={v.miles}
                className="text-[10px]  print:text-sm px-1 py-0.5 absolute bg-black bg-opacity-80 right-0   bottom-0  leading-none"
              >
                {" "}
              </div>
            )}
          </div>
          <div className="flex flex-row justify-between items-start flex-grow  truncate px-1">
            <div className="flex flex-col flex-shrink w-full  h-full justify-between px-1">
              <div className="flex flex-col   text-sm">
                <span className="text-[8px]  print:text-sm leading-none pt-0.5 opacity-50 select-none text-left  ">
                  {v?.type}
                </span>
                <span
                  title={`${v?.year} ${v?.make} ${v?.model} ${v?.trim}`}
                  className="leading-none text-left whitespace-normal  bg-white bg-opacity-0  rounded"
                  // onClick={(e) => {
                  //   e.preventDefault();
                  //   e.stopPropagation();
                  //   navigator.clipboard.writeText(`${v?.year} ${v?.make} ${v?.model} ${v?.trim}`);
                  //   console.log("Copied", v?.link);
                  //   // window.alert("URL Copied!");
                  // }}
                >
                  {`${v?.year} ${v?.make} ${v?.model}`}{" "}
                  <span className="opacity-40">{v?.trim}</span>
                </span>
              </div>
              <div className="flex space-x-2 flex-grow text-[8px]  print:text-sm   pt-1 opacity-50 print:opacity-90 ">
                {showColor && (
                  <span className="leading-none truncate">
                    <span title={v?.ext_color_generic}>
                      {getGenericColor(
                        getColorNameByCode(v?.ext_color_generic)
                      )}
                    </span>{" "}
                    <span title={v.ext_color}>
                      {v?.ext_color && `- ${getColorNameByCode(v.ext_color)}`}
                    </span>{" "}
                    {v?.int_color && `   w/ ${v.int_color} interior`}
                  </span>
                )}
              </div>

              <div className="flex items-center  justify-between">
                <div className="flex justify-between text-xs w-full ">
                  <div className="text-sm leading-none">
                    <VINComponent vin={v?.vin} stock={v?.stock} />
                    {/* {v?.vin && "#" + v.vin.slice(-8)} */}
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="flex justify-between text-xs w-full ">
        <div className="text-sm ">{v?.doors}</div>
        <div className="text-xs">{v?.city_mpg} {v?.hw_mpg}</div>
      </div> */}
          </div>
          <div className="hidden print:block mx-4">
            <QRCode className="w-16 h-16" value={v.link} />
          </div>
          {showPrice && v?.our_price && (
            <div
              className="flex  flex-col justify-between  flex-shrink-0    px-0.5 w-20 print:w-32 pb-1"
              onClick={() =>
                console.log(v?.our_price_label, v?.our_price, v?.msrp)
              }
            >
              {v.msrp != 0 && determinePrice(v?.our_price) !== "Call" && (
                <div className="flex flex-col  print:space-x-2   justify-between text-right  text-sm">
                  <span className="text-[8px] print:text-sm leading-none pt-0.5 opacity-50 print:opacity-80 select-none text-left ml-1 ">
                    MSRP
                  </span>
                  <span className="leading-none print:leading-normal   ">
                    <PriceComponent price={formatCurrency(v.msrp, true)} />
                  </span>
                </div>
              )}
              <div className="flex flex-col  text-right  print:space-x-2   text-sm ">
                {v?.our_price != v?.msrp && (
                  <>
                    <span className="text-[8px] print:text-sm leading-none print:leading-normal pt-0.5 opacity-50 print:opacity-80 select-none text-left ml-1  ">
                      {v.our_price_label}
                    </span>

                    <span className="leading-none   ">
                      <PriceComponent price={determinePrice(v.our_price)} />
                    </span>
                  </>
                )}
              </div>
              {showLocation && (
                <div className="flex flex-col text-left px-1  text-sm">
                  {v?.location && (
                    <span
                      tite={v.location}
                      onClick={() => console.log(parseAddress(v.location))}
                      className="leading-none cursor-pointer truncate text-[8px] print:text-sm print:whitespace-nowrap print:overflow-visible print:text-right "
                    >
                      {parseAddress(v.location)?.name ||
                        parseAddress(v.location)?.value ||
                        ""}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        {activeActionBarId === v?.vin && (
          <ActionBar
            v={v}
            togglePinnedCar={togglePinnedCar}
            isPinned={isPinned}
          />
        )}
      </div>
    );

  if (vehicleListDisplayMode === "list")
    return (
      <div
        className="flex flex-col  w-full items-center  first:mt-0 last:mb-0 "
        onClick={() =>
          setActiveActionBarId(activeActionBarId === v?.vin ? null : v?.vin)
        }
      >
        <div
          className={`w-full max-w-full flex  flex-row print:border-black print:my-1 print:px-2 print:py-1   border border-white hover:bg-white hover:bg-opacity-20 transition-all border-opacity-20 print:border-opacity-100 md:rounded ${
            activeActionBarId === v?.vin
              ? "bg-indigo-800 hover:bg-indigo-600 hover:bg-opacity-100"
              : ""
          }  `}
        >
          <div
            style={backgroundStyle}
            className="w-10 h-[24px] print:w-48 print:h-36  relative  flex-shrink-0 overflow-hidden hover:scale-105 transition-all "
          >
            {showPin && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  togglePinnedCar(v);
                }}
                className="group absolute w-full h-full flex items-center justify-center bg-black bg-opacity-80 hover:bg-slate-800 z-10 text-2xl transition-all"
              >
                <BsPinFill className="group-hover:rotate-45 transition-all" />
              </button>
            )}
            <img
              src={v?.thumbnail}
              alt="car"
              className="w-48 hidden print:block"
            />
          </div>
          <div className="flex flex-row justify-between items-start flex-grow  truncate px-1">
            <div className="flex flex-row flex-shrink w-full  h-full justify-between px-1">
              <div className="flex flex-row items-center gap-1   text-sm">
                <span
                  title={`${v?.year} ${v?.make} ${v?.model} ${v?.trim}`}
                  className="leading-none text-left whitespace-normal  bg-white bg-opacity-0  rounded"
                  // onClick={(e) => {
                  //   e.preventDefault();
                  //   e.stopPropagation();
                  //   navigator.clipboard.writeText(`${v?.year} ${v?.make} ${v?.model} ${v?.trim}`);
                  //   console.log("Copied", v?.link);
                  //   // window.alert("URL Copied!");
                  // }}
                >
                  {`${v?.year} ${v?.make} ${v?.model}`}{" "}
                  <span className="opacity-40">{v?.trim}</span>
                </span>
              </div>

              <div className="flex items-center  justify-between">
                <div className="flex justify-between text-xs w-full ">
                  <div className="text-sm leading-none" title={v?.vin}>
                    {v?.stock}
                    {/* {v?.vin && "#" + } */}
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="flex justify-between text-xs w-full ">
        <div className="text-sm ">{v?.doors}</div>
        <div className="text-xs">{v?.city_mpg} {v?.hw_mpg}</div>
      </div> */}
          </div>

          {showPrice && v?.our_price && (
            <div
              className="flex  flex-col justify-between  flex-shrink-0    px-0.5  print:w-32 pb-1"
              onClick={() =>
                console.log(v?.our_price_label, v?.our_price, v?.msrp)
              }
            >
              {v.msrp != 0 && determinePrice(v?.our_price) !== "Call" && (
                <div className="flex flex-col  print:space-x-2   justify-between text-right  text-sm">
                  <span
                    title="MSRP"
                    className="leading-none print:leading-normal   "
                  >
                    <PriceComponent price={formatCurrency(v.msrp, true)} />
                  </span>
                </div>
              )}
              <div className="flex flex-col  text-right  print:space-x-2   text-sm ">
                {v?.our_price != v?.msrp && (
                  <>
                    <span className="text-[8px] print:text-sm leading-none print:leading-normal pt-0.5 opacity-50 print:opacity-80 select-none text-left ml-1  ">
                      {v.our_price_label}
                    </span>

                    <span className="leading-none   ">
                      <PriceComponent price={determinePrice(v.our_price)} />
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        {activeActionBarId === v?.vin && (
          <ActionBar
            v={v}
            togglePinnedCar={togglePinnedCar}
            isPinned={isPinned}
          />
        )}
      </div>
    );

  return (
    <Link
      to={{
        pathname: `/${v?.stock}`,
        state: v,
      }}
      className="w-2/5 sm:w-1/3 flex-grow-0  md:w-72 max-w-full flex flex-col print:border-none   border border-white hover:bg-white hover:bg-opacity-20 transition-all border-opacity-20 print:border-opacity-0 md:rounded "
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

const togglePinCar = (vehicle) => {
  let pinnedCars = JSON.parse(localStorage.getItem("pinnedCars")) || [];

  if (pinnedCars.some((car) => car.vin === vehicle.vin)) {
    // Unpin if already pinned
    pinnedCars = pinnedCars.filter((car) => car.vin !== vehicle.vin);
  } else {
    // Pin the car
    pinnedCars.push(vehicle);
  }

  localStorage.setItem("pinnedCars", JSON.stringify(pinnedCars));
  // Update state or UI as needed
};

const ActionBar = ({ v, togglePinnedCar, isPinned, ...props }) => {
  const {
    settings: { vehicleListDisplayMode, showPrice, showCarfax },
  } = useSettings();

  const state = useVehicles();

  // console.log(state.filters.api.website);

  return (
    <div className="w-full flex-wrap flex items-center justify-center gap-2 rounded-b-lg lg:rounded border mb-4 print:hidden">
      <ActionButton
        label="Details"
        Icon={MdDirectionsCar}
        to={{
          pathname: `/${v?.stock}`,
          state: v,
        }}
      />
      <ActionButton
        label="Recall"
        Icon={MdNewReleases}
        href={`https://www.nhtsa.gov/recalls?vin=${v?.vin}`}
      />
      {showCarfax && (
        <ActionButton
          label="History"
          Icon={MdOutlineHistory}
          href={`https://www.${state.filters.api.website}/dealer-inspire-inventory/autocheck/?vin=${v?.vin}`}
          // href={`http://www.carfax.com/VehicleHistory/p/Report.cfx?partner=DEY_0&vin=${v?.vin}`}
        />
      )}
      <ActionButton
        label="URL"
        Icon={RxExternalLink}
        href={v?.link}
        disabled={!v?.link}
      />
      <ActionButton
        label="Share"
        Icon={MdShare}
        onClick={() => {
          navigator.clipboard.writeText(v?.link);
          console.log("Copied", v?.link);
          // window.alert("URL Copied!");
        }}
      />
      {/* <ActionButton label="Note" Icon={MdAddCircle} disabled /> */}
      <ActionButton
        label={isPinned ? "Unpin" : "Pin"}
        Icon={BsPinFill}
        onClick={() => {
          togglePinnedCar(v);
        }}
        iconClassName={isPinned ? "rotate-45" : ""}
      />
      <ActionButton
        label="Quote"
        Icon={MdRequestQuote}
        to={{
          pathname: `/quote/${v?.vin}/`,
          search: `?listPrice=${
            v?.msrp && v.msrp > 0 ? v.msrp : v.our_price
          }&sellingPrice=${v?.our_price}`,
          state: { vehicle: v },
        }}
        // state={{ key: "value", ...v }}
      />
      <ActionButton
        label="Take-In"
        Icon={MdFileOpen}
        to={{
          pathname: `/take-in/${v?.vin}/`,
          state: { vehicle: v },
        }}
      />
      {v?.type === "New" ? (
        <ActionButton
          label="Barcode"
          Icon={FaBarcode}
          to={`bar/code/?vin=${v?.vin}`}
        />
      ) : (
        <ActionButton
          label="Buyer's Guide"
          Icon={MdListAlt}
          to={`buyers/guide/?vin=${v?.vin}&year=${v?.year}&make=${
            v?.make
          }&model=${v?.model}&stock=${v?.stock || v?.vin?.slice(-8)}`}
        />
      )}
      {/* <ActionButton label="Hide" Icon={MdVisibilityOff} disabled /> */}
      <CopyDataButton v={v} />
    </div>
  );
};

const ActionButton = ({
  label,
  Icon,
  href,
  iconClassName = "",
  to,
  state,
  ...props
}) => {
  const className =
    "p-0 flex px-2 flex-col hover:bg-white hover:bg-opacity-20 transition-all justify-center items-center disabled:opacity-60 disabled:hover:bg-transparent rounded  min-w-16 py-1";

  const Content = () => (
    <>
      {Icon && <Icon className={`text-2xl ${iconClassName}`} />}{" "}
      <span className="text-xs text-nowrap">{label}</span>
    </>
  );

  if (href)
    return (
      <a href={href} className={className} target="_blank" {...props}>
        <Content />
      </a>
    );

  if (to)
    return (
      <Link to={to} state={state} className={className} {...props}>
        <Content />
      </Link>
    );

  return (
    <button
      type="button"
      onClick={(e) => e.stopPropagation()}
      className={className}
      {...props}
    >
      <Content />
    </button>
  );
};

export const PriceComponent = ({ price }) => {
  const [isCopying, setIsCopying] = React.useState("");

  const handleCopy = (text) => {
    setIsCopying(text);
    navigator.clipboard.writeText(text);
    setTimeout(() => {
      setIsCopying("");
    }, 1000); // Delay of 1 second (1000 milliseconds)
  };

  if (!!isCopying)
    return (
      <div className="bg-lime-500 bg-opacity-60  rounded flex items-center relative">
        <span className="absolute flex bg-lime-500 text-xs rounded px-1 top-4">
          {" "}
          <MdCheck /> Copied
        </span>
        <span> {isCopying}</span>
      </div>
    );

  return (
    <button
      type="button"
      className="flex space-x-1 print:space-x-0 group cursor-copy py-0.5 bg-white bg-opacity-0 hover:bg-opacity-10 rounded px-1"
      onClick={(e) => {
        e.stopPropagation();
        handleCopy(price);
      }}
    >
      {price}
    </button>
  );
};

export const VINComponent = ({ vin, stock }) => {
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
      className="flex space-x-1 print:space-x-0 group cursor-copy"
      onClick={(e) => {
        e.stopPropagation();
        handleCopy(vin);
      }}
    >
      <span className="opacity-30 print:opacity-100 group-hover:opacity-70 transition-all">
        {regularVIN}
      </span>
      <span
        className="opacity-70 print:opacity-100 print:font-bold transition-all group-hover:opacity-100 hover:text-indigo-400 "
        onClick={(e) => {
          e.stopPropagation();
          handleCopy(boldStockNumber);
        }}
      >
        {boldStockNumber}
      </span>
      {boldStockNumber !== stock && (
        <span
          className="opacity-70 text-orange-500 print:opacity-100 print:font-bold transition-all group-hover:opacity-100 hover:text-orange-400 "
          onClick={(e) => {
            e.stopPropagation();
            handleCopy(stock);
          }}
        >
          #{stock}
        </span>
      )}
    </div>
  );
};

export function determinePrice(ourPrice) {
  // Check for undefined or null
  if (ourPrice === undefined || ourPrice === null) {
    return "OTHER";
  }

  // Check if ourPrice is a string that contains 'call'
  if (typeof ourPrice === "string" && ourPrice.toLowerCase().includes("call")) {
    return "Call";
  }

  // Check if ourPrice is a string that can be converted to a number
  const parsedPrice = parseFloat(ourPrice);
  if (!isNaN(parsedPrice)) {
    return formatCurrency(parsedPrice, true);
  }

  // Default case
  return "OTHER";
}


const CopyDataButton = ({ v }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(v, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <ActionButton
      label={copied ? "Copied!" : "Copy Data"}
      Icon={BsClipboard}
      onClick={handleCopy}
    />
  );
};