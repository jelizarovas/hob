import React, { useState, useEffect } from "react";
import { VehicleCard } from "./vehicle/VehicleCard";
import useSearchSettings from "./hooks/useSearchSettings";
import useFetchVehicles from "./hooks/useFetchVehicles";
import { Settings } from "./Settings";
import { AppBar } from "./Appbar";

export const Dashboard = () => {
  const [settings, updateSettings] = useSearchSettings();
  const [isSettingsOpen, setSettingsOpen] = React.useState(false);
  const [vehicles, isLoading] = useFetchVehicles(settings);

  return (
    <div className="relative overflow-y-scroll h-screen">
      <AppBar
        setQuery={(val) => updateSettings("QUERY", val)}
        query={settings.query}
        setSettingsOpen={setSettingsOpen}
        settingsOpen={isSettingsOpen}
      />
      <div className="flex flex-col md:flex-row px-2">
        {isSettingsOpen && (
          <Settings
            setSettingsOpen={setSettingsOpen}
            settings={settings}
            updateSettings={updateSettings}
          />
        )}
        <div className="container   mx-auto flex flex-row sm:flex-row gap-2 justify-center transition-all flex-wrap md:space-y-0 md:px-4">
          {isLoading && <div>Loading....</div>}
          {vehicles.map((r, i) => (
            <VehicleCard num={i} key={r?.stock || i} v={r} />
          ))}
        </div>
      </div>
    </div>
  );
};
