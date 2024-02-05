import React from "react";
import { VehicleCard } from "./vehicle/VehicleCard";
import { MdDeleteForever, MdKeyboardArrowUp, MdMinimize, MdListAlt, MdPrint } from "react-icons/md";
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
              color: black; /* Make all text black */
              background: white !important; /* Change background to white */
            }
            #printable {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            img {
                page-break-inside: avoid; /* Avoid breaking images */
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
              <MdKeyboardArrowUp className={`transition-all ${isOpen ? "" : " rotate-180"}`} />
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
        <div id="printable">
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
              />
            ))}
        </div>
      </div>
    </>
  );
};
