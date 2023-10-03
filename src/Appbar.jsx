import React from "react";
import { MdBugReport, MdClear, MdFilterList, MdGridView, MdList, MdSearch, MdSettings } from "react-icons/md";
import { Link } from "react-router-dom";
import { useVehicles } from "./VehicleContext";
export const AppBar = ({
  setQuery,
  query,
  total,
  settingsOpen,
  setSettingsOpen,
  setFilterPanelOpen,
  filterPanelOpen,
}) => {
  const { filters, updateQuery } = useVehicles();

  function handleChange(event) {
    // setQuery(event.target.value);
    updateQuery(event.target.value);
  }

  return (
    <div className="bg-blue-800 bg-opacity-20 mb-2">
      <div className="flex container   mx-auto ">
        <div className="border  flex-grow m-2 md:m-2 rounded-lg focus-within:outline-2 focus-within:bg-white focus-within:bg-opacity-20  border-white border-opacity-25 flex items-center space-x-2 text-xl px-2">
          <div className="flex relative  justify-center items-cetner">
            <MdSearch />
            <span className="absolute leading-none text-[8px] h-3 flex p-0.5  -right-2 -top-1 bg-blue-700  rounded">
              {total}
            </span>
          </div>
          <input
            className="bg-transparent px-2 py-1 w-full outline-none"
            value={filters.query}
            onChange={handleChange}
            placeholder="Search Inventory...."
          />
          {filters.query.length > 0 && (
            <button
              className="border rounded-full p-0.5 bg-white bg-opacity-0 hover:bg-opacity-20 transition-all"
              onClick={() => {
                // setQuery("");
                updateQuery("");
              }}
            >
              <MdClear />
            </button>
          )}
        </div>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setFilterPanelOpen((v) => !v)}
            className="border rounded-full p-1 text-2xl mr-3 ml-1 bg-white border-opacity-20 opacity-80 border-white bg-opacity-0 hover:bg-opacity-20 transition-all"
          >
            <MdFilterList />
          </button>
          {/* <Link
            to="/dev/test"
            type="button"
            className="border rounded-full p-1 text-2xl mr-3 ml-1 bg-white border-opacity-20 opacity-80 border-white bg-opacity-0 hover:bg-opacity-20 transition-all"
          >
            <MdList />
          </Link> */}
          <button
            type="button"
            onClick={() => setSettingsOpen((v) => !v)}
            className="border rounded-full p-1 text-2xl mr-3 ml-1 bg-white border-opacity-20 opacity-80 border-white bg-opacity-0 hover:bg-opacity-20 transition-all"
          >
            <MdSettings />
          </button>
        </div>
      </div>
    </div>
  );
};
