import React, { useState, useEffect, useReducer } from "react";
import {
  MdClear,
  MdKeyboardArrowDown,
  MdOutlineHistory,
  MdOutlineSettingsSystemDaydream,
  MdSearch,
  MdSettings,
} from "react-icons/md";
import { inventory } from "./data";
import { VehicleCard } from "./VehicleCard";
import useSearchSettings from "./useSearchSettings";
import { Settings } from "./Settings";
import { camelCaseToProperCase, debounce } from "./utils";
import algoliasearch from "algoliasearch";

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
  index2: "rairdonautomotivegroup_production_inventory_high_to_low",
  index3: "rairdonautomotivegroup_production_inventory_specials_price",
  index4: "rairdonautomotivegroup_production_inventory_mileage_low_to_high",
  index5: "rairdonautomotivegroup_production_inventory_mileage_high_to_low",
  index6:
    "rairdonautomotivegroup_production_inventory_days_in_stock_low_to_high",
};

const performInitialSearch = (api) => {
  fetch(
    `https://${api["X-Algolia-Application-Id"]}-dsn.algolia.net/1/indexes/${api.index}/query`,
    {
      headers: {
        "X-Algolia-API-Key": api["X-Algolia-API-Key"],
        "X-Algolia-Application-Id": api["X-Algolia-Application-Id"],
      },
      method: "POST",
      body: JSON.stringify({
        hitsPerPage: 1,
        facets: [
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
          "imageUrls",
          "imageThumbUrls",
        ],
      }),
    }
  )
    .then((response) => response.json())
    .then(({ facets, facets_states, nbHits }) => {
      console.log({ facets, facets_states, nbHits });
    });
};

