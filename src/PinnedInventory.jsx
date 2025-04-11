import React from "react";
import { VehicleCard } from "./vehicle/VehicleCard";
import {
  MdDeleteForever,
  MdKeyboardArrowUp,
  MdMinimize,
  MdListAlt,
  MdPrint,
} from "react-icons/md";
import { Link } from "react-router-dom";

export const PinnedInventory = ({
  pinnedCars,
  setPinnedCars,
  addPinnedCar,
  removePinnedCar,
  clearPinnedCars,
  togglePinnedCar,
  activeActionBarId,
  setActiveActionBarId,
  showPin,
}) => {
  const [isOpen, setOpen] = React.useState(true);

  if (pinnedCars.length === 0) return <></>;

  return (
    <>
      <style>
        {`
          @media print {
  body * {
    visibility: hidden;
  }
  #printable, #printable * {
    visibility: visible;
    color: black;
    background: white !important;
  }
  #printable {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    padding: 1rem;
  }
  #printable > div {
    margin-bottom: 1rem;
    page-break-inside: avoid;
    border: 1px solid black;
    padding: 0.75rem;
  }
  img {
    max-width: 100%;
    height: auto;
    page-break-inside: avoid;
  }
}
        `}
      </style>
      <div className="w-full my-2 rounded border border-opacity-20 border-white transition-all bg-slate-300 bg-opacity-10">
        <div className="flex items-center justify-between  text-xs select-none">
          <div
            onClick={() => setOpen((v) => !v)}
            className="flex justify-between px-2 py-1 flex-grow transition-all bg-white bg-opacity-0 hover:bg-opacity-20 rounded cursor-pointer"
          >
            <h2 className="  ">Pinned Cars ({pinnedCars.length})</h2>
            <div className="flex space-x-2 items-center">
              <MdKeyboardArrowUp
                className={`transition-all ${isOpen ? "" : " rotate-180"}`}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 px-2">
            <Link
              to={{
                pathname: "/buyers/guide",
                state: pinnedCars, // Your state object here
              }}
              className="flex space-x-1 items-center  px-2 py-1 transition-all bg-white bg-opacity-0 hover:bg-opacity-20 rounded cursor-pointer"
            >
              {" "}
              <MdListAlt /> <span>Buyers guides</span>
            </Link>
            <button
              onClick={() => window.print()}
              className="flex space-x-1 items-center  px-2 py-1 transition-all bg-white bg-opacity-0 hover:bg-opacity-20 rounded cursor-pointer"
            >
              {" "}
              <MdPrint /> <span>Print</span>
            </button>
            <button
              onClick={() => clearPinnedCars()}
              className="flex space-x-1 items-center px-2 py-1 transition-all bg-white bg-opacity-0 hover:bg-opacity-20 rounded cursor-pointer"
            >
              {" "}
              <MdDeleteForever /> <span>Clear</span>
            </button>
          </div>
        </div>
        <div id="printable" className="flex flex-col gap-0">
          {isOpen &&
            pinnedCars.map((v, i) => (
              <VehicleCard
                num={i}
                key={v?.stock || i}
                v={v}
                activeActionBarId={activeActionBarId}
                setActiveActionBarId={setActiveActionBarId}
                togglePinnedCar={togglePinnedCar}
                isPinned={true}
                showPin={showPin}
              />
            ))}
        </div>
      </div>
    </>
  );
};
