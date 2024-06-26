import React from "react";
import {
  MdApps,
  MdBugReport,
  MdClear,
  MdFilterList,
  MdGridView,
  MdKeyboardAlt,
  MdKeyboardArrowUp,
  MdList,
  MdMenu,
  MdSearch,
  MdSettings,
} from "react-icons/md";
import { useVehicles } from "./VehicleContext";
import { FilterPanel } from "./FilterPanel";
import { Link, useHistory } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

export const AppBar = ({
  settingsOpen,
  setSettingsOpen,
  setFilterPanelOpen,
  filterPanelOpen,
}) => {
  const { filters, data, updateQuery, defaultFacets, defaultFacetsStats } =
    useVehicles();

  const [isAccountMenuOpen, setAccountMenuOpen] = React.useState(false);
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

  return (
    <div className=" bg-opacity-20 mb-2 md:mb-0">
      <div className="flex flex-col lg:flex-row container  items-center mx-auto ">
        <div className="flex flex-row-reverse md:flex-row pt-1 items-center w-full">
          {currentUser && (
            <div className="relative px-2">
              <button
                className="flex items-center space-x-2 text-white"
                onClick={() => setAccountMenuOpen((v) => !v)}
              >
                {/* <img
                  src={currentUser.photoURL || "/default-avatar.png"}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                /> */}
                <span className="uppercase bg-lime-700 rounded-full text-[10px] w-6 h-6  flex items-center justify-center transition-all hover:bg-lime-500">
                  {currentUser.email.slice(0, 2) || "User"}
                </span>
              </button>
              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden">
                  <Link
                    to="/account/"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Account
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          <AppBarButton
            toggle={setSettingsOpen}
            Icon={MdMenu}
            isActive={settingsOpen}
          />
          <div className="border w-full  flex-grow m-2 md:m-2 rounded-lg focus-within:outline-2 focus-within:hover:bg-opacity-30 focus-within:bg-opacity-20 hover:bg-opacity-5 bg-white bg-opacity-0 border-white border-opacity-25 flex items-center space-x-2 text-xl px-2">
            <div className="flex relative  justify-center items-cetner">
              <MdSearch />
              <span className="absolute leading-none text-[8px] h-3 flex p-0.5  -right-1 -top-1 bg-blue-700  rounded">
                {data?.pages?.[0]?.nbHits || 0}
              </span>
            </div>
            <input
              className="bg-transparent text-sm px-2 py-1 w-full outline-none"
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
      className={` group relative rounded-full p-1 text-lg mr-3 ml-1 bg-white border-opacity-20  border-white  hover:bg-opacity-20 transition-all ${
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
