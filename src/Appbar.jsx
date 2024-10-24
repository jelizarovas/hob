import React from "react";
import {
  MdApps,
  MdBugReport,
  MdClear,
  MdDeleteForever,
  MdFilter,
  MdFilterAlt,
  MdFilterList,
  MdGridView,
  MdKeyboardAlt,
  MdKeyboardArrowUp,
  MdList,
  MdLogout,
  MdMenu,
  MdPerson,
  MdPin,
  MdSearch,
  MdSettings,
  MdVerifiedUser,
} from "react-icons/md";
import { FaFilePdf } from "react-icons/fa6";

import { useVehicles } from "./VehicleContext";
import { FilterPanel } from "./FilterPanel";
import { Link, useHistory } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { DropDown } from "./components/Dropdown";

export const AppBar = ({
  settingsOpen,
  setSettingsOpen,
  setFilterPanelOpen,
  filterPanelOpen,
}) => {
  const { filters, data, updateQuery, defaultFacets, defaultFacetsStats } =
    useVehicles();

  const { currentUser } = useAuth();
  const history = useHistory();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      history.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  function handleChange(event) {
    updateQuery(event.target.value);
  }

  const dd = {
    popperPlacement: "bottom-end",
    options: [
      {
        label: "Account",
        Icon: MdPerson,
        onClick: (e) => history.push("/account"),
      },
      {
        label: "Take-In Sheet",
        Icon: FaFilePdf,
        onClick: (e) =>
          window.open(
            "pdf/Take-in Sheet Form.pdf",
            "_blank",
            "noopener,noreferrer"
          ),
      },
      {
        label: "Check Request",
        Icon: FaFilePdf,
        onClick: (e) => history.push("/check/req"),
      },
      {
        label: "Buyers Guide",
        Icon: FaFilePdf,
        onClick: (e) => history.push("/buyers/guide/"),
      },
      {
        label: "Barcode",
        Icon: FaFilePdf,
        onClick: (e) => history.push("/bar/code/"),
      },
      {
        label: "Log Out",
        Icon: MdLogout,
        onClick: handleLogout,
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
        className={`mx-2 flex flex-nowrap items-center justify-center group text-center   space-x-2    ${
          isOpen ? "ring-blue-100 ring-0" : ""
        } ring-blue-300 focus:ring-0  transition-all bg-opacity-0 bg-black hover:bg-opacity-5  select-none   `}
      >
        {/* <img
          src={currentUser.photoURL || "/default-avatar.png"}
          alt="avatar"
          className="w-8 h-8 rounded-full"
        /> */}
        <span
          className={`ring-slate-300 focus:ring-1  ${
            isOpen ? "ring-slate-100 ring-1" : ""
          } uppercase bg-gray-800 rounded-lg text-[10px] w-7 h-7  flex items-center justify-center transition-all hover:bg-slate-500`}
        >
          {currentUser.email.slice(0, 2) || "User"}
        </span>
      </button>
    ),
    onSelect: console.log,
    disableSearch: true,
  };

  return (
    <div className=" bg-opacity-20 px-2 mb-2 md:mb-0">
      <div className="flex flex-col lg:flex-row container  items-center mx-auto ">
        <div className="flex flex-row-reverse md:flex-row pt-1 items-center w-full">
          {currentUser && (
            <div className="relative">
              <DropDown {...dd} />
            </div>
          )}

          <AppBarButton
            toggle={setSettingsOpen}
            Icon={MdFilterAlt}
            isActive={settingsOpen}
          />
          <div className=" w-full  flex-grow my-0.5 md:m-2 rounded-lg focus-within:outline-2 focus-within:hover:bg-opacity-30 focus-within:bg-opacity-20 hover:bg-opacity-5 bg-white bg-opacity-0 border-white border-0 border-opacity-25 flex items-center space-x-2 text-xl px-2">
            <div className="flex relative  justify-center items-cetner">
              <MdSearch />
              <span className="absolute leading-none text-[9px] h-3 flex p-0.5  -right-1 -top-1 bg-slate-700  rounded">
                {data?.pages?.[0]?.nbHits || 0}
              </span>
            </div>
            <input
              className="bg-transparent text-sm px-2 py-2 w-full outline-none"
              value={filters.query}
              onChange={handleChange}
              placeholder={`Search ${getType(filters)} Inventory....`}
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
      <Link to="/" className="text-sm px-4 py-2 text-blue-600 font-mono font-bold">HOFB</Link>
        </div>

        {/* </div> */}
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

const AppBarButton = ({ Icon, toggle, isActive, ...props }) => {
  return (
    <button
      type="button"
      onClick={() => toggle((v) => !v)}
      className={` group relative rounded-lg p-1 text-lg  bg-white border-opacity-20  border-white  hover:bg-opacity-20 transition-all ${
        isActive
          ? "bg-opacity-80 text-black hover:text-white"
          : "bg-opacity-0 text-white"
      } `}
    >
      {isActive ? <Icon /> : <Icon />}
      {/* {isActive && <span className="absolute -top-1 text-sm -right-1 p-0 bg-green-500 bg-opacity-100 text-green-800  rounded-full "><MdClear /></span>} */}
      {/* {isActive && (
        <span className="absolute -bottom-1 text-sm -right-1 p-0 bg-white bg-opacity-100 text-green-800  rounded-full ">
          <MdKeyboardArrowUp />
        </span>
      )} */}
    </button>
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
