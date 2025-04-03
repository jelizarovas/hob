export const dealership = {
  id: "hodaofburien",
  name: "Honda of Burien",
  shortName: "HofB",
  address: "15026 1st Ave S, Burien WA",
  phone: "(206) 489 2608",
  "X-Algolia-API-Key": "179608f32563367799314290254e3e44",
  "X-Algolia-Application-Id": "SEWJN80HTN",
  index: burienIndexes[0].index,
  indexes: burienIndexes,
  website: "burienhonda.com",
};

export const burienIndexes = [
  //DECEMBER 2024 THIS INDEX WAS REMOVED
  // {
  //   label: "Price  ⬆️",
  //   index:
  //     "rairdonshondaofburien-legacymigration0222_production_inventory_high_to_low",
  // },
  {
    label: "Price ⬇️  ",
    index:
      "rairdonshondaofburien-legacymigration0222_production_inventory_low_to_high",
  },
  {
    label: "Specials",
    index:
      "rairdonshondaofburien-legacymigration0222_production_inventory_specials_price",
  },
];
