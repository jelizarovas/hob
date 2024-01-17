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
    const pdfDoc = await PDFDocument.create();

    for (const vin of vins) {
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const barcodeCanvas = document.createElement("canvas");
      JsBarcode(barcodeCanvas, vin, { format: "CODE39" });
      const barcodeDataUrl = barcodeCanvas.toDataURL("image/png");
      const barcodeImage = await pdfDoc.embedPng(barcodeDataUrl);
      const barcodeDims = barcodeImage.scale(1);

      page.drawImage(barcodeImage, {
        x: 50,
        y: height - barcodeDims.height - 50,
        width: barcodeDims.width / 2,
        height: barcodeDims.height / 2,
      });

      // page.drawText(vin, {
      //   x: 50,
      //   y: height - 100,
      //   size: 12,
      // });
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col">
      <Link
        to="/"
        className="uppercase text-center items-center bg-white bg-opacity-10 hover:bg-opacity-25 text-xs py-1 rounded-lg w-96 mx-auto "
      >
        Go to Main
      </Link>
      <div className="flex flex-col w-96 mx-auto my-10 bg-slate-800 text-black">
        <input type="text" value={vinInput} onChange={(e) => setVinInput(e.target.value)} placeholder="Enter VIN" />
        <button onClick={addVin}>Add VIN</button>
        <button onClick={generatePdf} disabled={vins.length === 0}>
          Generate PDF
        </button>

        {vins.length > 0 && (
          <ul>
            {vins.map((vin, index) => (
              <li key={index}>{vin}</li>
            ))}
          </ul>
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
