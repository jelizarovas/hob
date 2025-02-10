import React, { useState } from "react";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { useLocation, useHistory, Link, useParams } from "react-router-dom";
import { FaFilePdf, FaPaperPlane, FaSpinner } from "react-icons/fa";
import { BsChevronDown } from "react-icons/bs";
import { MdDelete, MdFileDownload, MdHistory } from "react-icons/md";
import VinInputWithScanner from "./VinInputWithScanner";

// Reusable header component for collapsible sections
const SectionHeader = ({ title, isOpen, onToggle, onClear }) => (
  <div className="flex items-center bg-blue-950 hover:bg-blue-900   rounded border border-black border-opacity-40 mt-2 ">
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onToggle();
      }}
      className="flex-grow text-left px-4 py-2 text-white uppercase text-xs font-semibold focus:outline-none"
    >
      {title}
    </button>
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClear();
      }}
      className="text-xs text-white text-opacity-80 px-2 py-1 rounded bg-white bg-opacity-0 hover:bg-opacity-10 transition-all focus:outline-none"
    >
      Clear
    </button>
    <button
    onClick={(e) => {
      e.preventDefault();
      onToggle();

    }}
    className="px-2 "
    >

    <BsChevronDown
    
      className={` text-white transition-all ${isOpen ? "" : "-rotate-90"}`}
    />
    </button>
  </div>
);

// Definitions for additional sold fields
const soldTextFields = [
  { key: "exteriorColor", label: "EXTERIOR COLOR" },
  { key: "interiorColor", label: "INTERIOR COLOR" },
  { key: "cylinders", label: "CYLINDERS" },
  { key: "liters", label: "LITERS" },
  { key: "doors", label: "DOORS" },
];

const soldCheckboxFields = [
  { key: "leather", label: "LEATHER" },
  { key: "auto", label: "AUTO" },
  { key: "manual", label: "MANUAL" },
  { key: "powerDL", label: "POWER DL" },
  { key: "ac", label: "AC" },
  { key: "cruiseControl", label: "CRUISE CONTROL" },
  { key: "navi", label: "NAVI" },
  { key: "bluetooth", label: "BLUETOOTH" },
  { key: "heatedSeats", label: "HEATED SEATS" },
  { key: "cooledSeats", label: "COOLED SEATS" },
  { key: "powerSeats", label: "POWER SEATS" },
  { key: "sunroof", label: "SUNROOF" },
  { key: "awd", label: "AWD" },
  { key: "fourWD", label: "4WD" },
  { key: "towPkg", label: "TOW PKG" },
  { key: "bedLiner", label: "BED LINER" },
  { key: "runningBoards", label: "RUNNING BOARDS" },
  { key: "chromepremiumWheels", label: "CHROMEPREMIUM WHEELS" },
];

// Improved engine liters extraction: look for a number immediately followed by an "L"
const extractLiters = (engineDescription) => {
  if (!engineDescription) return "";
  const match = engineDescription.match(/(\d+(\.\d+)?)\s*L\b/);
  return match ? match[1] : "";
};

const prefillCheckbox = (label, vehicle) => {
  if (!vehicle) return false;
  const lowerLabel = label.toLowerCase();
  const jsonString = JSON.stringify(vehicle).toLowerCase();
  return jsonString.includes(lowerLabel);
};

