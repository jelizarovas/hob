import React, { useState, useEffect } from "react";
import { camelCaseToProperCase, debounce } from "../utils";

const useFetchVehicles = (settings, updateSettings) => {
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
            hitsPerPage: 100,
            query: settings.query,
            facetFilters: [
              Object.entries(settings.type).reduce((acc, [label, val]) => {
                if (val)
                  return [...acc, "type:" + camelCaseToProperCase(label)];
                return acc;
              }, []),
              // ["year:2022"],
              // ["location:cpo|purchase"],
            ],
            // facetFilters: [
            //   [
            //     settings.type.new && "type:New",
            //     settings.type.used && "type:Used",
            //     settings.type.certifiedUsed && "type:Certified Used",
            //   ],
            //   ["year:2022", "year:2019", "year:2017"],
            // ], //"type:New",
            // numericFilters: [
            //   "miles>=48494",
            //   "our_price<=26299",
            //   "our_price>=22799",
            // ],
            facets: [
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
              // "trim",
              // "body",
              // "doors",
              // "miles",
              // "ext_color_generic",
              // "features",
              // "lightning.isSpecial",
              // "lightning.locations",
              // "lightning.status",
              // "lightning.class",
              // "fueltype",
              // "engine_description",
              // "transmission_description",
              // "metal_flags",
              // "city_mpg",
              // "hw_mpg",
              // "days_in_stock",
              // "ford_SpecialVehicle",
              // "lightning.locations.meta_location",
              // "ext_color",
              // "title_vrp",
              // "int_color",
              // "certified",
              // "lightning",
              // "location",
              // "drivetrain",
              // "int_options",
              // "ext_options",
              // "cylinders",
              // "vin",
              // "stock",
              // "msrp",
              // "our_price_label",
              // "finance_details",
              // "lease_details",
              // "thumbnail",
              // "link",
              // "objectID",
              // "algolia_sort_order",
              // "date_modified",
              // "hash",
              // "vdp",
              // "gallery",
              // "vdp_gallery",
            ],
          }),
        }
      );

      const data = await response.json();

      console.log({ data });
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

export default useFetchVehicles;
