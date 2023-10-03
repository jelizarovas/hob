import { MdClear, MdFilter, MdFilterAlt, MdSettings } from "react-icons/md";
import { SettingsSlider } from "./settings/SettingsSlider";
// import { FilterListSelection } from "./settings/FilterListSelection";
import { FilterListSelection } from "./dev/FilterListSelection";
import { useVehicles } from "./VehicleContext";

export const FilterPanel = ({
  setFilterPanelOpen,
  facets,
  facetsStats,
  total,
  defaultFacets,
  defaultFacetsStats,
  defaultTotal,
  ...props
}) => {
  const handleCheckboxChange = (option, value) => {
    updateFilters({ [option]: !value });
  };
  const handleTypeChange = (option, value) => {
    updateFilters({ type: { ...filters.type, [option]: !value } });
  };

  const { filters, updateFilters, filtersDispatch } = useVehicles();

  console.log("filterPanel", { filters });

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
            filters.api.name === "Burien" ? "bg-blue-500" : ""
          }`}
          onClick={() => filtersDispatch({ type: "UPDATE_API", payload: "burienApi" })}
        >
          Burien
        </button>
        <button
          className={`py-2 px-4 m-2 border border-white border-opacity-20 rounded-xl ${
            filters.api.name === "Rairdon" ? "bg-red-500" : ""
          }`}
          onClick={() => filtersDispatch({ type: "UPDATE_API", payload: "rairdonApi" })}
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
              checked={filters.type.new}
              onChange={() => handleTypeChange("new", filters.type.new)}
            />
            New
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={filters.type.certifiedUsed}
              onChange={() => handleTypeChange("certifiedUsed", filters.type.certifiedUsed)}
            />
            Certified
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={filters.type.used}
              onChange={() => handleTypeChange("used", filters.type.used)}
            />
            Pre-Owned
          </label>
        </div>

        {/* <SettingsSlider
          label={"Year"}
          minValue={defaultFacetsStats?.year.min || 1990}
          maxValue={defaultFacetsStats?.year.max || 2024}
          currentMinValue={facetsStats?.year.min || 0}
          currentMaxValue={facetsStats?.year.max || 100000}
          value={filters.year}
          onChange={(newValue) => updateFilters("UPDATE_YEAR", newValue)}
        /> */}
        {/* <SettingsSlider
          label={"City MPG"}
          minValue={0}
          maxValue={65}
          value={filters.city_mpg}
          onChange={(newValue) =>
            updateFilters({ city_mpg: newValue })
          }
        /> */}
        {/* <SettingsSlider
          label={"Highway MPG"}
          minValue={0}
          maxValue={65}
          value={filters.hw_mpg}
          onChange={(newValue) =>
            updateFilters({ hw_mpg: newValue })
          }
        /> */}
        {/* <SettingsSlider
          label={"Price"}
          minValue={defaultFacetsStats?.our_price.min || 0}
          maxValue={defaultFacetsStats?.our_price.max || 100000}
          currentMinValue={facetsStats?.our_price.min || 0}
          currentMaxValue={facetsStats?.our_price.max || 100000}
          value={filters.price}
          onChange={(newValue) => updateFilters({ price: newValue })}
        /> */}
        {/* <SettingsSlider
          label={"MSRP"}
          minValue={0}
          maxValue={100000}
          value={filters.msrp}
          onChange={(newValue) =>
            updateFilters({ msrp: newValue })
          }
        /> */}
        {/* <SettingsSlider
          label={"Mileage"}
          minValue={defaultFacetsStats?.miles.min || 0}
          maxValue={defaultFacetsStats?.miles.max || 100000}
          value={filters.mileage}
          onChange={(newValue) => updateFilters({ mileage: newValue })}
        />
        <SettingsSlider
          label={"Days in Stock"}
          minValue={defaultFacetsStats?.days_in_stock?.min || 0}
          maxValue={defaultFacetsStats?.days_in_stock?.max || 100000}
          value={filters.days_in_stock}
          onChange={(newValue) => updateFilters({ days_in_stock: newValue })}
        />
        <SettingsSlider
          label={"Cars Per Page"}
          minValue={0}
          currentMaxValue={total || 50}
          maxValue={defaultTotal || 100}
          value={filters.hitsPerPage}
          onChange={(newValue) => updateFilters({ hitsPerPage: newValue })}
        />
        <FilterListSelection
          label="Locations"
          data={facets?.location}
          currentData={defaultFacets?.location}
          onChange={(newValue) => updateFilters({ location: newValue })}
        />
        <FilterListSelection
          label="Body"
          data={facets?.body}
          currentData={defaultFacets?.body}
          onChange={(newValue) => updateFilters({ body: newValue })}
        />
        <FilterListSelection
          label="Make"
          data={facets?.make}
          currentData={defaultFacets?.make}
          onChange={(newValue) => updateFilters({ make: newValue })}
        />
        <FilterListSelection
          label="Trim"
          data={facets?.trim}
          currentData={defaultFacets?.trim}
          onChange={(newValue) => updateFilters({ trim: newValue })}
        /> */}
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
        {/* <FilterListSelection
          label="Doors"
          data={facets?.doors}
          currentData={defaultFacets?.doors}
          onChange={(newValue) => updateFilters({ doors: newValue })}
        />
        <FilterListSelection
          label="Model"
          data={facets?.model}
          currentData={defaultFacets?.model}
          onChange={(newValue) => updateFilters({ model: newValue })}
        />
        <FilterListSelection
          label="Exterior Color"
          data={facets?.ext_color}
          currentData={defaultFacets?.ext_color}
          onChange={(newValue) => updateFilters({ ext_color: newValue })}
        />
        <FilterListSelection
          label="Interior Color"
          data={facets?.int_color}
          currentData={defaultFacets?.int_color}
          onChange={(newValue) => updateFilters({ int_color: newValue })}
        /> */}
        {/* <FilterListSelection label="fuelType" data={facets.fuelType} /> */}

        {/* <pre className="text-[6px]">{JSON.stringify(facets, null, 2)}</pre> */}

        {/* <SettingsSlider
          label={"Cylinders"}
          minValue={1}
          maxValue={12}
          value={filters.cylinders}
          onChange={(newValue) =>
            updateFilters({ cylinders: newValue })
          }
        /> */}
        {/* <SettingsSlider
          label={"Doors"}
          minValue={0}
          maxValue={10}
          value={filters.doors}
          onChange={(newValue) =>
            updateFilters({ doors: newValue })
          }
        /> */}
        {/* <pre className="text-[6px]">{JSON.stringify(settings, null, 2)}</pre> */}
        {/* <pre className="text-[6px]">{JSON.stringify(facets, null, 2)}</pre> */}
        {/* <pre className="text-[6px]">{JSON.stringify(facetsStats, null, 2)}</pre> */}
      </div>
    </div>
  );
};
