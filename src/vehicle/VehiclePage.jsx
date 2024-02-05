import React, { useEffect } from "react";
import { MdClear, MdOutlineHistory } from "react-icons/md";
import { useParams, useHistory, useLocation } from "react-router-dom";
import { useSettings } from "../SettingsContext";
import { formatCurrency } from "../utils";
const api = {
  name: "Rairdon",
  "X-Algolia-API-Key": "ec7553dd56e6d4c8bb447a0240e7aab3",
  "X-Algolia-Application-Id": "V3ZOVI2QFZ",
  index: "rairdonautomotivegroup_production_inventory_low_to_high",
};

function getVehicleDataByStockNumber(stock) {
  return fetch(`https://${api["X-Algolia-Application-Id"]}-dsn.algolia.net/1/indexes/${api.index}/query`, {
    headers: {
      "X-Algolia-API-Key": api["X-Algolia-API-Key"],
      "X-Algolia-Application-Id": api["X-Algolia-Application-Id"],
    },
    method: "POST",
    body: JSON.stringify({
      hitsPerPage: 1,
      query: stock,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      return data.hits[0];
    });
}

export const VehiclePage = () => {
  const { stock } = useParams();
  const { state } = useLocation();
  const history = useHistory();

  const {
    settings: { vehicleListDisplayMode, showPrice, showCarfax },
  } = useSettings();

  const [v, setV] = React.useState(state);
  useEffect(() => {
    // Add event listener to detect when the modal is closed
    const handleCloseModal = () => {
      history.push("/"); // Redirect back to the home page when the modal is closed
    };
    window.addEventListener("modalCloseEvent", handleCloseModal);

    // Clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener("modalCloseEvent", handleCloseModal);
    };
  }, [history]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getVehicleDataByStockNumber(stock);
        setV(data);
      } catch (error) {
        // Handle error if the data fetching fails
        console.error("Error fetching vehicle data:", error);
      }
    };

    if (isObjectEmpty(v)) {
      fetchData();
    }
  }, [stock, v]);

  const handleModalClose = () => {
    // Dispatch the custom event to close the modal
    const closeEvent = new Event("modalCloseEvent");
    window.dispatchEvent(closeEvent);
  };

  function isObjectEmpty(obj) {
    if (typeof obj !== "object" || obj === null) {
      return true; // Treat non-object values as empty
    }

    return Object.keys(obj).length === 0;
  }

  if (isObjectEmpty(v)) getVehicleDataByStockNumber(stock);

  return (
    <div className="modal z-10 absolute top-0 left-0 w-full h-screen overflow-auto bg-gray-800">
      <div className="container mx-auto">
        <div className="flex items-center justify-between text-2xl">
          <span
            className="whitespace-pre-wrap  py-4 px-4 "
            // href={v?.link}
            // target="_blank"
          >
            {`${v?.year} ${v?.make} ${v?.model}`} <span className="opacity-40">{v?.trim}</span>
          </span>
          <div className="flex items-center">
            {showCarfax && (
              <a
                href={`http://www.carfax.com/VehicleHistory/p/Report.cfx?partner=DEY_0&vin=${v?.vin}`}
                target="_blank"
                aria-describedby="audioeye_new_window_message"
                className="rounded-full  p-2 border-white border-opacity-25 hover:bg-white hover:bg-opacity-20"
              >
                <MdOutlineHistory />
              </a>
            )}
            {showPrice && v?.our_price && (
              <span className="px-2 " onClick={() => console.log(v)}>
                {formatCurrency(v.our_price)}
              </span>
            )}
            <button className="text-2xl p-4" onClick={handleModalClose}>
              <MdClear />
            </button>
          </div>
        </div>

        <div className="flex flex-col space-x-4 lg:flex-row">
          <IframeComponent
            url={`https://photon360.dealerimagepro.com/v3/vdp?dealer=2835,2843,2838,2836,2837,2839,2842,2841,2840,2845,2844&vin=${v?.vin}&viewer=gallery`}
          />

          <div className="w-96">
            <ul>
              <li>
                <Label text="VIN" /> <span>{v?.vin}</span>
              </li>
              <li>
                <Label text="Mileage" /> <span>{v?.miles}</span>
              </li>
              <li>
                <Label text="Body" /> <span>{v?.body}</span>
              </li>
              <li>
                <Label text="Fuel Type" /> <span>{v?.fueltype}</span>
              </li>
              <li>
                <Label text="City MPG" /> <span>{v?.city_mpg}</span>
              </li>
              <li>
                <Label text="Highway MPG" /> <span>{v?.hw_mpg}</span>
              </li>
              <li>
                <Label text="Transmission" /> <span>{v?.transmission_description}</span>
              </li>
              <li>
                <Label text="Drivetrain" /> <span>{v?.drivetrain}</span>
              </li>
              <li>
                <Label text="Cylinders" /> <span>{v?.cylinders}</span>
              </li>
              <li>
                <Label text="Engine" /> <span>{v?.engine_description}</span>
              </li>
              <li>
                <Label text="Doors" /> <span>{v?.doors}</span>
              </li>
              <li>
                <Label
                  text="
                Exterior Color"
                />{" "}
                {v?.ext_color} ({v?.ext_color_generic})
              </li>
              <li>
                <Label text="Interior Color" /> {v?.int_color}
              </li>
              {/* <li>Location {v?.location}</li> */}
              <li>
                <Label text="Stock" /> {v?.stock}
              </li>
              {/* <li>Trim {v?.trim}</li> */}
              {/* <li>Type {v?.type}</li> */}
              {/* <li>Days In Stock {v?.days_in_stock}</li> */}
            </ul>
          </div>
        </div>
        <div className="px-2 mt-4 flex flex-col space-y-4">
          <div>
            <h4>Exterior Options</h4>
            <ul className="px-2 text-xs">
              {v?.ext_options && v.ext_options?.map((option, i) => <li key={i}>{option}</li>)}
            </ul>
          </div>
          <div>
            <h4>Features</h4>
            <ul className="px-2 text-xs">{v?.features && v.features?.map((option, i) => <li key={i}>{option}</li>)}</ul>
          </div>
          <div>
            <h4>Interior Options</h4>
            <ul className="px-2 text-xs">
              {v?.int_options && v.int_options?.map((option, i) => <li key={i}>{option}</li>)}
            </ul>
          </div>
        </div>
        {/* <pre className="bg-white bg-opacity-10 rounded border border-white border-opacity-20 text-xs w-full overflow-x-scroll">
          {JSON.stringify(v, null, 2)}
        </pre> */}
        {/* <h1>{v?.vin}</h1>
      <p>Stock: {stock}</p> */}
      </div>
    </div>
  );
};

const Label = ({ text }) => (
  <span className="opacity-70 uppercase text-xs leading-none mr-2 w-64 tunrcate min-w-64 ">{text}</span>
);

const IframeComponent = ({ url }) => {
  return (
    <iframe
      id="dipPhoton360Player"
      allowFullScreen={false}
      src={url}
      className="w-full max-w-[600px] h-[355px] lg:h-[520px]"
      // style={{ width: "100%", height: "100%" }}
    />
  );
};
