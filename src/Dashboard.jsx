import React, { useState, useEffect } from "react";
import { VehicleCard } from "./vehicle/VehicleCard";
import useSearchSettings from "./hooks/useSearchSettings";
import useFetchVehicles from "./hooks/useFetchVehicles";
import { FilterPanel } from "./FilterPanel";
import { AppBar } from "./Appbar";
import { SettingsPanel } from "./SettingsPanel";
import { useSettings } from "./SettingsContext";
import { useVehicles } from "./VehicleContext";

export const Dashboard = () => {
  const [settings, updateSettings] = useSearchSettings();
  const [isSettingsOpen, setSettingsOpen] = React.useState(false);
  const [isFilterPanelOpen, setFilterPanelOpen] = React.useState(true);
  const [activeActionBarId, setActiveActionBarId] = React.useState(null);
  // const { vehicles, isLoading, total, facets, facetsStats, defaultTotal, defaultFacets, defaultFacetsStats } =
  //   useFetchVehicles(settings);

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
  } = useVehicles();

  let displayClass = "";
  if (vehicleListDisplayMode === "grid")
    displayClass = "flex-row sm:flex-row gap-2 justify-center flex-wrap md:space-y-0 md:px-4";
  if (vehicleListDisplayMode === "list") displayClass = "flex-col";

  return (
    <div className="relative w-full overflow-y-scroll max-h-screen  ">
      <AppBar
        setQuery={(val) => updateSettings("QUERY", val)}
        query={filters.query}
        setSettingsOpen={setSettingsOpen}
        settingsOpen={isSettingsOpen}
        setFilterPanelOpen={setFilterPanelOpen}
        filterPanelOpen={isFilterPanelOpen}
        // total={total}
      />
      {/* <pre className="text-xs">
          <code>{JSON.stringify(filters, null, 1)}</code>
        </pre> */}

      <div className={`container mx-auto overflow-hidden transition-all duration-500 ease-in-out ${isFilterPanelOpen ? "h-8" : "h-0"} `}>
        {isFilterPanelOpen && (
          <FilterPanel
            // facets={facets}
            // facetsStats={facetsStats}
            // total={total}
            // defaultFacets={defaultFacets}
            // defaultFacetsStats={defaultFacetsStats}
            // defaultTotal={defaultTotal}
            setFilterPanelOpen={setFilterPanelOpen}
            // settings={settings}
            // updateSettings={updateSettings}
          />
        )}
      </div>

      <div className="flex flex-col  container mx-auto   lg:flex-row items-start lg:px-2">
        {(isSettingsOpen || isFilterPanelOpen) && (
          <div
            className={`flex   w-full lg:w-96 mr-4   flex-col transition-all duration-200 ease-in-out ${
              isFilterPanelOpen || isSettingsOpen ? "h-full" : "h-0"
            } overflow-hidden`}
          >
            {isSettingsOpen && <SettingsPanel setSettingsOpen={setSettingsOpen} />}
          </div>
        )}

        {status === "loading" ? (
          <p className="mx-auto">Loading...</p>
        ) : status === "error" ? (
          <p>Error: {error.message}</p>
        ) : (
          <div className={`container h-full flex-grow-0 mx-auto flex items-start transition-all   ${displayClass}`}>
            {data.pages.map((group, i) => (
              <React.Fragment key={i}>
                {group.hits.map((v) => (
                  <VehicleCard
                    num={i}
                    key={v?.stock || i}
                    v={v}
                    activeActionBarId={activeActionBarId}
                    setActiveActionBarId={setActiveActionBarId}
                  />
                  // <VehicleCard num={i} key={v?.vin || i} v={v} />
                ))}
              </React.Fragment>
            ))}
            <div className="py-5 flex items-center justify-center w-full">
              <button
                className="w-full text-center  py-2  transition-all opacity-30"
                onClick={() => fetchNextPage()}
                disabled={!hasNextPage || isFetchingNextPage}
              >
                {isFetchingNextPage ? "Loading more..." : hasNextPage ? "Load More" : "Nothing more to load"}
              </button>
            </div>
            <div ref={loadMoreRef}></div>
            <div>{isFetching && !isFetchingNextPage ? "Fetching..." : null}</div>
          </div>
        )}

        {/* <div className={`container flex-grow-0 mx-auto flex items-start transition-all   ${displayClass}`}>
          {isLoading && <div>Loading....</div>}
          {vehicles.map((r, i) => (
            <VehicleCard
              num={i}
              key={r?.stock || i}
              v={r}
              activeActionBarId={activeActionBarId}
              setActiveActionBarId={setActiveActionBarId}
            />
          ))}
        </div> */}
      </div>
    </div>
  );
};
