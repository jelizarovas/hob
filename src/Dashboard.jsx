import React, { useState, useEffect } from "react";
import { VehicleCard } from "./vehicle/VehicleCard";
import useSearchSettings from "./hooks/useSearchSettings";
import useFetchVehicles from "./hooks/useFetchVehicles";
import { FilterPanel } from "./FilterPanel";
import { AppBar } from "./Appbar";
import { SettingsPanel } from "./SettingsPanel";
import { useSettings } from "./SettingsContext";

export const Dashboard = () => {
  const [settings, updateSettings] = useSearchSettings();
  const [isSettingsOpen, setSettingsOpen] = React.useState(false);
  const [isFilterPanelOpen, setFilterPanelOpen] = React.useState(false);
  const [activeActionBarId, setActiveActionBarId] = React.useState(null);
  const { vehicles, isLoading, total, facets, facetsStats, defaultTotal, defaultFacets, defaultFacetsStats } =
    useFetchVehicles(settings);

  const {
    settings: { vehicleListDisplayMode, showPrice, showCarfax },
  } = useSettings();

  let displayClass = "";
  if (vehicleListDisplayMode === "grid")
    displayClass = "flex-row sm:flex-row gap-2 justify-center flex-wrap md:space-y-0 md:px-4";
  if (vehicleListDisplayMode === "list") displayClass = "flex-col";

  return (
    <div className="relative w-full overflow-y-scroll h-screen ">
      <AppBar
        setQuery={(val) => updateSettings("QUERY", val)}
        query={settings.query}
        setSettingsOpen={setSettingsOpen}
        settingsOpen={isSettingsOpen}
        setFilterPanelOpen={setFilterPanelOpen}
        filterPanelOpen={isFilterPanelOpen}
        total={total}
      />
      <div className="flex flex-col     lg:flex-row items-start lg:px-2">
        {(isSettingsOpen || isFilterPanelOpen) && (
          <div className="flex   w-full lg:w-96 mr-4   flex-col">
            {isSettingsOpen && <SettingsPanel setSettingsOpen={setSettingsOpen} />}
            {/* <pre className="text-xs">
          <code>{JSON.stringify(settings, null, 1)}</code>
        </pre> */}

            {isFilterPanelOpen && (
              <FilterPanel
                facets={facets}
                facetsStats={facetsStats}
                total={total}
                defaultFacets={defaultFacets}
                defaultFacetsStats={defaultFacetsStats}
                defaultTotal={defaultTotal}
                setFilterPanelOpen={setFilterPanelOpen}
                settings={settings}
                updateSettings={updateSettings}
              />
            )}
          </div>
        )}
        <div className={`container flex-grow-0 mx-auto flex items-start transition-all   ${displayClass}`}>
          {isLoading && <div>Loading....</div>}
          {vehicles.map((r, i) => (
            <VehicleCard num={i} key={r?.stock || i} v={r} activeActionBarId={activeActionBarId} setActiveActionBarId={setActiveActionBarId} />
          ))}
        </div>
      </div>
    </div>
  );
};
