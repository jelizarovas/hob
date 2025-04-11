import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  ref,
  onValue,
  push,
  set,
  query,
  orderByChild,
  limitToLast,
  get,
} from "firebase/database"; // Removed 'update' as it wasn't used directly here
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getFacetedRowModel, // Needed for column filters
  getFacetedUniqueValues, // Needed for column filters
  flexRender,
} from "@tanstack/react-table";
// Using lodash debounce - make sure it's installed: npm install lodash.debounce
import debounce from "lodash.debounce";

// --- Local Project Imports ---
// Ensure these paths are correct for your project structure
import { rtdb } from "../firebase"; // Needs to export the initialized RTDB instance
import { useAuth } from "../auth/AuthProvider"; // Needs to export the useAuth hook
import { Toolbar } from "./Toolbar"; // Needs to export the Toolbar component
import { Metadata } from "./Metadata"; // Needs to export the Metadata component

// --- Constants and Helper Functions ---

// List of possible vehicle statuses/locations
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

// Mappings for dealership locations based on address from data source
const addressMapping = {
  "16302 Auto Ln<br/>Sumner, WA 98390": "HOFS", // Honda of Sumner
  "14555 1st Avenue South<br/>Burien, WA 98166": "RAO", // Rairdon Auto Outlet
  "15026 1st Ave S<br/>Burien, WA 98148": "HOFB", // Honda of Burien
  "15714 Smokey Point Blvd<br/>Marysville, WA 98271": "HOFM", // Honda of Marysville
  // Add more mappings as needed
};

/**
 * Maps a full address string (potentially with <br/>) to a short dealership code.
 * @param {string | null | undefined} address - The address string from the vehicle data.
 * @returns {string} - The short dealership code (e.g., "HOFB") or "OTHER" / "N/A".
 */
function mapAddress(address) {
  if (!address) return "N/A"; // Handle null/undefined addresses
  return addressMapping[address] || "OTHER"; // Return mapped code or "OTHER" if no match
}

// --- Reusable Filter Component for Column Headers ---
/**
 * Renders a filter dropdown for a specific table column.
 * Allows users to select unique values to filter by.
 */
