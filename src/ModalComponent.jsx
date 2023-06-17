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

      <>
        <IframeComponent
          url={`https://photon360.dealerimagepro.com/v3/vdp?dealer=2835,2843,2838,2836,2837,2839,2842,2841,2840,2845,2844&vin=${v?.vin}&viewer=gallery`}
        />

        <pre className="bg-white bg-opacity-10 rounded border border-white border-opacity-20 text-xs w-full overflow-x-scroll">
          {JSON.stringify(v, null, 2)}
        </pre>
      </>
      {/* <h1>{v?.vin}</h1>
      <p>Stock: {stock}</p> */}
    </div>
  );
};

const IframeComponent = ({ url }) => {
  return (
    <iframe
      id="dipPhoton360Player"
      allowFullScreen={false}
      src={url}
      className="w-full max-w-[600px] h-[600px] lg:h-[520px]"
      // style={{ width: "100%", height: "100%" }}
    />
  );
};

export default ModalComponent;
