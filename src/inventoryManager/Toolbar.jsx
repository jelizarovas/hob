import React from "react";
import { FiDownload, FiPrinter, FiRefreshCw, FiShare2 } from "react-icons/fi";

export const Toolbar = ({
  inventoryData,
  handleCreateNew,
  searchTerm,
  setSearchTerm,
  showMetadata,
  setShowMetadata,
}) => {
  // --- DOWNLOAD CSV ---
  const handleDownload = () => {
    if (!vehicles.length) {
      alert("No vehicles to download.");
      return;
    }
    const headers = [
      "Stock",
      "Year",
      "Make",
      "Model",
      "VIN",
      "Days",
      "MSRP",
      "Price",
      "Location",
      "Status",
    ];
    const rows = vehicles.map((v) =>
      [
        csvEscape(v.stock),
        csvEscape(v.year),
        csvEscape(v.make),
        csvEscape(v.model),
        csvEscape(v.vin),
        csvEscape(v.days_in_stock),
        csvEscape(v.msrp),
        csvEscape(v.our_price),
        csvEscape(v.location),
        csvEscape(v.status),
      ].join(",")
    );

    const content = [headers.join(","), ...rows].join("\r\n");
    const dateStr = new Date().toISOString().split("T")[0];
    const fileName = `inventory-${dateStr}.csv`;
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
  };

  // --- PRINT ---
  const handlePrint = () => window.print();

  // --- SHARE (COPY URL) ---
  const handleShare = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => alert("URL copied!"))
      .catch(() => alert("Failed to copy URL"));
  };

  return (
    <div className="print:hidden flex items-center space-x-2 mb-2 flex-wrap ">
      <div className="flex items-center  ">
        <input
          type="text"
          className="bg-gray-800 text-gray-200 text-xs px-2 py-0.5  rounded"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <button
        onClick={handleCreateNew}
        className="flex items-center bg-blue-600 px-2 py-0.5 text-xs  rounded hover:bg-blue-500"
      >
        <FiRefreshCw className="mr-1" /> New Inventory
      </button>
      <button
        onClick={handleDownload}
        disabled={!inventoryData}
        className="flex items-center bg-green-600 px-2 py-0.5 text-xs  rounded hover:bg-green-500"
      >
        <FiDownload className="mr-1" /> Download
      </button>
      <button
        onClick={handlePrint}
        disabled={!inventoryData}
        className="flex items-center bg-orange-600 px-2 py-0.5 text-xs  rounded hover:bg-orange-500"
      >
        <FiPrinter className="mr-1" /> Print
      </button>
      <button
        onClick={handleShare}
        disabled={!inventoryData}
        className="flex items-center bg-purple-600 px-2 py-0.5 text-xs  rounded hover:bg-purple-500"
      >
        <FiShare2 className="mr-1" /> Share
      </button>
      <button
        onClick={() => setShowMetadata((v) => !v)}
        disabled={!inventoryData}
        className="flex items-center bg-indigo-600 px-2 py-0.5 text-xs  rounded hover:bg-indigo-500"
      >
        <FiShare2 className="mr-1" /> {showMetadata && "Hide "} Info
      </button>
    </div>
  );
};
