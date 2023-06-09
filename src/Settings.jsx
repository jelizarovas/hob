import { useState, useEffect, useReducer } from "react";
import {
  MdClear,
  MdKeyboardArrowDown,
  MdOutlineHistory,
  MdOutlineSettingsSystemDaydream,
  MdSearch,
  MdSettings,
} from "react-icons/md";

const burienAPI = {
  name: "Burien",
  "X-Algolia-API-Key": "179608f32563367799314290254e3e44",
  "X-Algolia-Application-Id": "SEWJN80HTN",
  index:
    "rairdonshondaofburien-legacymigration0222_production_inventory_high_to_low",
};

const rairdonAPI = {
  name: "Rairdon",
  "X-Algolia-API-Key": "ec7553dd56e6d4c8bb447a0240e7aab3",
  "X-Algolia-Application-Id": "V3ZOVI2QFZ",
  index: "rairdonautomotivegroup_production_inventory_low_to_high",
};

const reducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_SETTING":
      return { ...state, [action.payload.settingName]: action.payload.value };
    default:
      return state;
  }
};

export const Settings = ({
  api,
  setAPI,
  total,
  setSettingsOpen,
  searchSettings,
  updateSearchSettings,
  ...props
}) => {
  // Load settings data from local storage on component mount
  useEffect(() => {
    const storedData = localStorage.getItem("settingsData");
    if (storedData) {
      dispatch({ type: "LOAD_DATA", payload: JSON.parse(storedData) });
    }
  }, []);

  // Define state and dispatch for managing local data
  const [state, dispatch] = useReducer(reducer, settingsObj);

  // Update setting value
  const updateSetting = (settingName, value) => {
    dispatch({ type: "UPDATE_SETTING", payload: { settingName, value } });
  };

  // Save data to local storage whenever state changes
  useEffect(() => {
    localStorage.setItem("settingsData", JSON.stringify(state));
  }, [state]);

  const handleCheckboxChange = (option, value) => {
    updateSearchSettings({ [option]: !value }, "UPDATE_TYPE");
  };

  return (
    <div className="mx-2 mb-4 rounded border-white border-opacity-20 border  py-0.5">
      <div className="flex justify-between items-center opacity-80 border-b border-white border-opacity-20 px-4 pb-0.5">
        <div className="flex items-center space-x-2">
          <MdSettings /> <span>Settings</span>
        </div>
        <button
          type="button"
          className="flex"
          onClick={() => setSettingsOpen(false)}
        >
          <MdClear />
        </button>
      </div>
      <div className="flex text-xs">
        <button
          className={`py-2 px-4 m-2 border border-white border-opacity-20 rounded-xl ${
            api.name === burienAPI.name ? "bg-blue-500" : ""
          }`}
          onClick={() => setAPI(burienAPI)}
        >
          {burienAPI.name}
        </button>
        <button
          className={`py-2 px-4 m-2 border border-white border-opacity-20 rounded-xl ${
            api.name === rairdonAPI.name ? "bg-red-500" : ""
          }`}
          onClick={() => setAPI(rairdonAPI)}
        >
          {rairdonAPI.name}
        </button>
        <div className="p-2 m-2">Total results: {total.toString()}</div>
      </div>
      <div>
        {/* <pre className="text-[6px]">
          {JSON.stringify(searchSettings, null, 2)}
        </pre> */}
        <div>
          <label>
            <input
              type="checkbox"
              checked={searchSettings.type.new}
              onChange={() =>
                handleCheckboxChange("new", searchSettings.type.new)
              }
            />
            New
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={searchSettings.type.certifiedUsed}
              onChange={() =>
                handleCheckboxChange(
                  "certifiedUsed",
                  searchSettings.type.certifiedUsed
                )
              }
            />
            Certified
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={searchSettings.type.used}
              onChange={() =>
                handleCheckboxChange("used", searchSettings.type.used)
              }
            />
            Pre-Owned
          </label>
        </div>
      </div>

      {false &&
        state.map((setting) => (
          <div key={setting.id}>
            <h3>{setting.settingName}</h3>
            <p>{setting.description}</p>
            {setting.type === "numeric" ? (
              <input
                className="bg-red-500"
                type="number"
                value={state[setting.settingName] || 0}
                onChange={(e) =>
                  updateSetting(setting.settingName, e.target.value)
                }
              />
            ) : setting.type === "selection" ? (
              <select
                value={state[setting.settingName] || ""}
                onChange={(e) =>
                  updateSetting(setting.settingName, e.target.value)
                }
              >
                {/* Render options based on your specific requirements */}
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
              </select>
            ) : setting.type === "options" ? (
              /* Render options based on your specific requirements */
              <div>
                <input
                  type="radio"
                  id={`option1_${setting.id}`}
                  name={`options_${setting.id}`}
                  value="option1"
                  checked={state[setting.settingName] === "option1"}
                  onChange={() => updateSetting(setting.settingName, "option1")}
                />
                <label htmlFor={`option1_${setting.id}`}>Option 1</label>
                <br />
                <input
                  type="radio"
                  id={`option2_${setting.id}`}
                  name={`options_${setting.id}`}
                  value="option2"
                  checked={state[setting.settingName] === "option2"}
                  onChange={() => updateSetting(setting.settingName, "option2")}
                />
                <label htmlFor={`option2_${setting.id}`}>Option 2</label>
                <br />
                <input
                  type="radio"
                  id={`option3_${setting.id}`}
                  name={`options_${setting.id}`}
                  value="option3"
                  checked={state[setting.settingName] === "option3"}
                  onChange={() => updateSetting(setting.settingName, "option3")}
                />
                <label htmlFor={`option3_${setting.id}`}>Option 3</label>
              </div>
            ) : null}
          </div>
        ))}
    </div>
  );
};

