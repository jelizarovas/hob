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
export const StoreInput = ({ label, value, onChange, name, className, labelClass }) => {
  return (
    <label className={`block mb-2 ${labelClass}`}>
      <div className="mb-1">{label}</div>
      <input
        name={name}
        className={`bg-white bg-opacity-0 hover:bg-opacity-5 rounded border border-white border-opacity-20 p-2 w-full ${className}`}
        type="text"
        value={value}
        onChange={onChange}
      />
    </label>
  );
};
