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
  // If mileage is already zero, or a string equivalent, return an empty string
  if (mileage === 0 || mileage === "0" || mileage === "") {
    return "";
  }

  // Convert mileage to a number
  const numericMileage = Math.floor(
    Number(mileage.toString().replace(/\D/g, ""))
  );

  if (numericMileage < 100) {
    return "";
  }

  // Check if the mileage is under 1,000 and return "5 miles" in that case
  if (numericMileage < 1000) {
    return `${numericMileage} miles`; // Or any other specific string you want to return
  }

  // Otherwise, return the formatted mileage string with "k miles"
  return Math.floor(numericMileage / 1000) + "k miles";
}

export function formatCurrency(num, noDecimals = false) {
  let options = { style: "currency", currency: "USD" };

  if (noDecimals) {
    options.minimumFractionDigits = 0;
    options.maximumFractionDigits = 0;
  }

  return new Intl.NumberFormat("en-US", options).format(num);
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
  index:
    "rairdonshondaofburien-legacymigration0222_production_inventory_high_to_low",
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
  index6:
    "rairdonautomotivegroup_production_inventory_days_in_stock_low_to_high",
};

export const initialFilters = {
  query: "",
  api: burienAPI,
  totalFound: 0,
  hitsPerPage: 10,
  type: { new: true, certifiedUsed: true, used: true },
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

export const hondaColorMap = {
  B593M: "Aegean Blue",
  B637P: "Boost Blue",
  B638P: "Diffused Sky Blue",
  B640M: "Canyon River Blue",
  B588P: "Obsidian Blue",
  BKP: "Crystal Black",
  BT: "Aegean Blue",
  BU0: "Canyon River Blue",
  GA: "Sonic Gray",
  GC: "Meteorite Gray",
  GE: "Urban Gray",
  G553P: "Nordic Forest",
  NH575P: "Still Night",
  NH731P: "Crystal Black",
  NH797M: "Modern Steel",
  NH830M: "Lunar Silver",
  NH830MV: "Lunar Silver",
  NH877P: "Sonic Gray",
  NH883P: "Platinum White",
  NH883PV: "Platinum White",
  NH904M: "Meteorite Gray",
  NH912P: "Urban Gray",
  R513: "Rallye Red",
  R569M: "Radiant Red",
  R580M: "Radiant Red",
  R81: "Milano Red",
  RE: "Rallye Red",
  RL: "Radiant Red",
  RL0: "Radiant Red",
  RM0: "Radiant Red",
  SI0: "Lunar Silver",
  SX: "Lunar Silver",
  SV: "Lunar Silver",
  WX: "Platinum White",
  WY: "Platinum White",
  WZ: "Platinum White",
  // ... additional colors as needed
};

const hondaGenericColorMap = {
  "Aegean Blue": "Blue",
  "Boost Blue": "Blue",
  "Canyon River Blue": "Blue",
  "Crystal Black": "Black",
  "Diffused Sky Blue": "Blue",
  "Lunar Silver": "Silver",
  "Meteorite Gray": "Gray",
  "Milano Red": "Red",
  "Modern Steel": "Gray",
  "Nordic Forest": "Green",
  "Obsidian Blue": "Blue",
  "Platinum White": "White",
  "Radiant Red": "Red",
  "Rallye Red": "Red",
  "Sonic Gray": "Gray",
  "Still Night": "Blue",
  "Urban Gray": "Gray",
  // ... more mappings as needed
};

export function getColorNameByCode(code) {
  // Standardize the input code: remove non-alphanumeric characters and convert to upper case
  const standardizedCode = code.replace(/\W/g, "").toUpperCase();

  return hondaColorMap[standardizedCode] || code;
}

export function getGenericColor(specificColorName) {
  return hondaGenericColorMap[specificColorName] || specificColorName;
}

export const rairdonDealerships = {
  hob: {
    name: "Honda of Burien",
    address: "15026 1st Ave S, Burien, WA 98148",
    distanceToHoB: 0,
  },
  voe: {
    name: "Volkswagen of Everett",
    address: "10633 Evergreen Way, Everett, WA, 98204",
    distanceToHoB: 33.7,
  },
  dcjok: {
    name: "Dodge Chrysler Jeep of Kirkland",
    address: "12828 NE 124th St, Kirkland, WA 98034",
    distanceToHoB: 24.5,
  },
  dcjoma: {
    name: "Dodge Chrysler Jeep of Marysville",
    address: "16610 Smokey Point Blvd, Arlington, WA 98223",
    distanceToHoB: 52.1,
  },
  dcjomo: {
    name: "Dodge Chrysler Jeep of Monroe",
    address: "16413 W Main St, Monroe, WA 98272",
    distanceToHoB: 39.7,
  },
  dcjob: {
    name: "Dodge Chrysler Jeep of Bellingham",
    address: "1615 Iowa St, Bellingham, WA 98229",
    distanceToHoB: 99.6,
  },
  arok: {
    name: "Alfa Romeo of Kirkland",
    address: "12415 Slater Ave NE, Kirkland, WA 98034",
    distanceToHoB: 24.6,
  },
  mok: {
    name: "Maserati of Kirkland",
    address: "12415 Slater Ave NE, Kirkland, WA 98034",
    distanceToHoB: 24.6,
  },
  sob: {
    name: "Subaru of Auburn",
    address: "3025 Auburn Way N, Auburn, WA 98002",
    distanceToHoB: 16.4,
  },
  rao: {
    name: "Auto Outlet",
    address: "14555 1st Avenue S, Burien, WA 98166",
    distanceToHoB: 0.3,
  },
  hom: {
    name: "Honda of Marysville",
    address: "15714 Smokey Point Blvd, Marysville, WA 98271",
    distanceToHoB: 52.7,
  },
  hos: {
    name: "Honda of Sumner",
    address: "16302 Auto Ln, Sumner, WA 98390",
    distanceToHoB: 28.5,
  },
  noa: {
    name: "Nissan of Auburn",
    address: "713 35th St NE, Auburn, WA 98002",
    distanceToHoB: 16.2,
  },
  hobe: {
    name: "Hyundai of Bellingham",
    address: "1801 Iowa St, Bellingham, WA 98229",
    distanceToHoB: 99.8,
  },
  fok: {
    name: "FIAT of Kirkland",
    address: "12415 Slater Ave NE, Kirkland, WA 98034",
    distanceToHoB: 24.6,
  },
};

export const levenshteinDistance = (a, b) => {
  // Handle undefined or non-string inputs
  if (typeof a !== "string" || typeof b !== "string") {
    return a === b ? 0 : Math.max(a?.length || 0, b?.length || 0);
  }

  const matrix = [];

  // Initialize the matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Calculate distances
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

const calculateSimilarity = (str1, str2) => {
  // Handle undefined or non-string inputs
  if (typeof str1 !== "string" || typeof str2 !== "string") {
    return str1 === str2 ? 1 : 0; // Return 1 if both are equal (including both undefined), else 0
  }

  const distance = levenshteinDistance(str1, str2);
  const longestLength = Math.max(str1.length, str2.length);
  return (longestLength - distance) / longestLength;
};

export const normalizeAddress = (address) => {
  if (typeof address !== "string") {
    return "";
  }

  // Convert to lowercase and remove <br/>, spaces, periods, and commas
  return address.toLowerCase().replace(/<br\/?>|[\s.,]/gi, "");
};

export const parseAddress = (inputAddress) => {
  const normalizedInput = normalizeAddress(inputAddress);
  let highestScore = 0;
  let bestMatch = null;

  for (let key in rairdonDealerships) {
    const score = calculateSimilarity(
      normalizedInput,
      normalizeAddress(rairdonDealerships[key].address)
    );

    if (score > highestScore) {
      highestScore = score;
      bestMatch = rairdonDealerships[key];
    }
  }

  if (highestScore >= 0.8) {
    // 80% confidence threshold
    return bestMatch;
  } else {
    return { value: inputAddress };
  }
};
