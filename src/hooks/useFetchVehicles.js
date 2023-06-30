import React, { useState, useEffect } from "react";
import { camelCaseToProperCase, debounce } from "../utils";

const initialFacets = {
  price: [0, 100000],
  msrp: [0, 100000],
  year: [1990, 2024],
  mileage: [0, 300000],
  city_mpg: [0, 65],
  hw_mpg: [0, 65],
  cylinders: [0, 12],
  doors: [0, 10],
  days_in_stock: [0, 120],
};

const useFetchVehicles = (settings, facets = initialFacets, updateSettings) => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = debounce(async () => {
      const response = await fetch(
        `https://${settings.api["X-Algolia-Application-Id"]}-dsn.algolia.net/1/indexes/${settings.api.index}/query`,
        {
          headers: {
            "X-Algolia-API-Key": settings.api["X-Algolia-API-Key"],
            "X-Algolia-Application-Id":
              settings.api["X-Algolia-Application-Id"],
          },
          method: "POST",
          body: JSON.stringify({
            hitsPerPage: 10,
            query: settings.query,
            facetFilters: [
              generateTypeNewCertifiedUsed(settings.type),
              generateYearArray(settings.year),
              // ["location:cpo|purchase"],
            ],
            numericFilters: [
              // ...generateLabelArray(
              //   "cylinders",
              //   settings.cylinders,
              //   facets?.cylinders
              // ),
              // ...generateLabelArray("doors", settings.doors, facets?.doors),
              ...generateLabelArray(
                "days_in_stock",
                settings.days_in_stock,
                facets?.days_in_stock
              ),
              // ...generateLabelArray("hw_mpg", settings.hw_mpg, facets?.hw_mpg),
              // ...generateLabelArray(
              //   "city_mpg",
              //   settings.city_mpg,
              //   facets?.city_mpg
              // ),
              ...generateLabelArray("miles", settings.mileage, facets?.mileage),
              ...generateLabelArray("our_price", settings.price, facets?.price),
            ],
            facets,
          }),
        }
      );

      const data = await response.json();

      console.log(data?.facets_stats);
      // data?.facets_stats &&
      //   updateSearchSettings(data.facets_stats, "UPDATE_FACET_STATS");
      setVehicles(data.hits);
      //   setTotal(data.nbHits);
    }, 1000);

    setLoading(true);
    fetchVehicles();
    setLoading(false);
  }, [settings]);

  return [vehicles, isLoading];
};

const facets = [
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

function generateYearArray(yearRange) {
  const minYear = yearRange[0];
  const maxYear = yearRange[1];
  const yearArray = [];

  for (let year = minYear; year <= maxYear; year++) {
    yearArray.push(`year:${year}`);
  }

  return yearArray;
}

function generateTypeNewCertifiedUsed(type) {
  return Object.entries(type).reduce((acc, [label, val]) => {
    if (val) return [...acc, "type:" + camelCaseToProperCase(label)];
    return acc;
  }, []);
}

function generateLabelArray(label, labelRange, allowedRange) {
  const labelArray = [];
  if (
    labelRange?.[0] &&
    labelRange[0] >= allowedRange[0] // Update condition here
  ) {
    labelArray.push(`${label}>=${labelRange[0]}`);
  }

  if (
    allowedRange?.[1] &&
    labelRange?.[1] &&
    labelRange[1] <= allowedRange[1] // Update condition here
  ) {
    labelArray.push(`${label}<=${labelRange[1]}`);
  }

  return labelArray;
}

export default useFetchVehicles;

const facetStats = {
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
