import React, { createContext, useContext, useState, useReducer, useRef } from "react";
import {
  burienAPI,
  initialFilters,
  rairdonAPI,
  camelCaseToProperCase,
  debounce,
  defaultFacetKeys,
  generateLabelArray,
  generateTypeNewCertifiedUsed,
  generateRangeArray,
} from "./utils";
import { useInfiniteQuery } from "react-query";
import { throttle } from "lodash";

const VehicleContext = createContext();

export const useVehicles = () => {
  return useContext(VehicleContext);
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

    case "UPDATE_INDEX":
      return {
        ...state,
        api: {
          ...state.api,
          index: payload,
        },
      };
    case "UPDATE_YEAR":
      return { ...state, year: payload };
    case "UPDATE_SETTINGS":
      return { ...state, ...payload };
    case "UPDATE_TYPE":
      return { ...state, type: { ...state.type, ...payload } };
    case "UPDATE_FACET_STATS":
      // console.log(payload);
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

export const VehicleProvider = ({ children }) => {
  const [filters, filtersDispatch] = useReducer(reducer, initialFilters);
  const [defaultFacets, setDefaultFacets] = useState({});
  const [defaultFacetsStats, setDefaultFacetsStats] = useState({});

  const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = useInfiniteQuery(
    ["vehicles", filters],
    ({ pageParam = 0 }) => fetchReq({ pageParam, filters, defaultFacetsStats }),
    {
      getNextPageParam: (lastPage, pages) => {
        const nextPage = (lastPage.page ?? -1) + 1;
        const hasNextPage = nextPage < lastPage.nbPages;
        return hasNextPage ? nextPage : undefined;
      },
    }
  );

  const loadMoreRef = React.useRef(null);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const { facets, facets_stats } = await fetchReq({ filters: { ...filters, query: "", hitsPerPage: 1 } });

        if (facets) setDefaultFacets(facets);
        if (facets_stats) setDefaultFacetsStats(facets_stats);
      } catch (error) {
        console.error("Failed to fetch default data", error);
      }
    }

    fetchData();
  }, []);

  React.useEffect(() => {
    if (isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Check if the sentinel is in viewport

        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 } // 1.0 means that the sentinel is fully visible
    );

    // Start observing
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    // Cleanup
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  const updateFilters = (payload) => {
    filtersDispatch({ type: "UPDATE_SETTINGS", payload });
  };
  const updateQuery = (payload) => {
    filtersDispatch({ type: "QUERY", payload });
  };

  console.log({ data });

  return (
    <VehicleContext.Provider
      value={{
        filters,
        updateFilters,
        filtersDispatch,
        fetchNextPage,
        data,
        error,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        status,
        loadMoreRef,
        updateQuery,
        defaultFacets,
        defaultFacetsStats,
      }}
    >
      {/* <pre>{JSON.stringify(filters,null,2)}</pre> */}
      {children}
    </VehicleContext.Provider>
  );
};
//seems to not work at all ----> debug
// const throttledFetchReq = throttle(fetchReq, 1000);

async function fetchReq({ pageParam = 0, filters, defaultFacetsStats }) {
  const api = filters.api || burienAPI;
  const query = filters.query || "";
  const hitsPerPage = filters.hitsPerPage || 10;

  const facetFilterPairs = [
    [filters.type, generateTypeNewCertifiedUsed],
    // generateRangeArray("year", filters.year),
    // generateListArray("location", filters?.location),
    // generateListArray("make", filters?.make),
    // generateListArray("body", filters?.body),
    // generateListArray("trim", filters?.trim),
    // generateListArray("doors", filters?.doors),
    // generateListArray("model", filters?.model),
    // generateListArray("ext_color", filters?.ext_color),
    // generateListArray("int_color", filters?.int_color),
    // ["location:15026 1st Ave S<br/>Burien, WA 98148"],
  ];

  const facetFilters = generateFacetFilters(facetFilterPairs);

  const numericFilters = [
    //   ...generateLabelArray("days_in_stock", filters.days_in_stock, facetsStats?.days_in_stock),
    //   ...generateLabelArray("miles", filters.mileage, facetsStats?.miles),
    ...generateLabelArray("our_price", filters.price, defaultFacetsStats?.our_price),
  ];

  const res = await fetch(`https://${api["X-Algolia-Application-Id"]}-dsn.algolia.net/1/indexes/${api.index}/query`, {
    headers: {
      "X-Algolia-API-Key": api["X-Algolia-API-Key"],
      "X-Algolia-Application-Id": api["X-Algolia-Application-Id"],
    },
    method: "POST",
    body: JSON.stringify({
      hitsPerPage,
      query,
      page: pageParam,
      facetFilters,
      numericFilters,
      facets: defaultFacetKeys,
    }),
  });
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
}

function generateFacetFilters(filterPairs) {
  return filterPairs.reduce((acc, [val, fun]) => {
    if (val) {
      // Check if the value is not null, undefined, or empty
      acc.push(fun(val)); // Push the result of the function if value exists
    }
    return acc;
  }, []);
}
