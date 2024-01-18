import { Button, ButtonGroup, Checkbox, FormControlLabel } from "@mui/material";
import React from "react";
import { MdClear, MdFilterAlt, MdGridView, MdListAlt, MdMenu, MdSettings } from "react-icons/md";
import { Link } from "react-router-dom";
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
    <div className="container mx-auto md:w-96 md:mx-2 mb-4 rounded border-white border-opacity-20 border  py-0.5">
      <div className="flex justify-between items-center opacity-80 border-b border-white border-opacity-20 px-4 pb-0.5">
        <div className="flex items-center space-x-2">
          <MdMenu /> <span>Menu</span>
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
          control={<Checkbox name="showPrice" checked={settings?.showPrice} onChange={handleChange} />}
          label="Show Price"
        />
        <FormControlLabel
          control={<Checkbox name="showCarfax" checked={settings?.showCarfax} onChange={handleChange} />}
          label="Show Carfax"
        />
      </div>
      <div className="flex flex-col px-2 space-y-2">
        <a
          href="http://jelizarovas.github.io/HondaAccessory/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white bg-opacity-0 hover:bg-opacity-10 px-2 py-1 rounded my-1"
        >
          Honda Accessory
        </a>
        <a
          className="bg-white bg-opacity-0 hover:bg-opacity-10 px-2 py-1 rounded my-1"
          href="http://jelizarovas.github.io/makey/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Make Key Tag
        </a>
        {/* <Link to="/pdi">PDI Templates</Link> */}
        {/* <Link to="/pdi">Perfect Delivery</Link> */}
        <a
          className="bg-white bg-opacity-0 hover:bg-opacity-10 px-2 py-1 rounded my-1"
          href="pdf/Take-in Sheet.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Take-In Sheet
        </a>
        <Link className="bg-white bg-opacity-0 hover:bg-opacity-10 px-2 py-1 rounded my-1" to="/check/req">
          Check Request
        </Link>
        <Link className="bg-white bg-opacity-0 hover:bg-opacity-10 px-2 py-1 rounded my-1" to="/buyers/guide/">
          Buyers Guide
        </Link>
        <Link className="bg-white bg-opacity-0 hover:bg-opacity-10 px-2 py-1 rounded my-1" to="/bar/code/">
          Barcode
        </Link>
      </div>
    </div>
  );
};
