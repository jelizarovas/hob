import { MdClear, MdSettings } from "react-icons/md";

export const Settings = ({
  setSettingsOpen,
  settings,
  updateSettings,
  ...props
}) => {
  const handleCheckboxChange = (option, value) => {
    updateSettings("UPDATE_TYPE", { [option]: !value });
  };

  return (
    <div className="w-full md:w-96 md:mx-2 mb-4 rounded border-white border-opacity-20 border  py-0.5">
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
        {/* <pre className="text-[6px]">
          {JSON.stringify(settings, null, 2)}
        </pre> */}
        <div className="flex space-x-2">
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
              onChange={() =>
                handleCheckboxChange(
                  "certifiedUsed",
                  settings.type.certifiedUsed
                )
              }
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
        <div className="flex space-x-2">
          <label>Year</label>
          <input placeholder="Min" className="w-16" />
          <input placeholder="Max" className="w-16" />
          <button>Or By Year</button>
        </div>
      </div>
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