const TakeIn = () => {
  const { state } = useLocation();
  const { vin: routeVin } = useParams();
  const history = useHistory();

  // Retrieve stored records from localStorage.
  const [recentRecords, setRecentRecords] = useState(() => {
    const stored = localStorage.getItem("takeInRecords");
    return stored ? JSON.parse(stored) : [];
  });

  const removeRecord = (index) => {
    const updated = recentRecords.filter((_, i) => i !== index);
    setRecentRecords(updated);
    localStorage.setItem("takeInRecords", JSON.stringify(updated));
  };
  
  const clearAllRecords = () => {
    if (window.confirm("Clear all records?")) {
      setRecentRecords([]);
      localStorage.removeItem("takeInRecords");
    }
  };

  // Manage tab state: "current" shows the form, "recent" shows saved records.
  const [activeTab, setActiveTab] = useState("current");

  const vehicleFromState = state?.vehicle || {};
  const tradeFromState = state?.trade || {};
  const vehicle = { ...vehicleFromState };
  if (routeVin && !vehicle.vin) {
    vehicle.vin = routeVin;
  }

  // Pre-fill additional sold data from vehicle if available.
  const initialSoldAdditionalData = {
    exteriorColor: vehicle.ext_color || "",
    interiorColor: vehicle.int_color || "",
    cylinders: vehicle.cylinders || "",
    liters: extractLiters(vehicle.engine_description) || "",
    doors: vehicle.doors || "",
  };

  const initialSoldCheckboxes = {
    leather: prefillCheckbox("LEATHER", vehicle),
    auto:
      vehicle.transmission_description &&
      vehicle.transmission_description.toLowerCase().includes("automatic"),
    manual:
      vehicle.transmission_description &&
      vehicle.transmission_description.toLowerCase().includes("manual"),
    powerDL: prefillCheckbox("POWER DL", vehicle),
    ac: prefillCheckbox("AC", vehicle) || prefillCheckbox("air conditioning", vehicle),
    cruiseControl: prefillCheckbox("CRUISE CONTROL", vehicle),
    navi: prefillCheckbox("NAVI", vehicle) || prefillCheckbox("navigation", vehicle),
    bluetooth: prefillCheckbox("BLUETOOTH", vehicle),
    heatedSeats: prefillCheckbox("HEATED SEATS", vehicle),
    cooledSeats: prefillCheckbox("COOLED SEATS", vehicle),
    powerSeats: prefillCheckbox("POWER SEATS", vehicle),
    sunroof: prefillCheckbox("SUNROOF", vehicle),
    awd:
      vehicle.drivetrain && vehicle.drivetrain.toLowerCase().includes("awd"),
    fourWD:
      vehicle.drivetrain && vehicle.drivetrain.toLowerCase().includes("4wd"),
    towPkg: prefillCheckbox("TOW PKG", vehicle),
    bedLiner: prefillCheckbox("BED LINER", vehicle),
    runningBoards: prefillCheckbox("RUNNING BOARDS", vehicle),
    chromepremiumWheels: prefillCheckbox("CHROMEPREMIUM WHEELS", vehicle),
  };

  // Collapsible section states
  const [showSoldMain, setShowSoldMain] = useState(true);
  const [showAdditionalSoldData, setShowAdditionalSoldData] = useState(false);
  const [showTradeData, setShowTradeData] = useState(false);

  const [formData, setFormData] = useState({
    vin: vehicle.vin || "",
    year: vehicle.year || "",
    make: vehicle.make || "",
    model: vehicle.model || "",
    trim: vehicle.trim || "",
    mileage: "",
    ...initialSoldAdditionalData,
    ...initialSoldCheckboxes,
    tradeVin: tradeFromState.vin || "",
    tradeYear: tradeFromState.year || "",
    tradeMake: tradeFromState.make || "",
    tradeModel: tradeFromState.model || "",
    tradeTrim: tradeFromState.trim || "",
    tradeMileage: "",
  });

  const [lastFetchedVin, setLastFetchedVin] = useState("");
  const [lastFetchedTradeVin, setLastFetchedTradeVin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleVinBlur = async () => {
    const currentVin = formData.vin;
    if (currentVin.length === 17 && lastFetchedVin !== currentVin) {
      try {
        const vinData = await fetchVINData(currentVin);
        setLastFetchedVin(currentVin);
        if (formData.year || formData.make || formData.model) {
          if (window.confirm("Vehicle data exists. Overwrite?")) {
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
        console.error("Error fetching VIN data:", currentVin, error);
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
          if (window.confirm("Trade vehicle data exists. Overwrite?")) {
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

  const clearSoldMainData = () => {
    setFormData((prev) => ({
      ...prev,
      vin: "",
      year: "",
      make: "",
      model: "",
      trim: "",
      mileage: "",
    }));
  };

  const clearAdditionalSoldData = () => {
    setFormData((prev) => ({
      ...prev,
      exteriorColor: "",
      interiorColor: "",
      cylinders: "",
      liters: "",
      doors: "",
      leather: false,
      auto: false,
      manual: false,
      powerDL: false,
      ac: false,
      cruiseControl: false,
      navi: false,
      bluetooth: false,
      heatedSeats: false,
      cooledSeats: false,
      powerSeats: false,
      sunroof: false,
      awd: false,
      fourWD: false,
      towPkg: false,
      bedLiner: false,
      runningBoards: false,
      chromepremiumWheels: false,
    }));
  };

  const clearTradeData = () => {
    setFormData((prev) => ({
      ...prev,
      tradeVin: "",
      tradeYear: "",
      tradeMake: "",
      tradeModel: "",
      tradeTrim: "",
      tradeMileage: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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

      // Fill sold vehicle main info
      form.getTextField("VIN").setText(formData.vin || "");
      form.getTextField("YEAR").setText(formData.year || "");
      form.getTextField("MAKE").setText(formData.make || "");
      form.getTextField("MODEL").setText(formData.model || "");
      form.getTextField("TRIM").setText(formData.trim || "");
      form.getTextField("MILES").setText(formData.mileage || "");

      // Fill additional sold text fields
      soldTextFields.forEach(({ key, label }) => {
        try {
          form.getTextField(label).setText(formData[key] || "");
        } catch (error) {
          console.error(`Error setting field ${label}:`, error);
        }
      });

      // Fill additional sold checkbox fields
      soldCheckboxFields.forEach(({ key, label }) => {
        try {
          const checkbox = form.getCheckBox(label);
          formData[key] ? checkbox.check() : checkbox.uncheck();
        } catch (error) {
          console.error(`Error setting checkbox ${label}:`, error);
        }
      });

      // Fill trade vehicle info
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

      // Save current formData to recent records in localStorage
      const newRecord = { ...formData, timestamp: new Date().toISOString() };
      const newRecords = [newRecord, ...recentRecords];
      setRecentRecords(newRecords);
      localStorage.setItem("takeInRecords", JSON.stringify(newRecords));
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
    setLoading(false);
  };

  // Render Recent Records list if activeTab === "recent"
  const renderRecentRecords = () => {
    if (recentRecords.length === 0) {
      return <p className="text-white text-center">No records saved yet.</p>;
    }
    return (
      <div className="space-y-2">
        {recentRecords.map((record, index) => (
          <div key={index} className="flex items-center justify-between text-left p-2 bg-gray-700 dark:bg-gray-900 rounded text-white hover:bg-gray-700 transition-all">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setFormData(record);
                setActiveTab("current");
              }}
              className="w-full flex flex-col "
            >
             
              <span>{record.year} {record.make} {record.model} {record.trim}</span>
              {record.vin || "No VIN"}
              <span className="text-xs italic">
                ({new Date(record.timestamp).toLocaleString()})
              </span>
            </button>
            <button
              onClick={() => removeRecord(index)}
              className="ml-2 px-2 py-2 rounded-full border text-white hover:border-red-500 transition-all hover:text-red-700"
              title="Remove this record"
            >
              <MdDelete />
            </button>
          </div>
        ))}
        <button
          onClick={clearAllRecords}
          className="mt-2 w-full p-2 bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Clear All
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      <div className="container mx-auto flex px-2 pb-2 items-center  bg-white bg-opacity-5 rounded-t pt-2 uppercase text-gray-300">
        <h1 className="flex-grow text-sm px-2 leading-tight"></h1>
        <div className="flex text-xs  ">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("current");
          }}
          className={`flex-grow p-1 px-2 text-center rounded-l transition-all ${activeTab === "current" ? "bg-blue-600 text-white" : "bg-blue-300 bg-opacity-10 text-white hover:bg-opacity-20"}`}
        >
          CURRENT
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("recent");
          }}
          className={`flex-grow flex items-center gap-2 p-1 px-2 text-center rounded-r  transition-all ${activeTab === "recent" ? "bg-blue-600 text-white" : "bg-blue-300 bg-opacity-10 text-white hover:bg-opacity-20"}`}
        >
        <MdHistory />  <span>RECENT</span>
        </button>
      </div>

        <span className="px-2 select-none opacity-20">|</span>
        <button 
        onClick={(e) => window.open("/pdf/Take-in Sheet Form.pdf", "_blank", "noopener,noreferrer")}
        className="flex items-center gap-2 text-xs hover:underline bg-white bg-opacity-0 hover:bg-opacity-15 transition-all p-2 px-4 rounded">  <FaFilePdf /> <span>PDF</span></button>
      </div>

      {/* Tabs for CURRENT and RECENT */}
     
      {activeTab === "recent" ? (
        <div className="container mx-auto px-2 py-2 bg-white rounded-b bg-opacity-10 mb-4">{renderRecentRecords()}</div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col bg-white bg-opacity-10 py-2 px-4 rounded-b mb-4 container mx-auto  text-black"
        >
          {/* Sold Main Information Section */}
          <SectionHeader
            title="Sold Vehicle"
            isOpen={showSoldMain}
            onToggle={() => setShowSoldMain((prev) => !prev)}
            onClear={clearSoldMainData}
          />
          {showSoldMain && (
                      <div className="bg-white bg-opacity-5 p-2 mx-1 mb-4 rounded-b">

<VinInputWithScanner
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
                label={`Miles ${state?.vehicle?.miles ? `(Listed ${state?.vehicle?.miles} miles)` : ""} `}
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                placeholder="Enter Miles"
              />
            </div>
          )}

          {/* Additional Sold Vehicle Data Section */}
          <SectionHeader
            title="Additional Sold Vehicle Data"
            isOpen={showAdditionalSoldData}
            onToggle={() => setShowAdditionalSoldData((prev) => !prev)}
            onClear={clearAdditionalSoldData}
          />
          {showAdditionalSoldData && (
                      <div className="bg-white bg-opacity-5 p-2 mx-1 mb-4 rounded-b">

              {soldTextFields.map(({ key, label }) => (
                <Input
                  key={key}
                  label={label}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  placeholder={label}
                />
              ))}
              <div className="flex flex-wrap">
                {soldCheckboxFields.map(({ key, label }) => (
                  <label key={key} className="flex items-center mr-4 my-1 text-xs text-white">
                    <input
                      type="checkbox"
                      name={key}
                      checked={formData[key]}
                      onChange={handleChange}
                      className="mr-1"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Trade-In Information Section */}
          <SectionHeader
            title="Trade-In Information"
            isOpen={showTradeData}
            onToggle={() => setShowTradeData((prev) => !prev)}
            onClear={clearTradeData}
          />
          {showTradeData && (
            <div className="bg-white bg-opacity-5 p-2 mx-1 mb-4 rounded-b">
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
                label="Miles (Enter trade vehicle miles)"
                name="tradeMileage"
                value={formData.tradeMileage}
                onChange={handleChange}
                placeholder="Enter Miles"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-white mt-4 mb-6 bg-green-600 hover:bg-green-700 transition-all flex items-center justify-center ${
              loading ? "cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <FaSpinner className="inline mr-2 animate-spin" />
            ) : (
              <FaPaperPlane className="inline mr-2" />
            )}
            {loading ? "Generating..." : "Get Take-In Sheet"}
          </button>
        </form>
      )}
    </div>
  );
};

const Input = ({ label, name, value, onChange, onBlur, placeholder, autoFocus = false }) => (
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
      autoComplete={"off"}
      className="text-sm px-2 py-1 rounded outline-none bg-white bg-opacity-10 text-white hover:bg-opacity-15 transition-all focus:bg-opacity-15"
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
