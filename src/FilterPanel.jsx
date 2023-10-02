import { MdClear, MdFilter, MdFilterAlt, MdSettings } from "react-icons/md";
import { SettingsSlider } from "./settings/SettingsSlider";
// import { FilterListSelection } from "./settings/FilterListSelection";
import { FilterListSelection } from "./dev/FilterListSelection";

export const FilterPanel = ({
  setFilterPanelOpen,
  settings,
  updateSettings,
  facets,
  facetsStats,
  total,
  defaultFacets,
  defaultFacetsStats,
  defaultTotal,
  ...props
}) => {
  const handleCheckboxChange = (option, value) => {
    updateSettings("UPDATE_TYPE", { [option]: !value });
  };

  return (
    <div className="w-full md:w-96 md:mx-2 mb-4 rounded border-white border-opacity-20 border  py-0.5">
      <div className="flex justify-between items-center opacity-80 border-b border-white border-opacity-20 px-4 pb-0.5">
        <div className="flex items-center space-x-2">
          <MdFilterAlt /> <span>Filters</span>
        </div>
        <button type="button" className="flex" onClick={() => setFilterPanelOpen(false)}>
          <MdClear />
        </button>
      </div>
      <div className="flex text-xs">
        <button
          className={`py-2 px-4 m-2 border border-white border-opacity-20 rounded-xl ${
            settings.api.name === "Burien" ? "bg-blue-500" : ""
          }`}
          onClick={() => updateSettings("UPDATE_API", "burienApi")}
        >
          Burien
        </button>
        <button
          className={`py-2 px-4 m-2 border border-white border-opacity-20 rounded-xl ${
            settings.api.name === "Rairdon" ? "bg-red-500" : ""
          }`}
          onClick={() => updateSettings("UPDATE_API", "rairdonApi")}
        >
          Rairdon
        </button>
        {/* <div className="p-2 m-2">Total results: {total.toString()}</div> */}
      </div>
      <div>
        <div className="flex space-x-2 px-2 py-2">
          <label>
            <input
              type="checkbox"
              checked={settings.type.new}
              onChange={() => handleCheckboxChange("new", settings.type.new)}
            />
            New
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={settings.type.certifiedUsed}
              onChange={() => handleCheckboxChange("certifiedUsed", settings.type.certifiedUsed)}
            />
            Certified
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={settings.type.used}
              onChange={() => handleCheckboxChange("used", settings.type.used)}
            />
            Pre-Owned
          </label>
        </div>

        <SettingsSlider
          label={"Year"}
          minValue={defaultFacetsStats?.year.min || 1990}
          maxValue={defaultFacetsStats?.year.max || 2024}
          currentMinValue={facetsStats?.year.min || 0}
          currentMaxValue={facetsStats?.year.max || 100000}
          value={settings.year}
          onChange={(newValue) => updateSettings("UPDATE_YEAR", newValue)}
        />
        {/* <SettingsSlider
          label={"City MPG"}
          minValue={0}
          maxValue={65}
          value={settings.city_mpg}
          onChange={(newValue) =>
            updateSettings("UPDATE_SETTINGS", { city_mpg: newValue })
          }
        /> */}
        {/* <SettingsSlider
          label={"Highway MPG"}
          minValue={0}
          maxValue={65}
          value={settings.hw_mpg}
          onChange={(newValue) =>
            updateSettings("UPDATE_SETTINGS", { hw_mpg: newValue })
          }
        /> */}
        <SettingsSlider
          label={"Price"}
          minValue={defaultFacetsStats?.our_price.min || 0}
          maxValue={defaultFacetsStats?.our_price.max || 100000}
          currentMinValue={facetsStats?.our_price.min || 0}
          currentMaxValue={facetsStats?.our_price.max || 100000}
          value={settings.price}
          onChange={(newValue) => updateSettings("UPDATE_SETTINGS", { price: newValue })}
        />
        {/* <SettingsSlider
          label={"MSRP"}
          minValue={0}
          maxValue={100000}
          value={settings.msrp}
          onChange={(newValue) =>
            updateSettings("UPDATE_SETTINGS", { msrp: newValue })
          }
        /> */}
        <SettingsSlider
          label={"Mileage"}
          minValue={defaultFacetsStats?.miles.min || 0}
          maxValue={defaultFacetsStats?.miles.max || 100000}
          value={settings.mileage}
          onChange={(newValue) => updateSettings("UPDATE_SETTINGS", { mileage: newValue })}
        />
        <SettingsSlider
          label={"Days in Stock"}
          minValue={defaultFacetsStats?.days_in_stock?.min || 0}
          maxValue={defaultFacetsStats?.days_in_stock?.max || 100000}
          value={settings.days_in_stock}
          onChange={(newValue) => updateSettings("UPDATE_SETTINGS", { days_in_stock: newValue })}
        />
        <SettingsSlider
          label={"Cars Per Page"}
          minValue={0}
          currentMaxValue={total || 50}
          maxValue={defaultTotal || 100}
          value={settings.hitsPerPage}
          onChange={(newValue) => updateSettings("UPDATE_SETTINGS", { hitsPerPage: newValue })}
        />
        <FilterListSelection
          label="Locations"
          data={facets.location}
          currentData={defaultFacets.location}
          onChange={(newValue) => updateSettings("UPDATE_SETTINGS", { location: newValue })}
        />
        <FilterListSelection
          label="Body"
          data={facets.body}
          currentData={defaultFacets.body}
          onChange={(newValue) => updateSettings("UPDATE_SETTINGS", { body: newValue })}
        />
        <FilterListSelection
          label="Make"
          data={facets.make}
          currentData={defaultFacets.make}
          onChange={(newValue) => updateSettings("UPDATE_SETTINGS", { make: newValue })}
        />
        <FilterListSelection
          label="Trim"
          data={facets.trim}
          currentData={defaultFacets.trim}
          onChange={(newValue) => updateSettings("UPDATE_SETTINGS", { trim: newValue })}
        />
        {/* <FilterListSelection
          label="Type"
          data={facets.type}
          currentData={defaultFacets.type}
        /> */}
        {/* <FilterListSelection
          label="Year"
          data={facets.year}
          currentData={defaultFacets.year}
        /> */}
        <FilterListSelection
          label="Doors"
          data={facets.doors}
          currentData={defaultFacets.doors}
          onChange={(newValue) => updateSettings("UPDATE_SETTINGS", { doors: newValue })}
        />
        <FilterListSelection
          label="Model"
          data={facets.model}
          currentData={defaultFacets.model}
          onChange={(newValue) => updateSettings("UPDATE_SETTINGS", { model: newValue })}
        />
        <FilterListSelection
          label="Exterior Color"
          data={facets.ext_color}
          currentData={defaultFacets.ext_color}
          onChange={(newValue) => updateSettings("UPDATE_SETTINGS", { ext_color: newValue })}
        />
        <FilterListSelection
          label="Interior Color"
          data={facets.int_color}
          currentData={defaultFacets.int_color}
          onChange={(newValue) => updateSettings("UPDATE_SETTINGS", { int_color: newValue })}
        />
        {/* <FilterListSelection label="fuelType" data={facets.fuelType} /> */}

        {/* <pre className="text-[6px]">{JSON.stringify(facets, null, 2)}</pre> */}

        {/* <SettingsSlider
          label={"Cylinders"}
          minValue={1}
          maxValue={12}
          value={settings.cylinders}
          onChange={(newValue) =>
            updateSettings("UPDATE_SETTINGS", { cylinders: newValue })
          }
        /> */}
        {/* <SettingsSlider
          label={"Doors"}
          minValue={0}
          maxValue={10}
          value={settings.doors}
          onChange={(newValue) =>
            updateSettings("UPDATE_SETTINGS", { doors: newValue })
          }
        /> */}
        {/* <pre className="text-[6px]">{JSON.stringify(settings, null, 2)}</pre> */}
        {/* <pre className="text-[6px]">{JSON.stringify(facets, null, 2)}</pre> */}
        {/* <pre className="text-[6px]">{JSON.stringify(facetsStats, null, 2)}</pre> */}
      </div>
    </div>
  );
};

