// StoreInput.jsx
import React from "react";

/**
 * Reusable input with your desired styles.
 *
 * Props:
 * - label (string)
 * - value (string)
 * - onChange (func) => triggers on input change
 * - name (string) => used to identify the field
 */
export const StoreInput = ({ label, value, onChange, name }) => {
  return (
    <label className="block mb-2">
      <div className="mb-1">{label}</div>
      <input
        name={name}
        className="bg-white bg-opacity-0 hover:bg-opacity-5 rounded border border-white border-opacity-20 p-2 w-full"
        type="text"
        value={value}
        onChange={onChange}
      />
    </label>
  );
};
