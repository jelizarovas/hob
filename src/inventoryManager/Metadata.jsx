import React from 'react'

export const Metadata = ({inventoryData}) => {
  return (
    <div className="mb-3 text-sm">
    <p>Inventory ID: {inventoryData.id}</p>
    <p>Created At: {formatTimestamp(inventoryData.createdAt)}</p>
    <p>Updated At: {formatTimestamp(inventoryData.updatedAt)}</p>
    <p>Created By: {inventoryData.createdBy?.displayName || "unknown"}</p>
  </div>
  )
}

  // --- UTILITY: Format Timestamp ---
  const formatTimestamp = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleString();
  };
