import React, { useState } from "react";
import { PDFDocument, StandardFonts } from "pdf-lib";
import JsBarcode from "jsbarcode";
import { useLocation, Link } from "react-router-dom";

export const BarCode = () => {
  const [vins, setVins] = React.useState([]);
  const [vinInput, setVinInput] = React.useState("");

  const addVin = () => {
    if (vinInput) {
      setVins([...vins, vinInput]);
      setVinInput("");
    }
  };

  const { search } = useLocation();

  const queryParams = new URLSearchParams(search);
  const vin = queryParams.get("vin");

  React.useEffect(() => {
    if (vin !== null) {
      setVinInput(vin);
    }
  }, [vin]);

  const generatePdf = async () => {
    let vinsToProcess = vins.length > 0 ? vins : [vinInput];

    const pageWidth = 8.5 * 72;
    const pageHeight = 11 * 72;
    const paddingTop = 20;

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    const { width, height } = page.getSize();

    const barcodesPerPage = Math.floor((pageHeight - paddingTop * 2) / 71) - 1; // Adjust this number based on your requirements
    let barcodeCount = 0;

    for (const vin of vinsToProcess) {
      if (barcodeCount > barcodesPerPage) {
        page = pdfDoc.addPage(); // Add a new page
        barcodeCount = 0; // Reset the count for the new page
      }

      const barcodeCanvas = document.createElement("canvas");
      JsBarcode(barcodeCanvas, vin, { format: "CODE39" });
      const barcodeDataUrl = barcodeCanvas.toDataURL("image/png");
      const barcodeImage = await pdfDoc.embedPng(barcodeDataUrl);
      const barcodeDims = barcodeImage.scale(0.5);

      const barcodePositionY = height - paddingTop - barcodeDims.height * (barcodeCount + 1);

      console.log({ width, height, barcodeDims, barcodePositionY });

      page.drawImage(barcodeImage, {
        x: 50,
        y: barcodePositionY,
        width: barcodeDims.width,
        height: barcodeDims.height,
      });

      barcodeCount++;
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col">
      
      <div className="flex flex-col w-96 mx-auto my-10 bg-slate-800 text-black rounded py-2 px-2">
        <input
          type="text"
          value={vinInput}
          onChange={(e) => setVinInput(e.target.value)}
          placeholder="Enter VIN"
          className="mx-2 px-4 py-1 rounded text-center text-xl my-2"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.ctrlKey) {
              e.preventDefault(); // Prevent default Enter key behavior (like submitting a form)
              addVin();
            } else if (e.key === "Enter" && e.ctrlKey) {
              e.preventDefault(); // Prevent default Ctrl+Enter key behavior
              generatePdf();
            }
          }}
        />
        <div className="flex justify-evenly">
          <button onClick={generatePdf} className="bg-green-500 hover:bg-lime-500 mx-2 rounded my-2 w-full">
            Generate Barcode
          </button>
          <button onClick={addVin} className="bg-green-500 hover:bg-lime-500 mx-2 rounded my-2 w-full">
            Add to List
          </button>
        </div>

        {vins.length > 0 && (
          <div>
            <span className="px-4 py-2 text-xs text-sky-500">List to Process</span>
            <ul className="px-4 text-white">
              {vins.map((vin, index) => (
                <li key={index}>{vin}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const Input = ({ name, label, value, onBlur, onChange, placeHolder, autoFocus = false }) => {
  return (
    <label htmlFor={name} className="flex flex-col">
      <span className="text-xs text-white leading-none">{label}</span>
      <input
        type="text"
        className="px-2 py-1 rounded my-1"
        name={name}
        onBlur={onBlur}
        value={value || ""}
        onChange={onChange}
        placeholder={placeHolder}
        spellCheck={false}
        autoComplete="false"
        autoFocus={autoFocus}
      />
    </label>
  );
};

const fetchVINData = async (vin) => {
  try {
    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
    const data = await response.json();

    const results = data.Results;
    const decodedData = {
      vin,
      year: results.find((r) => r.Variable === "Model Year")?.Value,
      make: results.find((r) => r.Variable === "Make")?.Value,
      model: results.find((r) => r.Variable === "Model")?.Value,
    };

    return decodedData;
  } catch (error) {
    console.error("Error fetching VIN data:", error);
    // You can throw the error or return a default value depending on how you want to handle errors
    throw error; // or return a default value/object
  }
};
