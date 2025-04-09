import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { ref, onValue, push, set, query, orderByChild, limitToLast } from "firebase/database";
import { rtdb } from "../firebase"; // Make sure you export getDatabase(...) as rtdb in firebase.js
import { useAuth } from "../auth/AuthProvider";
import { FiDownload, FiPrinter, FiShare2, FiRefreshCw } from "react-icons/fi";

// Example statuses/locations
const LOCATIONS = [
  "HOB NEW",
  "HOB USED",
  "HOB SHOWROOM",
  "HOB SERVICE",
  "HOB UP TOP",
  "IN TRANSIT",
  "SOLD",
  "DELIVERY BAY",
  "RAO LOT",
  "RECON",
  "DEMO",
];

export default function InventoryManager() {
  const { inventoryId } = useParams();
  const history = useHistory();
  const { currentUser, profile } = useAuth();

  const [inventoryData, setInventoryData] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // --- LOAD INVENTORY ---
  useEffect(() => {
    if (!inventoryId) return;
    if (inventoryId === "current") {
      // Query the newest inventory by createdAt
      const newest = query(ref(rtdb, "inventories"), orderByChild("createdAt"), limitToLast(1));
      onValue(newest, (snap) => {
        if (!snap.exists()) {
          setInventoryData(null);
          setVehicles([]);
        } else {
          const entries = Object.entries(snap.val());
          const [key, val] = entries[0]; // just one entry
          setInventoryData({ id: key, ...val });
          setVehicles(val.vehicles ? Object.values(val.vehicles) : []);
        }
      });
    } else {
      // Load specific inventory by ID
      const invRef = ref(rtdb, `inventories/${inventoryId}`);
      onValue(invRef, (snap) => {
        if (!snap.exists()) {
          setInventoryData(null);
          setVehicles([]);
        } else {
          const val = snap.val();
          setInventoryData({ id: inventoryId, ...val });
          setVehicles(val.vehicles ? Object.values(val.vehicles) : []);
        }
      });
    }
  }, [inventoryId]);

  // --- UTILITY: Format Timestamp ---
  const formatTimestamp = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleString();
  };

  // --- CREATE/UPDATE INVENTORY (FETCH ALGOLIA) ---
  const handleCreateNew = async () => {
    try {
      const response = await fetch(
        "https://sewjn80htn-dsn.algolia.net/1/indexes/rairdonshondaofburien-legacymigration0222_production_inventory_low_to_high/query",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-algolia-api-key": "179608f32563367799314290254e3e44",
            "x-algolia-application-id": "SEWJN80HTN",
          },
          body: JSON.stringify({
            hitsPerPage: 999,
            query: "",
            page: 0,
            facetFilters: [["type:New", "type:Certified Used", "type:Used"]],
            facets: ["stock", "year", "make", "model", "vin", "days_in_stock", "msrp", "our_price", "location"],
          }),
        }
      );
      const data = await response.json();
      if (!data.hits) throw new Error("No Algolia hits");

      // Push new inventory
      const newRef = push(ref(rtdb, "inventories"));
      const newId = newRef.key;
      const now = Date.now();

      // Build vehicles object
      const vehObj = {};
      data.hits.forEach((item) => {
        const key = item.vin || item.objectID || Math.random().toString(36).substr(2, 9);
        vehObj[key] = {
          stock: item.stock || "",
          year: item.year || "",
          make: item.make || "",
          model: item.model || "",
          vin: item.vin || "",
          days_in_stock: item.days_in_stock || "",
          msrp: item.msrp || "",
          our_price: item.our_price || "",
          location: item.location || "",
          status: "HOB NEW",
        };
      });

      const newInventoryData = {
        createdAt: now,
        updatedAt: now,
        createdBy: {
          userId: currentUser?.uid || "unknown",
          displayName: profile?.displayName || currentUser?.email || "unknown",
        },
        vehicles: vehObj,
      };

      await set(newRef, newInventoryData);
      history.push(`/inventory/${newId}`);
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to create new inventory");
    }
  };

  // --- DOWNLOAD CSV ---
  const handleDownload = () => {
    if (!vehicles.length) {
      alert("No vehicles to download.");
      return;
    }
    const headers = ["Stock", "Year", "Make", "Model", "VIN", "Days", "MSRP", "Price", "Location", "Status"];
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

  // --- FILTER FOR SEARCH ---
  const filteredVehicles = vehicles.filter((v) => {
    const text = (v.stock + v.year + v.make + v.model + v.vin + v.location + v.status).toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen p-4">
      {/* Toolbar */}
      <div className="flex items-center space-x-2 mb-4">
        <button onClick={handleCreateNew} className="flex items-center bg-blue-600 px-3 py-2 rounded hover:bg-blue-500">
          <FiRefreshCw className="mr-1" /> New Inventory
        </button>
        <button
          onClick={handleDownload}
          disabled={!inventoryData}
          className="flex items-center bg-green-600 px-3 py-2 rounded hover:bg-green-500"
        >
          <FiDownload className="mr-1" /> Download
        </button>
        <button
          onClick={handlePrint}
          disabled={!inventoryData}
          className="flex items-center bg-orange-600 px-3 py-2 rounded hover:bg-orange-500"
        >
          <FiPrinter className="mr-1" /> Print
        </button>
        <button
          onClick={handleShare}
          disabled={!inventoryData}
          className="flex items-center bg-purple-600 px-3 py-2 rounded hover:bg-purple-500"
        >
          <FiShare2 className="mr-1" /> Share
        </button>
      </div>

      {/* Metadata */}
      {inventoryData && (
        <div className="mb-3 text-sm">
          <p>Inventory ID: {inventoryData.id}</p>
          <p>Created At: {formatTimestamp(inventoryData.createdAt)}</p>
          <p>Updated At: {formatTimestamp(inventoryData.updatedAt)}</p>
          <p>Created By: {inventoryData.createdBy?.displayName || "unknown"}</p>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center space-x-2 mb-3">
        <input
          type="text"
          className="bg-gray-800 text-gray-200 p-2 rounded"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-2 text-left">Stock</th>
            <th className="p-2 text-left">Year</th>
            <th className="p-2 text-left">Make</th>
            <th className="p-2 text-left">Model</th>
            <th className="p-2 text-left">VIN</th>
            <th className="p-2 text-left">Days</th>
            <th className="p-2 text-left">MSRP</th>
            <th className="p-2 text-left">Price</th>
            <th className="p-2 text-left">Location</th>
            <th className="p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredVehicles.length === 0 ? (
            <tr>
              <td colSpan="10" className="p-4 text-center text-gray-500">
                No vehicles found.
              </td>
            </tr>
          ) : (
            filteredVehicles.map((veh, idx) => (
              <tr key={veh.vin || idx} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="p-2">{veh.stock}</td>
                <td className="p-2">{veh.year}</td>
                <td className="p-2">{veh.make}</td>
                <td className="p-2">{veh.model}</td>
                <td className="p-2">{veh.vin}</td>
                <td className="p-2">{veh.days_in_stock}</td>
                <td className="p-2">{veh.msrp}</td>
                <td className="p-2">{veh.our_price}</td>
                <td className="p-2">{veh.location}</td>
                <td className="p-2">
                  <StatusDropdown vehicle={veh} inventoryId={inventoryData?.id} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/** Status/Location dropdown */
function StatusDropdown({ vehicle, inventoryId }) {
  const [status, setStatus] = useState(vehicle.status);

  const handleChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    if (!inventoryId || !vehicle.vin) return;

    // Update this vehicle's status in RTDB
    set(ref(rtdb, `inventories/${inventoryId}/vehicles/${vehicle.vin}/status`), newStatus).catch((err) =>
      console.error("Error updating status:", err)
    );

    // Update top-level updatedAt
    set(ref(rtdb, `inventories/${inventoryId}/updatedAt`), Date.now());
  };

  return (
    <select className="bg-gray-800 text-gray-200 p-1 rounded" value={status} onChange={handleChange}>
      {LOCATIONS.map((loc) => (
        <option key={loc} value={loc}>
          {loc}
        </option>
      ))}
    </select>
  );
}

/** CSV escaping */
function csvEscape(val) {
  if (!val) return "";
  return `"${String(val)
    .replace(/"/g, '""')
    .replace(/<br\s*\/?>/gi, " ")}"`;
}
