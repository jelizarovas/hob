import React from "react";

import {
  MdBusinessCenter,
  MdClear,
  MdKeyboardArrowDown,
  MdSearch,
} from "react-icons/md";

import { useVehicles } from "./VehicleContext";
import { FilterPanel } from "./FilterPanel";
import { Link } from "react-router-dom";

import { DropDown } from "./components/Dropdown";
import { MenuButton } from "./MenuButton";

export const AppBar = ({
  settingsOpen,
  setSettingsOpen,
  setFilterPanelOpen,
  filterPanelOpen,
}) => {
  const {
    filters,
    data,
    updateQuery,
    defaultFacets,
    defaultFacetsStats,
    filtersDispatch,
    // updateFilters,
  } = useVehicles();

  function handleChange(event) {
    updateQuery(event.target.value);
  }

  // const handleTypeChange = (option, value) => {
  //   updateFilters({ type: { ...filters.type, [option]: !value } });
  // };

  const stores = {
    popperPlacement: "bottom-end",
    options: [
      {
        label: "Honda of Burien",
        Icon: MdBusinessCenter,
        onClick: () =>
          filtersDispatch({ type: "UPDATE_API", payload: "hofbAPI" }),
      },
      {
        label: "All Rairdon Stores",
        Icon: MdBusinessCenter,
        onClick: () =>
          filtersDispatch({ type: "UPDATE_API", payload: "rairdonAPI" }),
      },
      {
        label: "Subaru of Auburn",
        Icon: MdBusinessCenter,
        onClick: () =>
          filtersDispatch({ type: "UPDATE_API", payload: "sofaAPI" }),
      },
    ],
    renderItem: ({ label, Icon, ...props }) => (
      <div
        className="min-w-32 w-full flex   items-center space-x-2 px-4 py-1 bg-black hover:bg-slate-900 text-white"
        {...props}
      >
        {Icon && <Icon />} <span>{label}</span>
      </div>
    ),
    renderButton: ({ isOpen, open, close, props }) => (
      <button
        onClick={isOpen ? close : open}
        {...props}
        className="px-1 text-sm py-2 rounded bg-white bg-opacity-0 hover:bg-opacity-5 text-opacity-50 text-white mx-1"
      >
        <MdKeyboardArrowDown />
      </button>
    ),
    onSelect: console.log,
    disableSearch: true,
  };

  // const vehicleTypes = {
  //   popperPlacement: "bottom-end",
  //   options: [
  //     { label: "New", bg: "bg-indigo-900", value: "new" },
  //     { label: "Certified", bg: "bg-purple-900", value: "certifiedUsed" },
  //     { label: "Used", bg: "bg-orange-900", value: "used" },
  //   ],
  //   renderItem: ({ label, value, bg, ...props }) => (
  //     <div
  //       className="min-w-32 w-full flex   items-center space-x-2 px-2 py-1 bg-black hover:bg-slate-900 text-white"
  //       {...props}
  //     >
  //       {filters.type[value] ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}{" "}
  //       <span>{label}</span>
  //     </div>
  //   ),
  //   renderButton: ({ isOpen, open, close, props }) => (
  //     <AppBarButton
  //       {...props}
  //       Icon={MdCategory}
  //       label="Types"
  //       onClick={isOpen ? close : open}
  //       isActive={isOpen}
  //     />
  //   ),
  //   onSelect: ({ value }) => handleTypeChange(value, filters.type[value]),
  //   disableSearch: true,
  // };

  // const sortTypes = {
  //   popperPlacement: "bottom-end",
  //   options: [
  //     ...filters.api.indexes,
  //     { label: "Age ⬆️", value: "DESC" },
  //     { label: "Age ⬇️", value: "ASC" },
  //   ], // label, index
  //   renderItem: ({ label, index, ...props }) => (
  //     <div
  //       className="min-w-32 w-full flex   items-center space-x-2 px-2 py-1 bg-black hover:bg-slate-900 text-white"
  //       {...props}
  //     >
  //       <span>{label}</span>
  //     </div>
  //   ),
  //   renderButton: ({ isOpen, open, close, props }) => (
  //     <AppBarButton
  //       {...props}
  //       Icon={MdSort}
  //       onClick={isOpen ? close : open}
  //       isActive={isOpen}
  //       label="Sort"
  //     />
  //   ),
  //   onSelect: ({ index, value }) => {
  //     if (value)
  //       return filtersDispatch({ type: "SORT_BY_AGE", payload: value });
  //     if (index)
  //       return filtersDispatch({
  //         type: "UPDATE_INDEX",
  //         payload: index,
  //       });
  //   },
  //   disableSearch: true,
  // };

  return (
    <div className="   w-full bottom-0 bg-opacity-100 px-2  md:mb-0">
      <div className="flex flex-col  max-w-[480px] bg-black rounded items-center mx-auto ">
        <div className=" flex mb-0.5  pt-1 items-center w-full">
          <div className="flex items-center justify-center">
            <Link
              to="/"
              className={`text-xs pl-4 pr-0 py-2 ${
                filters.api.name !== "HOFB"
                  ? `text-red-500 bg-opacity-90 hover:bg-opacity-100`
                  : "text-blue-500 bg-opacity-90 hover:bg-opacity-100"
              } font-mono font-bold`}
            >
              {filters.api.name}
            </Link>
            <div className="relative">
              <DropDown {...stores} />
            </div>
          </div>

          <div className=" w-full  flex-grow  my-0.5 rounded-lg focus-within:outline-2 focus-within:hover:bg-opacity-30 focus-within:bg-opacity-20 hover:bg-opacity-5 bg-white bg-opacity-0 border-white border-0 border-opacity-25 flex items-center space-x-2 text-md px-2">
            <div className="flex relative  justify-center items-cetner">
              <MdSearch />
              {filters.query.length > 0 && (
                <span className="absolute leading-none text-[9px] h-3 flex p-0.5  -right-1 -top-1 bg-slate-700  rounded">
                  {data?.pages?.[0]?.nbHits || 0}
                </span>
              )}
            </div>
            <input
              className="bg-transparent text-sm px-1 py-1  w-full outline-none"
              value={filters.query}
              onChange={handleChange}
              placeholder={`Search ${getType(filters)}${
                data?.pages?.[0]?.nbHits ? ` (${data.pages[0].nbHits})` : ""
              } Inventory....`}
            />
            {filters.query.length > 0 && (
              <button
                className=" rounded-full p-0.5 bg-white bg-opacity-0 hover:bg-opacity-20 transition-all"
                onClick={() => updateQuery("")}
              >
                <MdClear />
              </button>
            )}
          </div>
          {/* <div
        className={`container mx-auto print:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          filterPanelOpen ? "h-8" : "h-0"
        } `}
      > */}

          <MenuButton />
        </div>

        {filterPanelOpen && (
          <FilterPanel
            // facets={facets}
            // facetsStats={facetsStats}
            // total={total}
            defaultFacets={defaultFacets}
            defaultFacetsStats={defaultFacetsStats}
            // defaultTotal={defaultTotal}
            setFilterPanelOpen={setFilterPanelOpen}
            // settings={settings}

            settingsOpen={settingsOpen}
            setSettingsOpen={setSettingsOpen}
            // updateSettings={updateSettings}
          />
        )}
        {/* <Link
            to="/dev/test"
            type="button"
            className="border rounded-full p-1 text-2xl mr-3 ml-1 bg-white border-opacity-20 opacity-80 border-white bg-opacity-0 hover:bg-opacity-20 transition-all"
          >
            <MdList />
          </Link> */}
        {/* <AppBarButton
            toggle={setFilterPanelOpen}
            Icon={MdFilterList}
            isActive={filterPanelOpen}
          /> */}
      </div>
    </div>
  );
};

function getType(filters) {
  const { new: isNew, certifiedUsed, used } = filters.type;

  if (isNew && certifiedUsed && used) {
    return "All";
  } else if (!isNew && certifiedUsed && used) {
    return "All Used";
  } else if (isNew && !certifiedUsed && !used) {
    return "New";
  } else if (!isNew && certifiedUsed && !used) {
    return "Certified";
  } else if (!isNew && !certifiedUsed && used) {
    return "Used";
  } else if (isNew && certifiedUsed && !used) {
    return "New & Certified";
  } else if (isNew && !certifiedUsed && used) {
    return "New & Used (CPO excluded)";
  } else {
    return "All"; // or any default value you wish to return if none of the above conditions are met
  }
}
