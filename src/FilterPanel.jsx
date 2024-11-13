import {
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdClear,
  MdFilter,
  MdFilterAlt,
  MdKeyboardArrowDown,
  MdSettings,
} from "react-icons/md";
import { SettingsSlider } from "./settings/SettingsSlider";
// import { FilterListSelection } from "./settings/FilterListSelection";
import { FilterListSelection } from "./dev/FilterListSelection";
import { useVehicles } from "./VehicleContext";
import { AppBarButton } from "./Appbar";

export const FilterPanel = ({
  setFilterPanelOpen,
  facets,
  facetsStats,
  total,
  defaultFacets,
  defaultFacetsStats,
  defaultTotal,
  setSettingsOpen,
  settingsOpen,
  ...props
}) => {
  const handleCheckboxChange = (option, value) => {
    updateFilters({ [option]: !value });
  };
  const handleTypeChange = (option, value) => {
    updateFilters({ type: { ...filters.type, [option]: !value } });
  };

  const { filters, updateFilters, filtersDispatch } = useVehicles();

  // console.log("filterPanel", { filters });

  return (
    <div className="w-full   mx-2  rounded mb-0 sm:mb-2 lg:mb-0   px-2">
      <div className="flex justify-between flex-wrap md:space-x-2 pb-2">
        {/* <div className="flex text-sm border border-opacity-20 border-white rounded ">
          {[
            { label: "Burien", payload: "burienApi", bg: "bg-blue-800" },
            { label: "Rairdon", payload: "rairdonApi", bg: "bg-red-800" },
          ].map(({ label, payload, bg }, i) => (
            <button
              key={i}
              className={`px-2 p-1 bg-opacity-0 text-xs  transition-all  ${
                filters.api.name === label
                  ? `${bg} bg-opacity-90 hover:bg-opacity-100`
                  : "bg-white hover:bg-opacity-20"
              }`}
              onClick={() => filtersDispatch({ type: "UPDATE_API", payload })}
            >
              {label}
            </button>
          ))}
        </div> */}
         <div className="flex pb-0">
          <select
            className="bg-transparent px-2 py-1 rounded border border-white border-opacity-10 text-xs hover:bg-white hover:bg-opacity-10 cursor-pointer"
            onChange={(e) => {
              const selectedValue = e.target.value;

              if (selectedValue === "AgeDesc") {
                // If "Age Desc" is selected, dispatch SORT_BY_AGE with DESC
                filtersDispatch({ type: "SORT_BY_AGE", payload: "DESC" });
              } else if (selectedValue === "AgeAsc") {
                // If "Age Asc" is selected, dispatch SORT_BY_AGE with ASC
                filtersDispatch({ type: "SORT_BY_AGE", payload: "ASC" });
              } else {
                // Otherwise, update the index
                filtersDispatch({
                  type: "UPDATE_INDEX",
                  payload: selectedValue,
                });
              }
            }}
          >
            {filters.api.indexes.map(({ label, index }) => (
              <option key={index} value={index} className="bg-black">
                {label}
              </option>
            ))}
            <option value="AgeDesc" className="bg-black">
              Age ⬆️
            </option>
            <option value="AgeAsc" className="bg-black">
              Age ⬇️
            </option>
          </select>
        </div> 
        {/* <span>sortByAge {filters.sortByAge.toString()}</span> */}

        <button
        className={`flex space-x-2 items-center justify-center   uppercase border border-white rounded px-2 py-0.5 border-opacity-10 bg-white transition-all ${settingsOpen ? "bg-opacity-10" : "bg-opacity-0"}`}
          onClick={() =>
            !settingsOpen ? setSettingsOpen(true) : setSettingsOpen(false)
          }
          
        >
            <MdFilterAlt className="text-xl" /> <span className="text-[9px]">Filter</span>
          </button>

         <div className="flex items-center   text-sm border border-opacity-20 border-white rounded ">
          {[
            { label: "New", bg: "bg-indigo-900", value: "new" },
            { label: "Certified", bg: "bg-purple-900", value: "certifiedUsed" },
            { label: "Used", bg: "bg-orange-900", value: "used" },
          ].map(({ label, value, bg }, i) => (
            <button
              key={i}
              className={`flex items-center cursor-pointer text-xs py-1 px-2  transition-all ${bg} ${
                filters.type[value]
                  ? `bg-opacity-100 hover:bg-opacity-50  `
                  : "bg-opacity-0  hover:bg-opacity-20 "
              } `}
              onClick={() => handleTypeChange(value, filters.type[value])}
            >
              <span className="hidden sm:flex">
                {filters.type[value] ? (
                  <MdCheckBox />
                ) : (
                  <MdCheckBoxOutlineBlank />
                )}
              </span>
              <span className="md:pl-1 upper">{label}</span>
            </button>
          ))}
        </div> 
        {/* <button onClick={() => setFilterPanelOpen(false)} className="px-2 rotate-180">
          <MdKeyboardArrowDown />
        </button> */}
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
          minValue={defaultFacetsStats?.our_price?.min || 0}
          maxValue={defaultFacetsStats?.our_price?.max || 100000}
          currentMinValue={facetsStats?.our_price?.min || 0}
          currentMaxValue={facetsStats?.our_price?.max || 100000}
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
  );
};