export const Check = () => {
  const [query, setQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [api, setAPI] = useState(burienAPI);
  const [total, setTotal] = useState(0);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const [searchSettings, updateSearchSettings] = useSearchSettings();

  const yearRange = false;

  // const client = algoliasearch(
  //   api["X-Algolia-Application-Id"],
  //   api["X-Algolia-API-Key"]
  // );
  // // client.listIndices().then(({ items }) => {
  // //   console.log(items);
  // // });
  // const index = client.initIndex(api.index);

  // let hits = [];

  // // Get all records as an iterator
  // index.search("civic").then(({ hits }) => {
  //   console.log(hits);
  // });

  useEffect(() => {
    const performSearch = debounce(() => {
      fetch(
        `https://${api["X-Algolia-Application-Id"]}-dsn.algolia.net/1/indexes/${api.index}/query`,
        {
          headers: {
            "X-Algolia-API-Key": api["X-Algolia-API-Key"],
            "X-Algolia-Application-Id": api["X-Algolia-Application-Id"],
          },
          method: "POST",
          body: JSON.stringify({
            hitsPerPage: 100,
            query: query,
            facetFilters: [
              Object.entries(searchSettings.type).reduce(
                (acc, [label, val]) => {
                  if (val)
                    return [...acc, "type:" + camelCaseToProperCase(label)];
                  return acc;
                },
                []
              ),
              // ["year:2022"],
              // ["location:cpo|purchase"],
            ],
            // facetFilters: [
            //   [
            //     searchSettings.type.new && "type:New",
            //     searchSettings.type.used && "type:Used",
            //     searchSettings.type.certifiedUsed && "type:Certified Used",
            //   ],
            //   ["year:2022", "year:2019", "year:2017"],
            // ], //"type:New",
            // numericFilters: [
            //   "miles>=48494",
            //   "our_price<=26299",
            //   "our_price>=22799",
            // ],
            facets: [
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
              // "trim",
              // "body",
              // "doors",
              // "miles",
              // "ext_color_generic",
              // "features",
              // "lightning.isSpecial",
              // "lightning.locations",
              // "lightning.status",
              // "lightning.class",
              // "fueltype",
              // "engine_description",
              // "transmission_description",
              // "metal_flags",
              // "city_mpg",
              // "hw_mpg",
              // "days_in_stock",
              // "ford_SpecialVehicle",
              // "lightning.locations.meta_location",
              // "ext_color",
              // "title_vrp",
              // "int_color",
              // "certified",
              // "lightning",
              // "location",
              // "drivetrain",
              // "int_options",
              // "ext_options",
              // "cylinders",
              // "vin",
              // "stock",
              // "msrp",
              // "our_price_label",
              // "finance_details",
              // "lease_details",
              // "thumbnail",
              // "link",
              // "objectID",
              // "algolia_sort_order",
              // "date_modified",
              // "hash",
              // "vdp",
              // "gallery",
              // "vdp_gallery",
            ],
          }),
        }
      )
        .then((response) => response.json())
        .then((data) => {
          console.log({ data });
          // data?.facets_stats &&
          //   updateSearchSettings(data.facets_stats, "UPDATE_FACET_STATS");
          setFilteredResults(data.hits);
          setTotal(data.nbHits);
        });
    }, 1000);

    setLoading(true);
    performSearch();
    setLoading(false);
    return () => {};
  }, [query, api, searchSettings]);

  function handleChange(event) {
    setQuery(event.target.value);
  }

  return (
    <div className="relative overflow-y-scroll h-screen">
      <MenuBar
        setQuery={setQuery}
        query={query}
        handleChange={handleChange}
        api={api}
        setAPI={setAPI}
        total={total}
        searchSettings={searchSettings}
        updateSearchSettings={updateSearchSettings}
        setSettingsOpen={setSettingsOpen}
        settingsOpen={settingsOpen}
      />
      {/* <button className="bg-red-500" onClick={() => performInitialSearch(api)}>
        API
      </button> */}
      {/* <pre className="text-[6px]">{JSON.stringify(searchSettings, null, 2)}</pre> */}
      {/* <QueryEdit /> */}
      {/* <input
        type="text"
        className="bg-transparent border border-white border-opacity-30 rounded px-2 py-1 my-1"
        placeholder="Price from"
      /> */}
      <div className="flex flex-col md:flex-row px-2">
        {settingsOpen && (
          <Settings
            api={api}
            setAPI={setAPI}
            total={total}
            setSettingsOpen={setSettingsOpen}
            searchSettings={searchSettings}
            updateSearchSettings={updateSearchSettings}
            settingsOpen={settingsOpen}
          />
        )}
        <div className="container   mx-auto flex flex-row sm:flex-row gap-2 justify-center transition-all flex-wrap md:space-y-0 md:px-4">
          {isLoading && <div>Loading....</div>}
          {filteredResults.map((r, i) => (
            <VehicleCard num={i} key={r?.stock || i} v={r} />
          ))}
        </div>
      </div>

      {/* <pre className="text-xs">{JSON.stringify(results, null, 2)}</pre> */}
    </div>
  );
};

const MenuBar = ({
  setQuery,
  query,
  handleChange,
  api,
  setAPI,
  total,
  searchSettings,
  updateSearchSettings,
  settingsOpen,
  setSettingsOpen,
  ...props
}) => {
  return (
    <>
      <div className="flex ">
        <div className="border flex-grow m-2 md:m-4 rounded-lg focus-within:outline-2 focus-within:bg-white focus-within:bg-opacity-20  border-white border-opacity-25 flex items-center space-x-2 text-xl px-2">
          <MdSearch />
          <input
            className="bg-transparent px-2 py-1 w-full outline-none"
            value={query}
            onChange={handleChange}
            placeholder="Search Inventory...."
          />
          {query.length > 0 && (
            <button
              className="border rounded-full p-0.5 bg-white bg-opacity-0 hover:bg-opacity-20 transition-all"
              onClick={() => setQuery("")}
            >
              <MdClear />
            </button>
          )}
        </div>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setSettingsOpen((v) => !v)}
            className="border rounded-full p-1 text-2xl mr-3 ml-1 bg-white border-opacity-20 opacity-80 border-white bg-opacity-0 hover:bg-opacity-20 transition-all"
          >
            <MdSettings />
          </button>
        </div>
      </div>
    </>
  );
};
