import React, { useState, useEffect } from "react";
import { VehicleCard } from "./vehicle/VehicleCard";
import useSearchSettings from "./hooks/useSearchSettings";
import useFetchVehicles from "./hooks/useFetchVehicles";
import { FilterPanel } from "./FilterPanel";
import { AppBar } from "./Appbar";
import { SettingsPanel } from "./SettingsPanel";
import { useSettings } from "./SettingsContext";
import { useVehicles } from "./VehicleContext";
import { PinnedInventory } from "./PinnedInventory";
import useLocalStorage from "./useLocalStorage";
import { PriceChip } from "./PriceChip";

export const Dashboard = () => {
  const [settings, updateSettings] = useSearchSettings();
  const [isSettingsOpen, setSettingsOpen] = React.useState(false);
  const [isFilterPanelOpen, setFilterPanelOpen] = React.useState(true);
  const [activeActionBarId, setActiveActionBarId] = React.useState(null);
  const [showPin, setShowPin] = useState(false);
  // const { vehicles, isLoading, total, facets, facetsStats, defaultTotal, defaultFacets, defaultFacetsStats } =
  //   useFetchVehicles(settings);

  const [pinnedCars, setPinnedCars, addPinnedCar, removePinnedCar, clearPinnedCars, togglePinnedCar] = useLocalStorage(
    "pinnedCars",
    [],
    "vin"
  );

  const {
    settings: { vehicleListDisplayMode, showPrice, showCarfax },
  } = useSettings();

  const {
    filters,
    updateFilters,
    filtersDispatch,
    data,
    error,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    loadMoreRef,
    updateQuery,
    fetchNextPage,
    defaultFacets,
    defaultFacetsStats,
  } = useVehicles();

  const handleKeyDown = (e) => {
    if (e.ctrlKey) {
      setShowPin(true);
    }
  };

  const handleKeyUp = (e) => {
    if (!e.ctrlKey) {
      setShowPin(false);
    }
  };

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  let displayClass = "";
  if (vehicleListDisplayMode === "grid")
    displayClass = "flex-row sm:flex-row gap-2 justify-center flex-wrap md:space-y-0 md:px-4";
  if (vehicleListDisplayMode === "list") displayClass = "flex-col";

  return (
    <div className="relative w-full  ">
      <AppBar
        setQuery={(val) => updateSettings("QUERY", val)}
        query={filters.query}
        setSettingsOpen={setSettingsOpen}
        settingsOpen={isSettingsOpen}
        setFilterPanelOpen={setFilterPanelOpen}
        filterPanelOpen={isFilterPanelOpen}
      />
      {/* <pre className="text-xs">
          <code>{JSON.stringify(filters, null, 1)}</code>
        </pre> */}

      {(isSettingsOpen || isFilterPanelOpen) && (
        <div
          className={`flex absolute z-50  w-full lg:w-96 mr-4 print:hidden  flex-col transition-all duration-200 ease-in-out ${
            isFilterPanelOpen || isSettingsOpen ? "h-full" : "h-0"
          } overflow-hidden`}
        >
          {isSettingsOpen && <SettingsPanel setSettingsOpen={setSettingsOpen} />}
        </div>
      )}
      <div className="flex flex-col  container mx-auto   lg:flex-row items-start lg:px-2 lg:space-x-10">
        <div className="flex container mx-auto items-start transition-all ">
          <PinnedInventory
            {...{
              pinnedCars,
              setPinnedCars,
              addPinnedCar,
              removePinnedCar,
              clearPinnedCars,
              togglePinnedCar,
              activeActionBarId,
              setActiveActionBarId,
              showPin,
            }}
          />
        </div>

        {status === "loading" ? (
          <p className="mx-auto">Loading...</p>
        ) : status === "error" ? (
          <p>Error: {error.message}</p>
        ) : (
          <div
            className={`container print:hidden flex-grow-0 mx-auto flex items-start transition-all   ${displayClass}`}
          >
            <div>
              <PriceChip />
            </div>
            {data.pages.map((group, i) => (
              <React.Fragment key={i}>
                {filterSearchResults(pinnedCars, group.hits).map((v) => (
                  <VehicleCard
                    num={i}
                    key={v?.stock || i}
                    v={v}
                    activeActionBarId={activeActionBarId}
                    setActiveActionBarId={setActiveActionBarId}
                    togglePinnedCar={togglePinnedCar}
                    showPin={showPin}
                  />
                ))}
              </React.Fragment>
            ))}
            <div className="print:hidden">
              <button onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>
                {isFetchingNextPage ? "Loading more..." : hasNextPage ? "Load More" : "Nothing more to load"}
              </button>
            </div>
            <div ref={loadMoreRef}></div>
            <div>{isFetching && !isFetchingNextPage ? "Fetching..." : null}</div>
          </div>
        )}
      </div>
    </div>
  );
};

const filterSearchResults = (pinnedCars, searchResults) => {
  return searchResults.filter((car) => !pinnedCars.some((pinnedCar) => pinnedCar.vin === car.vin));
};
