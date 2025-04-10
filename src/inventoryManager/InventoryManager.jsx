import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  ref,
  onValue,
  push,
  set,
  query,
  orderByChild,
  limitToLast,
} from "firebase/database";
import { rtdb } from "../firebase"; // Make sure you export getDatabase(...) as rtdb in firebase.js
import { useAuth } from "../auth/AuthProvider";
import { Toolbar } from "./Toolbar";
import { Metadata } from "./Metadata";

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
  const [showMetadata, setShowMetadata] = useState(false);

  // --- LOAD INVENTORY ---
  useEffect(() => {
    if (!inventoryId) return;
    if (inventoryId === "current") {
      // Query the newest inventory by createdAt
      const newest = query(
        ref(rtdb, "inventories"),
        orderByChild("createdAt"),
        limitToLast(1)
      );
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
            facets: [
              "stock",
              "year",
              "make",
              "model",
              "vin",
              "days_in_stock",
              "msrp",
              "our_price",
              "location",
            ],
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
        const key =
          item.vin || item.objectID || Math.random().toString(36).substr(2, 9);
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
          status: null,
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

  // --- FILTER FOR SEARCH ---
  const filteredVehicles = vehicles.filter((v) => {
    const text = (
      v.stock +
      v.year +
      v.make +
      v.model +
      v.vin +
      v.location +
      v.status
    ).toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="bg-gray-900 text-gray-100 print:bg-white print:text-black min-h-screen p-4">
      <Toolbar
        inventoryData={inventoryData}
        handleCreateNew={handleCreateNew}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showMetadata={showMetadata}
        setShowMetadata={setShowMetadata}
        vehicles={vehicles}
      />

      {inventoryData && showMetadata && (
        <Metadata inventoryData={inventoryData} />
      )}

      {/* Table */}
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-800 print:bg-white">
          <tr>
            <th className="text-left">Status</th>
            <th className="text-left">Stock</th>
            <th className="text-left">Year</th>
            <th className="text-left">Make</th>
            <th className="text-left">Model</th>
            <th className="text-left">VIN</th>
            <th className="text-left">Days</th>
            <th className="text-left">MSRP</th>
            <th className="text-left w-12">Price</th>
            <th className="text-left">Location</th>
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
              <tr
                key={veh.vin || idx}
                className="border-b border-gray-700 hover:bg-gray-800  print:hover:bg-white"
              >
                <td className="">
                  <StatusDropdown
                    vehicle={veh}
                    inventoryId={inventoryData?.id}
                  />
                </td>
                <td className="">{veh.stock}</td>
                <td className="">{veh.year}</td>
                <td className="">{veh.make}</td>
                <td className="">{veh.model}</td>
                <td className="">{veh.vin}</td>
                <td className="">{veh.days_in_stock}</td>
                <td className="">{veh.msrp}</td>
                <td title={veh.our_price} className="w-12 truncate">
                  {isNaN(veh.our_price) ? "Call" : veh.our_price}
                </td>
                <td className="" title={veh.location}>
                  {mapAddress(veh.location)}
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
  // Initialize state to an empty string if no vehicle status is present.
  const [status, setStatus] = useState(vehicle.status || "");

  const handleChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    if (!inventoryId || !vehicle.vin) return;

    // Update this vehicle's status in RTDB
    set(
      ref(rtdb, `inventories/${inventoryId}/vehicles/${vehicle.vin}/status`),
      newStatus
    ).catch((err) => console.error("Error updating status:", err));

    // Update top-level updatedAt
    set(ref(rtdb, `inventories/${inventoryId}/updatedAt`), Date.now());
  };

  return (
    <select
      className="bg-gray-800 no-print-arrow print:bg-white hover:bg-slate-600 print:hover:bg-white cursor-pointer max-w-24 text-gray-200 print:text-black text-xs px-1 py-0.5 rounded"
      value={status}
      onChange={handleChange}
    >
      {/* Placeholder option shown when no value is selected */}
      <option value="" disabled>
        Select
      </option>
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

const addressMapping = {
  "16302 Auto Ln<br/>Sumner, WA 98390": "HOFS",
  "14555 1st Avenue South<br/>Burien, WA 98166": "RAO",
  "15026 1st Ave S<br/>Burien, WA 98148": "HOFB",
  "15714 Smokey Point Blvd<br/>Marysville, WA 98271": "HOFM",

  // Add additional mappings here...
};

function mapAddress(address) {
  return addressMapping[address] || "OTHER";
}
