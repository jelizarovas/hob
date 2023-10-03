export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

export function camelCaseToProperCase(str) {
  // Replace capital letters with space and the letter itself
  const spacedStr = str.replace(/([A-Z])/g, " $1");
  // Capitalize the first letter and maintain the case of the subsequent letters
  const properCaseStr = spacedStr.charAt(0).toUpperCase() + spacedStr.slice(1);
  return properCaseStr;
}

export function parseMileage(mileage) {
  return Math.floor(Number(mileage.toString().replace(/\D/g, "")) / 1000) + "k miles";
}

export function formatCurrency(num) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
}

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
        index: "rairdonshondaofburien-legacymigration0222_production_inventory_high_to_low",
      },
      {
        name: "Rairdon",
        "X-Algolia-API-Key": "ec7553dd56e6d4c8bb447a0240e7aab3",
        "X-Algolia-Application-Id": "V3ZOVI2QFZ",
        index: "rairdonautomotivegroup_production_inventory_low_to_high",
      },
    ],
    description: "Choose a preferred store for searching within a specific dealership.",
    value: 0,
  },
];

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

export const defaultFacetKeys = [
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
  "vdp",
  "gallery",
  "vdp_gallery",
];

export const facetStats = {
  city_mpg: { min: 0, max: 124, avg: 29, sum: 4472 },
  cylinders: { min: 0, max: 8, avg: 4, sum: 693 },
  days_in_stock: { min: 1, max: 66, avg: 21, sum: 3313 },
  doors: { min: 2, max: 4, avg: 3, sum: 602 },
  hw_mpg: { min: 0, max: 101, avg: 34, sum: 5307 },
  miles: { min: 4225, max: 149795, avg: 60801, sum: 9363393 },
  msrp: { min: 0, max: 0, avg: 0, sum: 0 },
  our_price: { min: 8888, max: 68888, avg: 24226, sum: 3682381 },
  year: { min: 2004, max: 2022, avg: 2017, sum: 310713 },
};

export const initialFacets = {
  price: [0, 100000],
  msrp: [0, 100000],
  year: [1990, 2024],
  mileage: [0, 300000],
  city_mpg: [0, 65],
  hw_mpg: [0, 65],
  cylinders: [0, 12],
  doors: [0, 10],
  days_in_stock: [0, 120],
  hitsPerPage: [0, 100],
};

export function generateRangeArray(label, range, allowedRange) {
  const minYear = range[0] || 1990;
  const maxYear = range[1] || 2023;
  const arr = [];

  for (let i = minYear; i <= maxYear; i++) {
    arr.push(`${label}:${i}`);
  }
  return arr;
}

export function generateTypeNewCertifiedUsed(type) {
  return Object.entries(type).reduce((acc, [label, val]) => {
    if (val) return [...acc, "type:" + camelCaseToProperCase(label)];
    return acc;
  }, []);
}
export function generateListArray(list, data) {
  console.log({ list, data });
  if (!data) return [];
  return data.map((val) => `${list}:${val}`);
}

export function generateLabelArray(label, range, allowedRange) {
  if (!range || !allowedRange) return [];
  console.log(label, range, allowedRange);
  const labelArray = [];
  if (allowedRange?.min && range?.[0] && range[0] >= allowedRange?.min) {
    labelArray.push(`${label}>=${range[0]}`);
  }

  if (allowedRange?.max && range?.[1] && range[1] <= allowedRange.max) {
    labelArray.push(`${label}<=${range[1]}`);
  }
  console.log(labelArray);
  return labelArray;
}

export const burienAPI = {
  name: "Burien",
  "X-Algolia-API-Key": "179608f32563367799314290254e3e44",
  "X-Algolia-Application-Id": "SEWJN80HTN",
  index: "rairdonshondaofburien-legacymigration0222_production_inventory_high_to_low",
};

export const rairdonAPI = {
  name: "Rairdon",
  "X-Algolia-API-Key": "ec7553dd56e6d4c8bb447a0240e7aab3",
  "X-Algolia-Application-Id": "V3ZOVI2QFZ",
  index: "rairdonautomotivegroup_production_inventory_low_to_high",
  index2: "rairdonautomotivegroup_production_inventory_high_to_low",
  index3: "rairdonautomotivegroup_production_inventory_specials_price",
  index4: "rairdonautomotivegroup_production_inventory_mileage_low_to_high",
  index5: "rairdonautomotivegroup_production_inventory_mileage_high_to_low",
  index6: "rairdonautomotivegroup_production_inventory_days_in_stock_low_to_high",
};

export const initialFilters = {
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
  location: [],
  make: [],
  body: [],
  trim: [],
  doors: [],
  model: [],
  ext_color: [],
  int_color: [],
};
