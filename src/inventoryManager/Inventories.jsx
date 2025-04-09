// src/inventoryManager/Inventories.jsx

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../firebase"; // Make sure you've exported getDatabase(...) as rtdb

export default function Inventories() {
  const [inventories, setInventories] = useState([]);

  useEffect(() => {
    const invRef = ref(rtdb, "inventories");
    const unsubscribe = onValue(invRef, (snapshot) => {
      if (!snapshot.exists()) {
        setInventories([]);
      } else {
        const data = snapshot.val();
        // Convert object -> array => [{id, createdAt, ...}, ...]
        const array = Object.entries(data).map(([id, obj]) => ({
          id,
          ...obj,
        }));
        // Sort by createdAt descending
        array.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setInventories(array);
      }
    });
    return () => unsubscribe();
  }, []);

  // Helper: Format "Wednesday, 4/9/25"
  function formatDate(timestamp) {
    if (!timestamp) return "Unknown Date";
    const d = new Date(timestamp);
    // E.g. "long" weekday => Wednesday, numeric month/day => 4/9/25
    const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const year = String(d.getFullYear()).slice(-2); // '25'
    return `${weekday}, ${month}/${day}/${year}`;
  }

  // Helper: Relative time (days ago), or "Current" if it's the newest
  function relativeTime(inventory, newestTimestamp) {
    if (!inventory.createdAt) return "";
    if (inventory.createdAt === newestTimestamp) {
      return "Current";
    }
    const diffMs = Date.now() - inventory.createdAt;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 1) return "Today"; // If it was created earlier today
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  }

  if (!inventories.length) {
    return (
      <div className="bg-gray-900 text-gray-100 min-h-screen p-4">
        <h1 className="text-lg mb-2">Inventories</h1>
        <p>No inventories found.</p>
      </div>
    );
  }

  const newestTimestamp = inventories[0].createdAt || 0; // sorted descending

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen p-4">
      <h1 className="text-lg mb-4">Inventories</h1>

      <ul className="space-y-2">
        {inventories.map((inv) => {
          const dateStr = formatDate(inv.createdAt);
          const rel = relativeTime(inv, newestTimestamp);
          return (
            <li key={inv.id} className="border-b border-gray-700 pb-2">
              {/* Example link: "/inventory/:inventoryId" */}
              <Link to={`/inventory/${inv.id}`} className="text-blue-400 hover:underline">
                {dateStr}
              </Link>
              <span className="text-gray-400 ml-2">{rel && `- ${rel}`}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
