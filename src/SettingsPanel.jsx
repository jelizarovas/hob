import { Button, ButtonGroup, Checkbox, FormControlLabel } from "@mui/material";
import React from "react";
import { MdClear, MdFilterAlt, MdGridView, MdListAlt, MdSettings } from "react-icons/md";
import { SettingsProvider, useSettings } from "./SettingsContext";

export const SettingsPanel = ({ setSettingsOpen }) => {
  const { settings, setSetting } = useSettings();

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setSetting(name, checked);
  };

  const handleViewChange = (view) => {
    setSetting("vehicleListDisplayMode", view);
  };

  return (
    <div className="w-full mx-auto md:w-96 md:mx-2 mb-4 rounded border-white border-opacity-20 border  py-0.5">
      <div className="flex justify-between items-center opacity-80 border-b border-white border-opacity-20 px-4 pb-0.5">
        <div className="flex items-center space-x-2">
          <MdSettings /> <span>Settings</span>
        </div>
        <button type="button" className="flex" onClick={() => setSettingsOpen(false)}>
          <MdClear />
        </button>
      </div>
      <div className="flex flex-col py-2 px-2">
        <ButtonGroup variant="contained" aria-label="outlined primary button group">
          <Button
            variant={settings.vehicleListDisplayMode === "grid" ? "contained" : "outlined"}
            onClick={() => handleViewChange("grid")}
          >
            <MdGridView /> <span className="px-2">Grid</span>
          </Button>
          <Button
            variant={settings.vehicleListDisplayMode === "list" ? "contained" : "outlined"}
            onClick={() => handleViewChange("list")}
          >
            <MdListAlt /> <span className="px-2">List</span>
          </Button>
        </ButtonGroup>
        <FormControlLabel
          control={<Checkbox name="showPrice" value={settings.showPrice} onChange={handleChange} />}
          label="Show Price"
        />
        <FormControlLabel
          control={<Checkbox name="showCarfax" value={settings.showCarfax} onChange={handleChange} />}
          label="Show Carfax"
        />
      </div>
    </div>
  );
};
