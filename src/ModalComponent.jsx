import React, { useEffect } from "react";
import { MdClear } from "react-icons/md";
import { useParams, useHistory, useLocation } from "react-router-dom";

const ModalComponent = () => {
  const { stock } = useParams();
  const { state: v } = useLocation();
  const history = useHistory();
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

  const handleModalClose = () => {
    // Dispatch the custom event to close the modal
    const closeEvent = new Event("modalCloseEvent");
    window.dispatchEvent(closeEvent);
  };

  return (
    <div className="modal z-10 absolute top-0 left-0 w-full h-screen overflow-auto bg-gray-800">
      <div className="container mx-auto">
        <div className="flex justify-between">
          <span
            className="whitespace-pre-wrap text-2xl py-4 px-4 "
            // href={v?.link}
            // target="_blank"
          >
            {`${v?.year} ${v?.make} ${v?.model}`}{" "}
            <span className="opacity-40">{v?.trim}</span>
          </span>
          <button className="text-2xl p-4" onClick={handleModalClose}>
            <MdClear />
          </button>
        </div>

        <div className="flex flex-col space-x-4 lg:flex-row">
          <IframeComponent
            url={`https://photon360.dealerimagepro.com/v3/vdp?dealer=2835,2843,2838,2836,2837,2839,2842,2841,2840,2845,2844&vin=${v?.vin}&viewer=gallery`}
          />

          <div className="w-64">
            <ul>
              <li>VIN: {v?.vin}</li>
              <li>Mileage: {v?.miles}</li>
              <li>Body: {v?.body}</li>
              <li>Fuel Type: {v?.fueltype}</li>
              <li>City MPG: {v?.city_mpg}</li>
              <li>Highway MPG: {v?.hw_mpg}</li>
              <li>Transmission: {v?.transmission_description}</li>
              <li>Drivetrain: {v?.drivetrain}</li>
              <li>Cylinders: {v?.cylinders}</li>
              <li>Engine: {v?.engine_description}</li>
              <li>Doors: {v?.doors}</li>
              <li>
                Exterior Color: {v?.ext_color} ({v?.ext_color_generic})
              </li>
              <li>Interior Color: {v?.int_color}</li>
              {/* <li>Location: {v?.location}</li> */}
              <li>Stock: {v?.stock}</li>
              {/* <li>Trim: {v?.trim}</li> */}
              {/* <li>Type: {v?.type}</li> */}
              {/* <li>Days In Stock: {v?.days_in_stock}</li> */}
            </ul>
          </div>
        </div>
        <h4>Exterior Options</h4>
        <ul>
          {v?.ext_options &&
            v.ext_options.map((option, i) => <li key={i}>{option}</li>)}
        </ul>
        <h4>Features</h4>
        <ul>
          {v?.features &&
            v.features.map((option, i) => <li key={i}>{option}</li>)}
        </ul>
        <h4>Interior Options</h4>
        <ul>
          {v?.int_options &&
            v.int_options.map((option, i) => <li key={i}>{option}</li>)}
        </ul>

        {/* <pre className="bg-white bg-opacity-10 rounded border border-white border-opacity-20 text-xs w-full overflow-x-scroll">
          {JSON.stringify(v, null, 2)}
        </pre> */}
        {/* <h1>{v?.vin}</h1>
      <p>Stock: {stock}</p> */}
      </div>
    </div>
  );
};

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

export default ModalComponent;
