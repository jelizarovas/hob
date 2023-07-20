import React from "react";
import {
  MdFilterAlt,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowUp,
  MdOutlineFilterAlt,
  MdOutlineFilterAltOff,
  MdSort,
} from "react-icons/md";

const labelx = "Make";

const datax = {
  Acura: 2,
  Audi: 3,
  BMW: 9,
  Cadillac: 3,
  Chevrolet: 11,
  Chrysler: 2,
  Dodge: 2,
  Ford: 11,
  GMC: 1,
  Honda: 38,
  Hyundai: 1,
  Jeep: 10,
  Kia: 6,
  "Land Rover": 1,
  Lexus: 2,
  Mazda: 2,
  "Mercedes-Benz": 4,
  Mitsubishi: 1,
  Nissan: 10,
  Ram: 1,
  Scion: 1,
  Subaru: 8,
  Tesla: 2,
  Toyota: 13,
  Volkswagen: 4,
};
const currentDatax = {
  Acura: 2,
  Audi: 3,
  BMW: 9,
  Cadillac: 3,
  Chevrolet: 11,
  Chrysler: 2,
  Dodge: 2,
  Ford: 11,
  GMC: 1,
  Honda: 38,
  Hyundai: 1,
  Jeep: 10,
  Kia: 6,
  "Land Rover": 1,
  Lexus: 2,
  Mazda: 2,
  "Mercedes-Benz": 4,
  Mitsubishi: 1,
  Nissan: 10,
  Ram: 1,
  Scion: 1,
  Subaru: 8,
  Tesla: 2,
  Toyota: 13,
  Volkswagen: 4,
};

export const FilterListSelection = ({
  label = labelx,
  data = datax,
  currentData = currentDatax,
  onChange,
}) => {
  const [isOpen, setOpen] = React.useState(true);
  const [showAll, setShowAll] = React.useState(false);
  const [sortBy, setSortBy] = React.useState(true); //true - alphabetically, false - by count
  const isFiltered = false;

  const dataArray = Object.entries(currentData).sort(sortByCount);
  console.log({ data, currentData });
  return (
    <div className="w-64">
      <label
        className="px-2 flex items-center justify-between select-none hover:bg-white rounded hover:bg-opacity-10 cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center space-x-1">
          {!isOpen ? (
            <MdFilterAlt className={isFiltered ? "" : "opacity-5"} />
          ) : (
            <MdOutlineFilterAltOff className={isFiltered ? "" : "opacity-5"} />
          )}

          <span className="uppercase text-xs p-1"> {label}</span>
        </div>
        <div className="flex items-center space-x-4">
          {isOpen && <MdSort />}
          <MdKeyboardArrowRight
            className={`transition-all ${isOpen ? "rotate-90" : ""}`}
          />
        </div>
      </label>
      {isOpen && (
        <ul className="text-xs leading-2 px-4">
          {data &&
            dataArray
              .slice(0, showAll ? dataArray.length : 5)
              .map(([key, value], i) => (
                <li
                  key={i}
                  className="relative space-x-2 flex items-center justify-between hover:bg-gradient-to-r hover:from-[rgba(100,100,100,30)]  hover:to-transparent  cursor-pointer group/li"
                >
                  <label className="space-x-2 flex items-center flex-grow cursor-pointer">
                    <Checkbox />
                    {key.replace("<br/>", ", ")}
                  </label>
                  <span className=" rounded group/span relative flex px-2 hover:bg-[rgba(100,100,100,30)] ">
                    {data?.[key] || 0}{" "}
                    {/* <span className="absolute right-9 hidden group-hover/span:block">
                      Only
                    </span> */}
                    {/* <span className="opacity-0  group-hover:opacity-80 ">
                      / {value}
                    </span> */}
                  </span>{" "}
                </li>
              ))}
          {dataArray.length >= 5 && (
            <button
              className="w-full flex justify-center hover:bg-white hover:bg-opacity-5 py-1"
              onClick={() => setShowAll((v) => !v)}
            >
              {" "}
              <MdKeyboardDoubleArrowUp
                className={`transition-all ${
                  showAll ? "rotate-0" : "rotate-180"
                }`}
              />
            </button>
          )}
        </ul>
      )}
    </div>
  );
};

const Checkbox = () => {
  return <input type="checkbox" className="ml-1 my-0.5" />;
};

const sortByCount = (a, b) => {
  if (a[1] < b[1]) {
    return 1; // Sort in descending order
  } else if (a[1] > b[1]) {
    return -1; // Sort in descending order
  }
  return 0;
};

//bg-gradient-to-r from-slate-50 via-violet-600 to-indigo-600
