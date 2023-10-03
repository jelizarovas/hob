import React, { useState, useEffect } from "react";
import { camelCaseToProperCase, debounce, defaultFacetKeys, generateLabelArray, generateTypeNewCertifiedUsed } from "../utils";


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
          generateTypeNewCertifiedUsed(filters.type),
          // generateRangeArray("year", filters.year),
          // generateListArray("location", filters?.location),
          // generateListArray("make", filters?.make),
          // generateListArray("body", filters?.body),
          // generateListArray("trim", filters?.trim),
          // generateListArray("doors", filters?.doors),
          // generateListArray("model", filters?.model),
          // generateListArray("ext_color", filters?.ext_color),
          // generateListArray("int_color", filters?.int_color),
          // ["location:cpo|purchase"],
        ],
        numericFilters: [
          ...generateLabelArray(
            "days_in_stock",
            filters.days_in_stock,
            facetsStats?.days_in_stock
          ),
          ...generateLabelArray("miles", filters.mileage, facetsStats?.miles),
          ...generateLabelArray(
            "our_price",
            filters.price,
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




export default useFetchVehicles;

