import React from "react";
import { MdClear, MdFilterList, MdSearch } from "react-icons/md";
export const AppBar = ({ setQuery, query, settingsOpen, setSettingsOpen }) => {
  function handleChange(event) {
    setQuery(event.target.value);
  }

  return (
    <>
      <div className="flex ">
        <div className="border flex-grow m-2 md:m-4 rounded-lg focus-within:outline-2 focus-within:bg-white focus-within:bg-opacity-20  border-white border-opacity-25 flex items-center space-x-2 text-xl px-2">
          <MdSearch />
          <input
            className="bg-transparent px-2 py-1 w-full outline-none"
            value={query}
            onChange={handleChange}
            placeholder="Search Inventory...."
          />
          {query.length > 0 && (
            <button
              className="border rounded-full p-0.5 bg-white bg-opacity-0 hover:bg-opacity-20 transition-all"
              onClick={() => setQuery("")}
            >
              <MdClear />
            </button>
          )}
        </div>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setSettingsOpen((v) => !v)}
            className="border rounded-full p-1 text-2xl mr-3 ml-1 bg-white border-opacity-20 opacity-80 border-white bg-opacity-0 hover:bg-opacity-20 transition-all"
          >
            <MdFilterList />
          </button>
        </div>
      </div>
    </>
  );
};
