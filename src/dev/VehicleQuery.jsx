import React from "react";

import { VehicleCard } from "../vehicle/VehicleCard";

export const VehicleQuery = () => {
  const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = useInfiniteQuery(
    ["vehicles"],
    fetchReq,
    {
      getNextPageParam: (lastPage, pages) => {
        const nextPage = (lastPage.page ?? -1) + 1;
        const hasNextPage = nextPage < lastPage.nbPages;
        return hasNextPage ? nextPage : undefined;
      },
    }
  );

  const loadMoreRef = React.useRef(null);
  console.log(data);

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

  return status === "loading" ? (
    <p>Loading...</p>
  ) : status === "error" ? (
    <p>Error: {error.message}</p>
  ) : (
    <>
      {data.pages.map((group, i) => (
        <React.Fragment key={i}>
          {group.hits.map((v) => (
            <VehicleCard num={i} key={v?.vin || i} v={v} />
          ))}
        </React.Fragment>
      ))}
      <div>
        <button onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>
          {isFetchingNextPage ? "Loading more..." : hasNextPage ? "Load More" : "Nothing more to load"}
        </button>
      </div>
      <div ref={loadMoreRef}></div>
      <div>{isFetching && !isFetchingNextPage ? "Fetching..." : null}</div>
    </>
  );
};

async function fetchReq({ pageParam = 0, filters = {} }) {
  const api = burienAPI;
  const query = filters.query || "";
  const hitsPerPage = 10;
  const res = await fetch(`https://${api["X-Algolia-Application-Id"]}-dsn.algolia.net/1/indexes/${api.index}/query`, {
    headers: {
      "X-Algolia-API-Key": api["X-Algolia-API-Key"],
      "X-Algolia-Application-Id": api["X-Algolia-Application-Id"],
    },
    method: "POST",
    body: JSON.stringify({ hitsPerPage, query, page: pageParam }),
  });
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
}

const burienAPI = {
  name: "Burien",
  "X-Algolia-API-Key": "179608f32563367799314290254e3e44",
  "X-Algolia-Application-Id": "SEWJN80HTN",
  index: "rairdonshondaofburien-legacymigration0222_production_inventory_high_to_low",
};
