import { useReducer } from "react";

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

const initialSettings = {
  query: "",
  api: burienAPI,
  totalFound: 0,
  hitsPerPage: 10,
  type: { new: false, certifiedUsed: true, used: true },
  price: [null /*min*/, null /*max*/],
  msrp: [null /*min*/, null /*max*/],
  year: [1995 /*min*/, 2024 /*max*/],
  mileage: [null /*min*/, null /*max*/],
  city_mpg: [null /*min*/, null /*max*/],
  hw_mpg: [null /*min*/, null /*max*/],
  cylinders: [null /*min*/, null /*max*/],
  doors: [null /*min*/, null /*max*/],
  days_in_stock: [null /*min*/, null /*max*/],
  make: [[null /*included*/], [null /*excluded*/]],
  model: [[null /*included*/], [null /*excluded*/]],
  color: [[null /*included*/], [null /*excluded*/]],
  engine: [[null /*included*/], [null /*excluded*/]],
  body: [[null /*included*/], [null /*excluded*/]],
  trim: [[null /*included*/], [null /*excluded*/]],
  features: [[null /*included*/], [null /*excluded*/]],
  fuelType: [[null /*included*/], [null /*excluded*/]],
  transmission: [[null /*included*/], [null /*excluded*/]],
};

const reducer = (state, { type, payload }) => {
  switch (type) {
    case "QUERY":
      return { ...state, query: payload };
    case "UPDATE_API":
      return {
        ...state,
        api: payload === "burienApi" ? burienAPI : rairdonAPI,
      };
    case "UPDATE_YEAR":
      return { ...state, year: payload };
    case "UPDATE_SETTINGS":
      return { ...state, ...payload };
    case "UPDATE_TYPE":
      return { ...state, type: { ...state.type, ...payload } };
    case "UPDATE_FACET_STATS":
      console.log(payload);
      return {
        ...state,
        price: [payload["our_price"]["min"], payload["our_price"]["max"]],
        year: [payload.year.min, payload.year.max],
        mileage: [payload.miles.min, payload.miles.max],
        city_mpg: [payload.city_mpg.min, payload.city_mpg.max],
        hw_mpg: [payload.hw_mpg.min, payload.hw_mpg.max],
        days_in_stock: [payload.days_in_stock.min, payload.days_in_stock.max],
        cylinders: [payload.cylinders.min, payload.cylinders.max],
        doors: [payload.doors.min, payload.doors.max],
      };
    default:
      throw new Error(`Unsupported action type: ${type}`);
  }
};

const useSearchSettings = () => {
  const [state, dispatch] = useReducer(reducer, initialSettings);

  const updateSearchSettings = (type, payload) => {
    dispatch({ type: type || "UPDATE_SETTINGS", payload });
  };

  return [state, updateSearchSettings];
};

export default useSearchSettings;

const locationArray = [
  "713 35th St. NE<br/>Auburn, WA 98002",
  "1615 Iowa St<br/>Bellingham, WA 98229",
  "12415 Slater NE<br/>Kirkland, WA 98034",
  "12828 NE 124th St<br/>Kirkland, WA 98034",
  "14555 1st Avenue South<br/>Burien, WA 98166",
  "15026 1st Ave S<br/>Burien, WA 98148",
  "15714 Smokey Point Blvd<br/>Marysville, WA 98271",
  "16302 Auto Ln<br/>Sumner, WA 98390",
  "16413 W. Main St. SE<br/>Monroe, WA 98272",
  "16610 Smokey Point Blvd<br/>Arlington, WA 98223",
  "cpo|purchase",
  "cpo|sslp",
  "cpo|trade",
  "incoming|trade",
  "purchase",
  "purchase|recall6-22",
  "trade",
  "transfer",
  "transfer|uvi-bellingham",
  "transfer|uvi-marysville",
  "transfer|uvi-sumner",
];

const lightningLocationsMetaLocation = [
  "Dodge Chrysler Jeep Ram of Bellingham",
  "Dodge Chrysler Jeep Ram of Kirkland",
  "Dodge Chrysler Jeep Ram of Monroe",
  "Honda of Burien",
  "Honda of Marysville",
  "Honda of Sumner",
  "Hyundai of Bellingham",
  "Rairdon's Dodge Chrysler Jeep Ram of Marysville",
  "Subaru of Auburn",
];
