import React, { useEffect } from "react";

const SignatureEPad = ({ signature = {}, handleChange }) => {
  const startSign = (e) => {
    if (e) e.preventDefault(); // Prevent form update

    const canvas = document.getElementById("cnv");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const message = {
      firstName: "",
      lastName: "",
      eMail: "",
      location: "",
      imageFormat: 1,
      imageX: canvas.width,
      imageY: canvas.height,
      imageTransparency: false,
      imageScaling: false,
      maxUpScalePercent: 0.0,
      rawDataFormat: "ENC",
      minSigPoints: 25,
    };

    document.addEventListener("SigCaptureWeb_SignResponse", signResponse, false);

    const messageData = JSON.stringify(message);
    const element = document.createElement("SigCaptureWeb_ExtnDataElem");
    element.setAttribute("SigCaptureWeb_MsgAttribute", messageData);
    document.body.appendChild(element);

    const evt = new CustomEvent("SigCaptureWeb_SignStartEvent", {
      bubbles: true,
      cancelable: false,
    });
    element.dispatchEvent(evt);
  };

  const signResponse = (event) => {
    try {
      const str = event.target.getAttribute("SigCaptureWeb_msgAttri");
      const obj = JSON.parse(str);
      setValues(obj);
    } catch (error) {
      console.error("Error parsing signature data:", error);
      alert("An error occurred while capturing the signature. Please try again.");
    }
  };

  const setValues = (objResponse) => {
    const canvas = document.getElementById("cnv");
    const ctx = canvas.getContext("2d");

    if (objResponse.errorMsg) {
      alert(objResponse.errorMsg);
    } else if (objResponse.isSigned) {
      try {
        handleChange({ target: { name: "signature.rawData", value: objResponse.rawData } });
        handleChange({ target: { name: "signature.imageData", value: objResponse.imageData } });

        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        img.src = "data:image/png;base64," + objResponse.imageData;
      } catch (error) {
        console.error("Error setting signature data:", error);
        alert("Failed to process the signature. Please try again.");
      }
    }
  };

  const clearFormData = (e) => {
    if (e) e.preventDefault(); // Prevent form update
    try {
      handleChange({ target: { name: "signature.rawData", value: "" } });
      handleChange({ target: { name: "signature.imageData", value: "" } });
      const canvas = document.getElementById("cnv");
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    } catch (error) {
      console.error("Error clearing data:", error);
      alert("Failed to clear the signature data. Please try again.");
    }
  };

  useEffect(() => {
    clearFormData();
  }, []);

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg max-w-full">
      <h2 className="text-xl mb-4">ePadLink SigCaptureWeb SDK</h2>
      <div className="relative w-full max-w-xl aspect-w-5 aspect-h-1 mb-4">
        <canvas
          id="cnv"
          width="500"
          height="100"
          className="border border-white bg-gray-800 w-full h-full object-contain"
        ></canvas>
      </div>
      <div className="flex space-x-4 mb-4">
        <button onClick={startSign} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition">
          Sign
        </button>
        <button onClick={clearFormData} className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition">
          Clear
        </button>
      </div>
      {signature?.imageData && (
        <img
          src={`data:image/png;base64,${signature.imageData}`}
          alt="Signature"
          className="border border-white mt-4 max-w-full"
        />
      )}
    </div>
  );
};

export default SignatureEPad;
