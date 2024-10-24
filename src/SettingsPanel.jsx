import { Button, ButtonGroup, Checkbox, FormControlLabel } from "@mui/material";
import React from "react";
import { MdClear, MdFilterAlt, MdGridView, MdListAlt, MdMenu, MdSettings, MdVisibility } from "react-icons/md";
import { Link } from "react-router-dom";
import { SettingsProvider, useSettings } from "./SettingsContext";
import { SettingsSlider } from "./settings/SettingsSlider";
import { useVehicles } from "./VehicleContext";
import { FaFilePdf } from "react-icons/fa6";

export const SettingsPanel = ({ setSettingsOpen }) => {
  const { filters, updateFilters, defaultFacetsStats } = useVehicles();

  const { settings, setSetting } = useSettings();

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setSetting(name, checked);
  };

  const handleViewChange = (view) => {
    setSetting("vehicleListDisplayMode", view);
  };

  return (
    <div className="container mx-auto  md:w-96 bg-black mb-4 rounded border-white border-opacity-20 border  py-0.5">
      <div className="flex justify-between items-center opacity-80 border-b border-white border-opacity-20 px-4 pb-0.5">
        <div className="flex items-center space-x-2">
          <MdMenu /> <span>Menu</span>
        </div>
        <button type="button" className="flex" onClick={() => setSettingsOpen(false)}>
          <MdClear />
        </button>
      </div>
      <div className="flex flex-col py-2 px-2">
        <SettingsSlider
          label={"Price"}
          minValue={defaultFacetsStats?.our_price?.min || 0}
          maxValue={defaultFacetsStats?.our_price?.max || 100000}
          currentMinValue={0}
          currentMaxValue={100000}
          value={filters.price}
          onChange={(newValue) => updateFilters({ price: newValue })}
        />
        <ButtonGroup variant="contained" aria-label="outlined primary button group">
          <Button
            variant={settings.vehicleListDisplayMode === "grid" ? "contained" : "outlined"}
            onClick={() => handleViewChange("grid")}
          >
            <MdGridView /> <span className="px-2">Grid</span>
          </Button>
          <Button
            variant={settings.vehicleListDisplayMode === "card" ? "contained" : "outlined"}
            onClick={() => handleViewChange("card")}
          >
            <MdListAlt /> <span className="px-2">Card</span>
          </Button>
          <Button
            variant={settings.vehicleListDisplayMode === "list" ? "contained" : "outlined"}
            onClick={() => handleViewChange("list")}
          >
            <MdListAlt /> <span className="px-2">List</span>
          </Button>
        </ButtonGroup>
        <div className="flex gap-0 border rounded border-white border-opacity-20  flex-wrap  my-2">
          <div className="w-full text-xs flex gap-2 items-center bg-white bg-opacity-10 px-4 py-0.5 uppercase">
            {" "}
            <MdVisibility /> <span>View</span>
          </div>
          <div className="px-2 flex flex-wrap">
            <FormControlLabel
              control={<Checkbox name="showPrice" checked={settings?.showPrice} onChange={handleChange} />}
              label="Price"
            />
            <FormControlLabel
              control={<Checkbox name="showCarfax" checked={settings?.showCarfax} onChange={handleChange} />}
              label="Carfax"
            />
            <FormControlLabel
              control={<Checkbox name="showDays" checked={settings?.showDays} onChange={handleChange} />}
              label="Days"
            />
            <FormControlLabel
              control={<Checkbox name="showMiles" checked={settings?.showMiles} onChange={handleChange} />}
              label="Miles"
            />
            <FormControlLabel
              control={<Checkbox name="showLocation" checked={settings?.showLocation} onChange={handleChange} />}
              label="Location"
            />
            <FormControlLabel
              control={<Checkbox name="showColor" checked={settings?.showColor} onChange={handleChange} />}
              label="Color"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col px-2 space-y-2">
        {/* <a
          href="http://jelizarovas.github.io/HondaAccessory/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white bg-opacity-0 hover:bg-opacity-10 px-2 py-1 rounded my-1"
        >
          Honda Accessory
        </a> */}
        {/* <a
          className="bg-white bg-opacity-0 hover:bg-opacity-10 px-2 py-1 rounded my-1"
          href="http://jelizarovas.github.io/makey/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Make Key Tag
        </a> */}
        {/* <Link to="/pdi">PDI Templates</Link> */}
        {/* <Link to="/pdi">Perfect Delivery</Link> */}
        {/* <div className="flex">
          <a
            className=" flex space-x-2 items-center bg-white bg-opacity-0 hover:bg-opacity-10 px-2 py-1 rounded my-1"
            href="pdf/Take-in Sheet.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFilePdf /> <span> Take-In Sheet </span>
          </a>
          <a
            className=" flex space-x-2 items-center bg-white bg-opacity-0 hover:bg-opacity-10 px-2 py-1 rounded my-1"
            href="pdf/Take-in Sheet Form.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFilePdf /> <span> Take-In Form </span>
          </a>
        </div>
        <Link
          className="flex space-x-2 items-center bg-white bg-opacity-0 hover:bg-opacity-10 px-2 py-1 rounded my-1"
          to="/check/req"
        >
          <FaFilePdf /> <span> Check Request </span>
        </Link>
        <Link
          className="flex space-x-2 items-center bg-white bg-opacity-0 hover:bg-opacity-10 px-2 py-1 rounded my-1"
          to="/buyers/guide/"
        >
          <FaFilePdf /> <span> Buyers Guide </span>
        </Link>
        <Link
          className="flex space-x-2 items-center bg-white bg-opacity-0 hover:bg-opacity-10 px-2 py-1 rounded my-1"
          to="/bar/code/"
        >
          <FaFilePdf /> <span> Barcode </span>
        </Link> */}
      </div>
    </div>
  );
};
