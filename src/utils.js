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