function Filter({ column, table }) {
  const [showFilter, setShowFilter] = useState(false);
  const filterButtonRef = useRef(null); // Ref for the filter button
  const filterMenuRef = useRef(null); // Ref for the dropdown menu

  // Get unique values for this column using TanStack Table's faceted values
  const facetedUniqueValues = column.getFacetedUniqueValues();
  // Get the current filter value for this column, ensuring it's an array
  const filterValue = column.getFilterValue() || [];

  // Memoize sorted unique values for display in the dropdown
  const sortedUniqueValues = useMemo(() => {
    // Convert Map keys iterator to array and filter out null/undefined
    const values = Array.from(facetedUniqueValues.keys()).filter(
      (val) => val != null
    );
    try {
      // Attempt numeric sort first, then case-insensitive string sort
      return values.sort((a, b) => {
        const numA = Number(a);
        const numB = Number(b);
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB; // Numeric sort
        }
        // Case-insensitive string sort
        return String(a).localeCompare(String(b), undefined, {
          sensitivity: "base",
        });
      });
    } catch (e) {
      console.warn(
        "Sorting error for filter values, falling back to default sort:",
        e
      );
      return values.sort(); // Fallback sort on error
    }
  }, [facetedUniqueValues]);

  // Handles changes to the filter checkboxes
  const handleFilterChange = (value) => {
    const currentFilter = column.getFilterValue() || [];
    // Toggle the presence of the value in the filter array
    const newFilter = currentFilter.includes(value)
      ? currentFilter.filter((v) => v !== value)
      : [...currentFilter, value];
    // Update the column's filter state (undefined clears the filter)
    column.setFilterValue(newFilter.length > 0 ? newFilter : undefined);
  };

  // Effect to close the filter dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      // Check if the click is outside the button and the menu
      if (
        showFilter &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target) &&
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target)
      ) {
        setShowFilter(false); // Close the dropdown
      }
    }
    // Add event listener when the dropdown is shown
    if (showFilter) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    // Cleanup: remove event listener when dropdown is hidden or component unmounts
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilter]); // Dependency array ensures effect runs when showFilter changes

  // Do not render the filter UI if the column is not filterable or has no unique values
  if (!column.getCanFilter() || sortedUniqueValues.length === 0) {
    return null;
  }

  // Render the filter button and dropdown menu
  return (
    <div className="relative inline-block ml-1 align-middle">
      {" "}
      {/* Use align-middle */}
      {/* Filter Icon Button */}
      <button
        ref={filterButtonRef}
        onClick={(e) => {
          e.stopPropagation();
          setShowFilter(!showFilter);
        }} // Toggle dropdown visibility
        className={`p-1 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${
          column.getIsFiltered()
            ? "text-blue-400 bg-gray-700"
            : "text-gray-400 hover:text-gray-100 hover:bg-gray-700"
        }`}
        title="Filter column"
      >
        {/* Filter SVG Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L13 10.414V15a1 1 0 01-.293.707l-2 2A1 1 0 019 17v-6.586L4.293 6.707A1 1 0 014 6V3z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {/* Dropdown Filter Menu */}
      {showFilter && (
        <div
          ref={filterMenuRef}
          className="absolute top-full left-0 mt-1 z-20 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto p-2 min-w-[150px]"
          onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing via header etc.
        >
          {/* Clear Filter Button */}
          <button
            onClick={() => {
              column.setFilterValue(undefined);
              setShowFilter(false);
            }}
            className="w-full text-left text-xs text-blue-400 hover:text-blue-300 mb-1 px-1 disabled:opacity-50 disabled:hover:text-blue-400"
            disabled={!column.getIsFiltered()} // Disable if no filter is active
          >
            Clear Filter
          </button>
          {/* Filter Value Checkboxes */}
          {sortedUniqueValues.map((value) => (
            <label
              key={value}
              className="flex items-center space-x-2 text-xs text-gray-200 hover:bg-gray-600 px-1 py-0.5 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                className="form-checkbox h-3 w-3 text-blue-500 bg-gray-800 border-gray-600 rounded focus:ring-blue-600 cursor-pointer"
                checked={filterValue.includes(value)}
                onChange={() => handleFilterChange(value)}
              />
              {/* Display 'N/A' for null values, otherwise string representation */}
              <span>{value === null ? "N/A" : String(value)}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Status Dropdown Component (Handles Firebase updates) ---
/**
 * Renders a dropdown select for changing a vehicle's status.
 * Updates Firebase on change.
 * Designed to be used within a TanStack Table cell.
 */
function StatusDropdown({ getValue, row, column, table }) {
  const initialValue = getValue(); // Gets the current status value for this cell from the data
  const vehicle = row.original; // Gets the full data object for the row (the vehicle)
  const { inventoryId } = table.options.meta; // Access inventoryId passed via table meta option

  // Local state for the dropdown's selected value
  const [status, setStatus] = useState(initialValue || "");

  // Effect to update local dropdown state if the underlying data changes (e.g., external update)
  useEffect(() => {
    setStatus(initialValue || "");
  }, [initialValue]);

  /**
   * Handles the change event of the select dropdown.
   * Updates local state and triggers Firebase update.
   */
  const handleChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus); // Update local state immediately for better UX

    // Prevent Firebase update if essential data is missing
    if (!inventoryId || !vehicle.vin) {
      console.warn(
        "Cannot update status: Missing inventoryId or vehicle VIN.",
        { inventoryId, vin: vehicle.vin }
      );
      alert("Error: Could not update status. Missing required information.");
      return;
    }

    // --- Firebase Update Logic ---
    const vehicleStatusRef = ref(
      rtdb,
      `inventories/${inventoryId}/vehicles/${vehicle.vin}/status`
    );
    const inventoryUpdatedRef = ref(
      rtdb,
      `inventories/${inventoryId}/updatedAt`
    );
    const now = Date.now();

    // Update the specific vehicle's status
    set(vehicleStatusRef, newStatus)
      .then(() => {
        // If status update is successful, update the inventory's overall 'updatedAt' timestamp
        return set(inventoryUpdatedRef, now);
      })
      .catch((err) => {
        console.error(
          "Firebase Error: Failed to update status for VIN:",
          vehicle.vin,
          err
        );
        // Revert local state back to the original value on error
        setStatus(initialValue || "");
        // Notify the user of the failure
        alert(
          `Failed to update status for VIN: ${vehicle.vin}. Please try again.`
        );
      });
  };

  // Render the select element
  return (
    <select
      className="bg-gray-700 no-print-arrow print:bg-white hover:bg-gray-600 print:hover:bg-white cursor-pointer max-w-24 text-gray-200 print:text-black text-xs px-1 py-0.5 rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
      value={status} // Controlled component using local state
      onChange={handleChange}
      // Prevent click events on the dropdown from propagating to the table row
      onClick={(e) => e.stopPropagation()}
    >
      {/* Default disabled option */}
      <option value="" disabled>
        Select
      </option>
      {/* Map over predefined locations to create options */}
      {LOCATIONS.map((loc) => (
        <option key={loc} value={loc}>
          {loc}
        </option>
      ))}
    </select>
  );
}

// --- Main Inventory Manager Component ---
export default function InventoryManager() {
  // Hooks for routing, authentication, and component state
  const { inventoryId: routeInventoryId } = useParams(); // Get ID from URL
  const history = useHistory(); // For navigation
  const { currentUser, profile } = useAuth(); // Get user info

  // State for inventory data and vehicles
  const [inventoryData, setInventoryData] = useState(null);
  const [vehicles, setVehicles] = useState([]);

  // UI State
  const [showMetadata, setShowMetadata] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start loading initially
  const [error, setError] = useState(null);

  // --- TanStack Table State ---
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnSizing, setColumnSizing] = useState({});
  const [columnVisibility, setColumnVisibility] = useState({}); // Can be used later for show/hide columns

  // Derived state/variables
  const inventoryId = inventoryData?.id;
  const userId = currentUser?.uid;

  // Ref for debounced save function for column sizes
  const debouncedSaveColumnSizing = useRef(null);

  // --- Effect for Loading User Preferences (Column Sizes) ---
  useEffect(() => {
    if (!userId) return; // Don't load if no user

    const prefRef = ref(
      rtdb,
      `userPreferences/${userId}/inventoryTableColumnSizing`
    );
    console.log("Attempting to load column sizes from:", prefRef.toString());
    get(prefRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const savedSizing = snapshot.val();
          console.log("Loaded column sizes:", savedSizing);
          setColumnSizing(savedSizing || {}); // Set initial state from DB
        } else {
          console.log("No saved column sizes found for user.");
          setColumnSizing({}); // Use default if nothing saved
        }
      })
      .catch((err) => {
        console.error("Error loading column sizes:", err);
      });

    // --- Initialize Debounced Save Function ---
    debouncedSaveColumnSizing.current = debounce((newSizing) => {
      if (!userId || Object.keys(newSizing).length === 0) return;
      const saveRef = ref(
        rtdb,
        `userPreferences/${userId}/inventoryTableColumnSizing`
      );
      console.log(
        "Debounced save: Saving column sizes:",
        newSizing,
        "to",
        saveRef.toString()
      );
      set(saveRef, newSizing).catch((err) =>
        console.error("Error saving column sizes:", err)
      );
    }, 500); // 500ms debounce delay
  }, [userId]); // Rerun if userId changes

  // --- Effect for Saving Column Sizes ---
  useEffect(() => {
    if (
      debouncedSaveColumnSizing.current &&
      Object.keys(columnSizing).length > 0
    ) {
      // Check if the sizing actually changed from the initial load if needed,
      // but debouncing usually handles this well enough.
      debouncedSaveColumnSizing.current(columnSizing);
    }
  }, [columnSizing]); // Trigger whenever columnSizing state changes

  // --- Effect for Loading Inventory Data from Firebase ---
  useEffect(() => {
    setError(null); // Clear previous errors on ID change
    setIsLoading(true); // Set loading state
    setInventoryData(null); // Clear old data
    setVehicles([]); // Clear old vehicles

    let unsubscribe = () => {}; // Firebase listener cleanup function

    if (!routeInventoryId) {
      console.log("No inventory ID specified in the route.");
      setError("No inventory ID specified.");
      setIsLoading(false);
      return; // Exit effect early
    }

    let dataRef;
    if (routeInventoryId === "current") {
      console.log("Fetching current inventory...");
      dataRef = query(
        ref(rtdb, "inventories"),
        orderByChild("createdAt"),
        limitToLast(1)
      );
    } else {
      console.log(`Fetching inventory with ID: ${routeInventoryId}`);
      dataRef = ref(rtdb, `inventories/${routeInventoryId}`);
    }

    unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          console.warn(`Inventory data not found for ID: ${routeInventoryId}`);
          setError(`Inventory not found for ID: ${routeInventoryId}`);
          setInventoryData(null);
          setVehicles([]);
        } else {
          let id, val;
          if (routeInventoryId === "current") {
            const entries = Object.entries(snapshot.val());
            if (entries.length > 0) {
              [id, val] = entries[0];
              console.log(`Current inventory loaded, ID: ${id}`);
            } else {
              console.warn("Query for 'current' inventory returned no data.");
              setError("Could not find the current inventory.");
              setInventoryData(null);
              setVehicles([]);
              setIsLoading(false);
              return;
            }
          } else {
            id = routeInventoryId;
            val = snapshot.val();
            console.log(`Inventory ${id} loaded.`);
          }
          setInventoryData({ id: id, ...val });
          setVehicles(val.vehicles ? Object.values(val.vehicles) : []);
          setError(null); // Clear error on successful load
        }
        setIsLoading(false); // Turn off loading indicator
      },
      (firebaseError) => {
        console.error("Firebase read error:", firebaseError);
        setError(`Failed to load inventory: ${firebaseError.message}`);
        setInventoryData(null);
        setVehicles([]);
        setIsLoading(false);
      }
    );

    // Cleanup function
    return () => {
      console.log("Detaching Firebase listener for ID:", routeInventoryId);
      unsubscribe();
    };
  }, [routeInventoryId, history]); // Dependency array

  // --- Function to Create New Inventory from Algolia Data ---
  const handleCreateNew = async () => {
    if (!currentUser || !profile) {
      alert("You must be logged in to create a new inventory.");
      return;
    }

    setIsLoading(true); // Indicate loading process
    setError(null);
    console.log("Attempting to create new inventory from Algolia...");

    try {
      // Fetch data from the specified Algolia index
      const response = await fetch(
        "https://sewjn80htn-dsn.algolia.net/1/indexes/rairdonshondaofburien-legacymigration0222_production_inventory_low_to_high/query",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // SECURITY WARNING: Exposing API keys client-side is risky.
            // Consider moving this fetch to a backend function.
            "x-algolia-api-key": "179608f32563367799314290254e3e44",
            "x-algolia-application-id": "SEWJN80HTN",
          },
          body: JSON.stringify({
            hitsPerPage: 999, // Fetch a large number of hits
            query: "", // Empty query to get all relevant items
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

      if (!response.ok) {
        throw new Error(`Algolia fetch failed with status: ${response.status}`);
      }
      const data = await response.json();
      if (!data || !data.hits) {
        throw new Error(
          "Invalid response structure from Algolia. No 'hits' found."
        );
      }
      console.log(`Received ${data.hits.length} hits from Algolia.`);

      // Prepare the new inventory data for Firebase
      const newInventoryRef = push(ref(rtdb, "inventories"));
      const newInventoryId = newInventoryRef.key;
      const now = Date.now();

      const vehiclesForFirebase = {};
      data.hits.forEach((item) => {
        const key =
          item.vin ||
          `noVin_${
            item.objectID || Math.random().toString(36).substring(2, 11)
          }`;
        if (!item.vin) {
          console.warn(
            "Vehicle missing VIN from Algolia, using fallback key:",
            key,
            "Data:",
            item
          );
        }
        vehiclesForFirebase[key] = {
          stock: item.stock || "N/A",
          year: item.year || "N/A",
          make: item.make || "N/A",
          model: item.model || "N/A",
          vin: item.vin || key,
          days_in_stock: item.days_in_stock || 0,
          msrp: item.msrp || 0,
          our_price: item.our_price || 0,
          location: item.location || "N/A",
          status: null,
        };
      });

      const newInventoryData = {
        createdAt: now,
        updatedAt: now,
        createdBy: {
          userId: currentUser.uid,
          displayName:
            profile.displayName || currentUser.email || "Unknown User",
        },
        source: "Algolia Fetch",
        vehicles: vehiclesForFirebase,
      };

      console.log(`Writing new inventory (${newInventoryId}) to Firebase...`);
      await set(newInventoryRef, newInventoryData);
      console.log(`Successfully created new inventory: ${newInventoryId}`);

      history.push(`/inventory/${newInventoryId}`); // Navigate to the new inventory
    } catch (err) {
      console.error("Error creating new inventory:", err);
      setError(`Failed to create new inventory: ${err.message}`);
      alert(`Failed to create new inventory: ${err.message}`);
    } finally {
      setIsLoading(false); // Ensure loading indicator is turned off
    }
  };

  // --- Define Table Columns (useMemo) ---
  const columns = useMemo(
    () => [
      {
        accessorKey: "status",
        header: "Status",
        cell: StatusDropdown,
        enableSorting: true,
        enableColumnFilter: true,
        size: columnSizing["status"] || 100,
        minSize: 80,
      },
      {
        accessorKey: "stock",
        header: "Stock #",
        cell: (info) => info.getValue(),
        enableSorting: true,
        enableColumnFilter: true,
        size: columnSizing["stock"] || 80,
        minSize: 60,
      },
      {
        accessorKey: "year",
        header: "Year",
        cell: (info) => info.getValue(),
        enableSorting: true,
        enableColumnFilter: true,
        size: columnSizing["year"] || 60,
        minSize: 50,
      },
      {
        accessorKey: "make",
        header: "Make",
        cell: (info) => info.getValue(),
        enableSorting: true,
        enableColumnFilter: true,
        size: columnSizing["make"] || 100,
        minSize: 80,
      },
      {
        accessorKey: "model",
        header: "Model",
        cell: (info) => info.getValue(),
        enableSorting: true,
        enableColumnFilter: true,
        size: columnSizing["model"] || 150,
        minSize: 100,
      },
      {
        accessorKey: "vin",
        header: "VIN",
        cell: (info) => info.getValue(),
        enableSorting: true,
        enableColumnFilter: false, // VIN is usually unique
        size: columnSizing["vin"] || 170,
        minSize: 150,
      },
      {
        accessorKey: "days_in_stock",
        header: "Days",
        cell: (info) => info.getValue(),
        enableSorting: true,
        enableColumnFilter: false, // Needs range filter
        size: columnSizing["days_in_stock"] || 50,
        minSize: 40,
      },
      {
        accessorKey: "msrp",
        header: "MSRP",
        cell: (info) => {
          const msrp = Number(info.getValue() || 0);
          return msrp ? `$${msrp.toLocaleString()}` : "N/A";
        },
        enableSorting: true,
        enableColumnFilter: false, // Needs range filter
        size: columnSizing["msrp"] || 90,
        minSize: 70,
      },
      {
        accessorKey: "our_price",
        header: "Price",
        cell: (info) => {
          const price = info.getValue();
          return !isNaN(price) && Number(price) > 0
            ? `$${Number(price).toLocaleString()}`
            : "Call";
        },
        enableSorting: true,
        enableColumnFilter: false, // Needs range filter
        size: columnSizing["our_price"] || 90,
        minSize: 70,
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: (info) => mapAddress(info.getValue()),
        enableSorting: true,
        enableColumnFilter: true,
        size: columnSizing["location"] || 80,
        minSize: 60,
      },
    ],
    [columnSizing]
  ); // Rerun if columnSizing changes

  // --- Instantiate the TanStack Table ---
  const table = useReactTable({
    data: vehicles,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      columnSizing,
      columnVisibility,
    },
    onSortingChange: setSorting,
    // Debounced global filter update
    onGlobalFilterChange: debounce(setGlobalFilter, 300),
    onColumnFiltersChange: setColumnFilters,
    onColumnSizingChange: setColumnSizing,
    onColumnVisibilityChange: setColumnVisibility,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    meta: { inventoryId: inventoryId },
    defaultColumn: { minSize: 40, maxSize: 500 },
  });

  // --- Debounced Global Filter Handler for Toolbar ---
  const [searchInput, setSearchInput] = useState(globalFilter);
  const handleSearchInputChange = (value) => {
    setSearchInput(value);
    table.options.onGlobalFilterChange(value); // Call the debounced function
  };
  useEffect(() => {
    setSearchInput(globalFilter);
  }, [globalFilter]);

  // --- Render the Component JSX ---
  return (
    <div className="bg-gray-900 text-gray-100 print:bg-white print:text-black min-h-screen p-4 flex flex-col">
      {/* Toolbar Section */}
      <Toolbar
        inventoryData={inventoryData}
        handleCreateNew={handleCreateNew}
        searchTerm={searchInput} // Use intermediate state for input value
        setSearchTerm={handleSearchInputChange} // Use handler for debounced update
        showMetadata={showMetadata}
        setShowMetadata={setShowMetadata}
        vehiclesCount={vehicles.length}
        isLoading={isLoading} // Pass loading state
      />

      {/* Error Display Area */}
      {error && (
        <div className="bg-red-800 text-white p-3 rounded-md my-4 border border-red-600 shadow-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && ( // Show loading indicator whenever isLoading is true
        <div className="text-center my-4 p-4 bg-gray-800 rounded-md text-gray-300">
          Loading Inventory Data...
        </div>
      )}

      {/* Optional Metadata Section - Render only if data loaded and toggled */}
      {!isLoading && inventoryData && showMetadata && (
        <Metadata inventoryData={inventoryData} />
      )}

      {/* Table Section - Render only if not loading and inventory data exists */}
      {!isLoading && inventoryData && (
        <div className="overflow-x-auto mt-4 flex-grow shadow-md rounded-lg">
          <table className="w-full border-collapse text-sm table-fixed">
            {/* Table Header */}
            <thead className="bg-gray-800 print:bg-gray-100 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className="p-2 text-left font-semibold text-gray-300 print:text-black border-b border-r border-gray-700 print:border-gray-300 relative group"
                      style={{ width: header.getSize() }}
                    >
                      <div
                        className={`flex items-center justify-between ${
                          header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : ""
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {/* Left side: Header Text + Sort Indicator */}
                        <span className="flex-grow pr-1">
                          {" "}
                          {/* Allow text to take space */}
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          {{ asc: " 🔼", desc: " 🔽" }[
                            header.column.getIsSorted()
                          ] ?? null}
                        </span>
                        {/* Right side: Filter Component */}
                        <Filter column={header.column} table={table} />
                      </div>
                      {/* Resize Handle */}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`absolute top-0 right-0 h-full w-1.5 bg-gray-600 cursor-col-resize select-none touch-none opacity-0 group-hover:opacity-100 hover:bg-blue-600 ${
                            header.column.getIsResizing()
                              ? "bg-blue-500 opacity-100"
                              : ""
                          }`}
                          title="Resize column"
                        />
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            {/* Table Body */}
            <tbody className="divide-y divide-gray-700 print:divide-gray-300">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-4 text-center text-gray-500 italic"
                  >
                    {vehicles.length === 0
                      ? "This inventory is empty."
                      : "No vehicles match your search or filter criteria."}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-800 print:hover:bg-gray-50 transition-colors duration-150"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="p-2 whitespace-nowrap print:text-black border-r border-gray-700"
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Fallback message if loading finished but no data/inventory found */}
      {!isLoading && !inventoryData && (
        <div className="text-center my-4 p-4 bg-gray-800 rounded-md text-gray-400">
          {error ? `Error: ${error}` : "No inventory data found or specified."}
        </div>
      )}
    </div>
  );
}