const settingsObj = [
  {
    id: "hitsPerPage",
    settingName: "Hits per Page",
    type: "numeric",
    description: "Adjust the number of search results displayed per page.",
    value: 10,
  },
  {
    id: "facets",
    settingName: "Facets",
    type: "selection",
    description: "Choose which facets to display for filtering search results.",
    value: [
      "features",
      "our_price",
      "lightning.lease_monthly_payment",
      "lightning.finance_monthly_payment",
      "type",
      "api_id",
      "year",
      "make",
      "model",
      "model_number",
      "trim",
      "body",
      "doors",
      "miles",
      "ext_color_generic",
      "features",
      "lightning.isSpecial",
      "lightning.locations",
      "lightning.status",
      "lightning.class",
      "fueltype",
      "engine_description",
      "transmission_description",
      "metal_flags",
      "city_mpg",
      "hw_mpg",
      "days_in_stock",
      "ford_SpecialVehicle",
      "lightning.locations.meta_location",
      "ext_color",
      "title_vrp",
      "int_color",
      "certified",
      "lightning",
      "location",
      "drivetrain",
      "int_options",
      "ext_options",
      "cylinders",
      "vin",
      "stock",
      "msrp",
      "our_price_label",
      "finance_details",
      "lease_details",
      "thumbnail",
      "link",
      "objectID",
      "algolia_sort_order",
      "date_modified",
      "hash",
    ],
  },
  {
    id: "searchDebounceTime",
    settingName: "Debounce Time",
    type: "numeric",
    description: "Set the delay between user input and search query execution.",
    value: 1000,
  },
  {
    id: "sorting",
    settingName: "Sorting Options",
    type: "options",
    description: "Select the attribute and order for sorting search results.",
    value: { attribute: "price", order: "asc" },
    hidden: true,
  },
  {
    id: "storeSelection",
    settingName: "Store Selection",
    type: "selection",
    options: [
      {
        name: "Burien",
        "X-Algolia-API-Key": "179608f32563367799314290254e3e44",
        "X-Algolia-Application-Id": "SEWJN80HTN",
        index:
          "rairdonshondaofburien-legacymigration0222_production_inventory_high_to_low",
      },
      {
        name: "Rairdon",
        "X-Algolia-API-Key": "ec7553dd56e6d4c8bb447a0240e7aab3",
        "X-Algolia-Application-Id": "V3ZOVI2QFZ",
        index: "rairdonautomotivegroup_production_inventory_low_to_high",
      },
    ],
    description:
      "Choose a preferred store for searching within a specific dealership.",
    value: 0,
  },
];
