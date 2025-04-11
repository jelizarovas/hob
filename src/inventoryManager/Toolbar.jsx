import React from "react";
import {
  FiDownload,
  FiInfo,
  FiPrinter,
  FiRefreshCw,
  FiShare2,
} from "react-icons/fi";
import { MdAddCircle, MdClear } from "react-icons/md";
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
      <div className="flex items-center bg-gray-800 hover:bg-gray-700 text-gray-200 rounded   ">
        <input
          type="text"
          className="bg-transparent outline-none text-sm px-2 py-1  "
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && searchTerm.length > 0 && (
          <button
            type="button"
            onClick={(e) => setSearchTerm("")}
            className="text-xs p-0.5 my-0.5 rounded-full border border-white"
          >
            <MdClear />
          </button>
        )}
      </div>

      <ToolbarButton
        onClick={handleDownload}
        color="green"
        Icon={FiDownload}
        label="Download"
        disabled={!inventoryData}
        title="Download current inventory view as CSV"
      />

      <ToolbarButton
        onClick={handlePrint}
        color="orange" // Use the newly added color
        Icon={FiPrinter}
        label="Print"
        disabled={!inventoryData}
        title="Print current inventory view"
      />

      <ToolbarButton
        onClick={handleShare}
        color="purple" // Use the newly added color
        Icon={FiShare2}
        label="Share"
        disabled={!inventoryData}
        title="Share this inventory (feature pending)" // Example title
      />

      <ToolbarButton
        onClick={() => setShowMetadata((v) => !v)}
        color="indigo" // Use the newly added color
        Icon={FiInfo} // Changed to FiInfo, assuming that makes more sense than FiShare2? If not, change back.
        // Pass the dynamic label directly
        label={showMetadata ? "Hide Info" : "Show Info"}
        disabled={!inventoryData}
        title={
          showMetadata ? "Hide inventory metadata" : "Show inventory metadata"
        }
      />

      <ToolbarButton
        onClick={handleCreateNew}
        color="blue"
        Icon={MdAddCircle}
        label="New Inventory"
        // Add title for tooltip if desired
        title="Create a new inventory snapshot from current data"
      />
    </div>
  );
};

const ToolbarButton = ({ onClick, color = "blue", Icon, label, ...props }) => {
  // Define mappings from your color prop value to the actual Tailwind classes
  const colorStyles = {
    blue: "bg-blue-600 hover:bg-blue-500 text-white",
    green: "bg-green-600 hover:bg-green-500 text-white",
    red: "bg-red-600 hover:bg-red-500 text-white",
    gray: "bg-gray-600 hover:bg-gray-500 text-white",
    yellow: "bg-yellow-500 hover:bg-yellow-400 text-black", // Example with different text color
    // Add more colors as needed
    orange: "bg-orange-600 hover:bg-orange-500 text-white",
    purple: "bg-purple-600 hover:bg-purple-500 text-white",
    indigo: "bg-indigo-600 hover:bg-indigo-500 text-white",
  };

  // Select the appropriate style string based on the color prop, defaulting to blue
  const buttonClasses = colorStyles[color] || colorStyles.blue;

  return (
    <button
      onClick={onClick}
      // Combine base styles with the dynamic color styles
      className={`flex items-center px-2 py-1 text-xs rounded transition-colors duration-150 ${buttonClasses}`}
      {...props} // Spread any other props (like disabled, type, etc.)
    >
      {/* Render the Icon component passed as a prop */}
      {Icon && <Icon className="mr-1 h-4 w-4" aria-hidden="true" />}
      {/* Render the label passed as a prop */}
      <span className="hidden lg:block">{label}</span>
      {/* Optional: Show label always on smaller screens if needed */}
      {/* <span className="lg:hidden">{label}</span> */}
    </button>
  );
};
