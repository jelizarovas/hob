import React, { useEffect, useState } from "react";

const SignatureEPad = ({ signature = {}, handleChange }) => {
  const [isSigCaptureEnabled, setIsSigCaptureEnabled] = useState(false);

  useEffect(() => {
    const isInstalled = document.documentElement.getAttribute(
      "sigcapturewebextension-installed"
    );
    setIsSigCaptureEnabled(isInstalled === "true");
    if (!signature?.imageData) clearFormData(); // Clear only if no existing signature
  }, []);

  const startSign = (e) => {
    if (e) e.preventDefault();

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
      imageTransparency: true,
      imageScaling: false,
      maxUpScalePercent: 0.0,
      rawDataFormat: "ENC",
      minSigPoints: 25,
    };

    document.addEventListener(
      "SigCaptureWeb_SignResponse",
      signResponse,
      false
    );

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
      alert(
        "An error occurred while capturing the signature. Please try again."
      );
    }
  };

  const setValues = (objResponse) => {
    const canvas = document.getElementById("cnv");
    const ctx = canvas.getContext("2d");

    if (objResponse.errorMsg) {
      alert(objResponse.errorMsg);
    } else if (objResponse.isSigned) {
      try {
        handleChange({
          target: { name: "signature.rawData", value: objResponse.rawData },
        });
        handleChange({
          target: { name: "signature.imageData", value: objResponse.imageData },
        });

        const img = new Image();
        img.onload = () =>
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        img.src = "data:image/png;base64," + objResponse.imageData;
      } catch (error) {
        console.error("Error setting signature data:", error);
        alert("Failed to process the signature. Please try again.");
      }
    }
  };

  const clearFormData = (e) => {
    if (e) e.preventDefault();
    if (signature?.imageData) return; // Prevent clearing if there is an existing signature
    try {
      handleChange({ target: { name: "signature.rawData", value: "" } });
      handleChange({ target: { name: "signature.imageData", value: "" } });
      const canvas = document.getElementById("cnv");
      if (canvas && canvas.getContext) {
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      }
    } catch (error) {
      console.error("Error clearing data:", error);
      alert("Failed to clear the signature data. Please try again.");
    }
  };

  console.log({ rawData: signature?.rawData });
  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg max-w-full">
      {isSigCaptureEnabled ? (
        <>
          <h2 className="text-xl mb-4">ePadLink SigCaptureWeb SDK</h2>
          <div className="relative w-full max-w-xl aspect-w-5 aspect-h-1 mb-4">
            <canvas
              id="cnv"
              width="500"
              height="100"
              className="border border-white  w-full h-full object-contain"
            ></canvas>
          </div>
          <div className="flex space-x-4 mb-4">
            <button
              onClick={startSign}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
            >
              Sign
            </button>
            <button
              onClick={clearFormData}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition"
            >
              Clear
            </button>
          </div>
        </>
      ) : (
        <div className="text-center p-4">
          <h2 className="text-xl mb-2">SigCaptureWeb SDK Not Enabled</h2>
          <p className="text-gray-400 mb-2">
            It looks like the SigCaptureWeb extension is not enabled. Please
            ensure it's installed.
          </p>
          <a
            href="https://chromewebstore.google.com/detail/epadlink-sigcaptureweb-sd/idldbjenlmipmpigmfamdlfifkkeaplc?hl=en-US&pli=1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            Download the extension here
          </a>
        </div>
      )}
      {signature?.imageData && (
        <img
          src={`data:image/png;base64,${signature.imageData}`}
          alt="Signature"
          className="border border-white mt-4 max-w-full rounded-xl"
        />
      )}
      {/* {signature?.rawData && <SignatureDisplay base64Data={signature?.rawData} />} */}
    </div>
  );
};

export default SignatureEPad;

// Function to decode base64 to binary string
const decodeBase64 = (base64) => {
  try {
    return atob(base64);
  } catch (error) {
    console.error("Error decoding base64:", error);
    return "";
  }
};

// Function to convert decoded raw data to SVG path
const convertRawDataToSVG = (rawData) => {
  if (!rawData) return "";

  const binaryData = decodeBase64(rawData);
  const pathData = [];
  let currentPath = "";
  let isFirstMove = true;
  let prevX = 0,
    prevY = 0;
  const scaleFactor = 0.1; // Adjust if needed

  for (let i = 0; i < binaryData.length; i += 8) {
    const x =
      (binaryData.charCodeAt(i) | (binaryData.charCodeAt(i + 1) << 8)) *
      scaleFactor;
    const y =
      (binaryData.charCodeAt(i + 2) | (binaryData.charCodeAt(i + 3) << 8)) *
      scaleFactor;
    const penUp = binaryData.charCodeAt(i + 4) !== 0;

    if (penUp) {
      if (currentPath) {
        pathData.push(
          `<path d="${currentPath}" stroke="white" fill="none" stroke-width="2"/>`
        );
      }
      currentPath = `M ${x},${y}`; // Move to new starting point
    } else {
      currentPath += ` L ${x},${y}`; // Draw line to next point
    }

    prevX = x;
    prevY = y;
  }

  if (currentPath) {
    pathData.push(
      `<path d="${currentPath}" stroke="white" fill="none" stroke-width="2"/>`
    );
  }

  console.log("SVG Path Data:", pathData.join("")); // Debugging
  return pathData.join("");
};

function SignatureDisplay({ base64Data }) {
  const [svgMarkup, setSvgMarkup] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!base64Data) {
      setError("No Base64 data provided");
      return;
    }

    try {
      // Decode the Base64 string
      const decodedSvg = atob(base64Data);
      console.log("Decoded SVG:", decodedSvg); // Log the decoded content for inspection

      // Check if the decoded content looks like SVG (should start with <svg or similar)
      if (!decodedSvg.trim().startsWith("<svg")) {
        setError("Decoded data does not appear to be valid SVG markup");
        return;
      }

      setSvgMarkup(decodedSvg);
      setError(null);
    } catch (error) {
      console.error("Base64 decoding error:", error);
      setError(`Decoding failed: ${error.message}`);
    }
  }, [base64Data]);

  return (
    <div>
      <h2>Signature Preview</h2>
      {error ? (
        <p style={{ color: "red" }}>Error: {error}</p>
      ) : svgMarkup ? (
        <div>
          <svg
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
            style={{
              width: "100%",
              maxWidth: "400px",
              height: "auto",
              border: "1px solid #ccc",
              backgroundColor: "#fff",
            }} // Added white background for visibility
          />
          <p>SVG content length: {svgMarkup.length} characters</p>
        </div>
      ) : (
        <p>Loading signature...</p>
      )}
    </div>
  );
}
