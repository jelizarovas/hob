import React, { useState } from "react";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { useLocation, useHistory, Link, useParams } from "react-router-dom";

const TakeIn = () => {
  const { state } = useLocation();
  const { vin: routeVin } = useParams();
  const history = useHistory();

  const vehicleFromState = state?.vehicle || {};
  const tradeFromState = state?.trade || {};

  const vehicle = { ...vehicleFromState };
  if (routeVin && !vehicle.vin) {
    vehicle.vin = routeVin;
  }

  const [formData, setFormData] = useState({
    vin: vehicle.vin || "",
    year: vehicle.year || "",
    make: vehicle.make || "",
    model: vehicle.model || "",
    trim: vehicle.trim || "",
    mileage: "", // manually entered miles for sold vehicle
    tradeVin: tradeFromState.vin || "",
    tradeYear: tradeFromState.year || "",
    tradeMake: tradeFromState.make || "",
    tradeModel: tradeFromState.model || "",
    tradeTrim: tradeFromState.trim || "",
    tradeMileage: "", // manually entered miles for trade vehicle
  });

  const [lastFetchedVin, setLastFetchedVin] = useState("");
  const [lastFetchedTradeVin, setLastFetchedTradeVin] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVinBlur = async () => {
    const currentVin = formData.vin;
    if (currentVin.length === 17 && lastFetchedVin !== currentVin) {
      try {
        const vinData = await fetchVINData(currentVin);
        setLastFetchedVin(currentVin);
        if (formData.year || formData.make || formData.model) {
          if (window.confirm("Vehicle data already exists. Overwrite?")) {
            setFormData((prev) => ({
              ...prev,
              year: vinData.year,
              make: vinData.make,
              model: vinData.model,
            }));
          }
        } else {
          setFormData((prev) => ({
            ...prev,
            year: vinData.year,
            make: vinData.make,
            model: vinData.model,
          }));
        }
      } catch (error) {
        console.error("Error fetching vehicle VIN data:", currentVin, error);
      }
    }
  };

  const handleTradeVinBlur = async () => {
    const currentVin = formData.tradeVin;
    if (currentVin.length === 17 && lastFetchedTradeVin !== currentVin) {
      try {
        const vinData = await fetchVINData(currentVin);
        setLastFetchedTradeVin(currentVin);
        if (formData.tradeYear || formData.tradeMake || formData.tradeModel) {
          if (window.confirm("Trade vehicle data already exists. Overwrite?")) {
            setFormData((prev) => ({
              ...prev,
              tradeYear: vinData.year,
              tradeMake: vinData.make,
              tradeModel: vinData.model,
            }));
          }
        } else {
          setFormData((prev) => ({
            ...prev,
            tradeYear: vinData.year,
            tradeMake: vinData.make,
            tradeModel: vinData.model,
          }));
        }
      } catch (error) {
        console.error("Error fetching trade VIN data:", currentVin, error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const baseUrl = window.location.origin;
      const pdfPath = "/pdf/Take-in%20Sheet%20Form.pdf";
      const pdfUrl = baseUrl + pdfPath;
      const existingPdfBytes = await fetch(pdfUrl).then((res) =>
        res.arrayBuffer()
      );

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      await pdfDoc.embedFont(StandardFonts.Helvetica);
      const form = pdfDoc.getForm();

      // Fill Vehicle Info (VIN at the top)
      form.getTextField("VIN").setText(formData.vin || "");
      form.getTextField("YEAR").setText(formData.year || "");
      form.getTextField("MAKE").setText(formData.make || "");
      form.getTextField("MODEL").setText(formData.model || "");
      form.getTextField("TRIM").setText(formData.trim || "");
      form.getTextField("MILES").setText(formData.mileage || "");

      // Fill Trade-In Info (fields with TRADE_ prefix)
      form.getTextField("TRADE_VIN").setText(formData.tradeVin || "");
      form.getTextField("TRADE_YEAR").setText(formData.tradeYear || "");
      form.getTextField("TRADE_MAKE").setText(formData.tradeMake || "");
      form.getTextField("TRADE_MODEL").setText(formData.tradeModel || "");
      form.getTextField("TRADE_TRIM").setText(formData.tradeTrim || "");
      form.getTextField("TRADE_MILES").setText(formData.tradeMileage || "");

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error generating Take-In PDF:", error);
    }
  };

  return (
    <div className="flex flex-col">
      <Link
        to="/"
        className="uppercase text-center bg-white my-3 bg-opacity-10 hover:bg-opacity-25 text-xs py-1 rounded-lg w-96 mx-auto"
      >
        Go to Main
      </Link>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col bg-slate-800 py-10 px-4 rounded mx-auto my-10 w-96 text-black"
      >
        <h2 className="text-white text-center">Vehicle Information</h2>
        <Input
          label="VIN"
          name="vin"
          value={formData.vin}
          onChange={handleChange}
          onBlur={handleVinBlur}
          placeholder="VIN"
        />
        <Input
          label="Year"
          name="year"
          value={formData.year}
          onChange={handleChange}
          placeholder="Year"
        />
        <Input
          label="Make"
          name="make"
          value={formData.make}
          onChange={handleChange}
          placeholder="Make"
        />
        <Input
          label="Model"
          name="model"
          value={formData.model}
          onChange={handleChange}
          placeholder="Model"
        />
        <Input
          label="Trim"
          name="trim"
          value={formData.trim}
          onChange={handleChange}
          placeholder="Trim"
        />
        <Input
          label="Miles (182,335 listed miles)"
          name="mileage"
          value={formData.mileage}
          onChange={handleChange}
          placeholder="Enter Miles"
        />

        <h2 className="text-white text-center mt-4">Trade-In Information</h2>
        <Input
          label="VIN"
          name="tradeVin"
          value={formData.tradeVin}
          onChange={handleChange}
          onBlur={handleTradeVinBlur}
          placeholder="Trade VIN"
        />
        <Input
          label="Year"
          name="tradeYear"
          value={formData.tradeYear}
          onChange={handleChange}
          placeholder="Trade Year"
        />
        <Input
          label="Make"
          name="tradeMake"
          value={formData.tradeMake}
          onChange={handleChange}
          placeholder="Trade Make"
        />
        <Input
          label="Model"
          name="tradeModel"
          value={formData.tradeModel}
          onChange={handleChange}
          placeholder="Trade Model"
        />
        <Input
          label="Trim"
          name="tradeTrim"
          value={formData.tradeTrim}
          onChange={handleChange}
          placeholder="Trade Trim"
        />
        <Input
          label="Miles (182,335 listed miles)"
          name="tradeMileage"
          value={formData.tradeMileage}
          onChange={handleChange}
          placeholder="Enter Miles"
        />

        <button
          type="submit"
          className="bg-green-500 my-2 w-full py-1 hover:bg-green-400 transition-all rounded"
        >
          Get Take-In Sheet
        </button>
      </form>
    </div>
  );
};

const Input = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  autoFocus = false,
}) => (
  <label htmlFor={name} className="flex flex-col my-1">
    <span className="text-xs text-white">{label}</span>
    <input
      type="text"
      name={name}
      value={value || ""}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className="px-2 py-1 rounded"
    />
  </label>
);

const fetchVINData = async (vin) => {
  try {
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`
    );
    const data = await response.json();
    const results = data.Results;
    return {
      vin,
      year: results.find((r) => r.Variable === "Model Year")?.Value || "",
      make: results.find((r) => r.Variable === "Make")?.Value || "",
      model: results.find((r) => r.Variable === "Model")?.Value || "",
    };
  } catch (error) {
    console.error("Error fetching VIN data:", error);
    throw error;
  }
};

export default TakeIn;
