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
  hitsPerPage: [0, 100],
};

async function fetchReq(api, body) {
  return fetch(
    `https://${api["X-Algolia-Application-Id"]}-dsn.algolia.net/1/indexes/${api.index}/query`,
    {
      headers: {
        "X-Algolia-API-Key": api["X-Algolia-API-Key"],
        "X-Algolia-Application-Id": api["X-Algolia-Application-Id"],
      },
      method: "POST",
      body: JSON.stringify(body),
    }
  );
}

const useFetchVehicles = (settings, updateSettings) => {
  const [vehicles, setVehicles] = useState([]);
  const [facets, setFacets] = useState({});
  const [facetsStats, setFacetsStats] = useState({});
  const [total, setTotal] = useState(0);
  const [defaultFacets, setDefaultFacets] = useState({});
  const [defaultFacetsStats, setDefaultFacetsStats] = useState({});
  const [defaultTotal, setDefaultTotal] = useState(0);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDefaultFacets = debounce(async () => {
      const response = await fetchReq(settings.api, {
        hitsPerPage: 1,
        facetFilters: [generateTypeNewCertifiedUsed(settings.type)],
        facets: defaultFacetKeys,
      });
      const data = await response.json();
      setDefaultTotal(data.nbHits);
      setDefaultFacets(data.facets);
      setDefaultFacetsStats(data.facets_stats);
    }, 1000);
    console.log("GETTING DEFAULTS!");
    fetchDefaultFacets();
  }, [settings.api, settings.type]);

  useEffect(() => {
    const fetchVehicles = debounce(async () => {
      const response = await fetchReq(settings.api, {
        hitsPerPage: settings.hitsPerPage,
        query: settings.query,
        facetFilters: [
          generateTypeNewCertifiedUsed(settings.type),
          generateRangeArray("year", settings.year),
          // ["location:cpo|purchase"],
        ],
        numericFilters: [
          ...generateLabelArray(
            "days_in_stock",
            settings.days_in_stock,
            facetsStats?.days_in_stock
          ),
          ...generateLabelArray("miles", settings.mileage, facetsStats?.miles),
          ...generateLabelArray(
            "our_price",
            settings.price,
            facetsStats?.our_price
          ),
        ],
        facets: defaultFacetKeys,
      });

      const data = await response.json();
      setVehicles(data.hits);
      setTotal(data.nbHits);
      setFacets(data.facets);
      setFacetsStats(data.facets_stats);
    }, 1000);

    setLoading(true);
    fetchVehicles();
    setLoading(false);
  }, [settings]);

  return {
    vehicles,
    isLoading,
    total,
    facets,
    facetsStats,
    defaultTotal,
    defaultFacets,
    defaultFacetsStats,
  };
};

const defaultFacetKeys = [
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

function generateRangeArray(label, range, allowedRange) {
  const minYear = range[0] || 1990;
  const maxYear = range[1] || 2023;
  const arr = [];

  for (let i = minYear; i <= maxYear; i++) {
    arr.push(`${label}:${i}`);
  }
  return arr;
}

function generateTypeNewCertifiedUsed(type) {
  return Object.entries(type).reduce((acc, [label, val]) => {
    if (val) return [...acc, "type:" + camelCaseToProperCase(label)];
    return acc;
  }, []);
}

function generateLabelArray(label, range, allowedRange) {
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
