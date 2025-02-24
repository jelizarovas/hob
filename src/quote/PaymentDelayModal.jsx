// PaymentDelayModal.jsx
import React, { useState, useEffect, useRef } from "react";

const PaymentDelayModal = ({ initialDelay, onConfirm, onCancel }) => {
  // If the initialDelay is one of the presets (30,45,90), preset is selected,
  // otherwise "custom" is selected.
  const presets = [30, 45, 90];
  const [selectedPreset, setSelectedPreset] = useState(
    presets.includes(initialDelay) ? String(initialDelay) : "custom"
  );
  const [customDelay, setCustomDelay] = useState(initialDelay);
  const [customDate, setCustomDate] = useState(""); // ISO date string
  const modalRef = useRef(null);

  // When a preset button is clicked, update the customDelay accordingly.
  const handlePresetClick = (value) => {
    setSelectedPreset(String(value));
    setCustomDelay(value);
  };

  // When "Custom" is clicked, mark it as selected.
  const handleCustomClick = () => {
    setSelectedPreset("custom");
  };

  // Update customDelay when the custom input changes.
  const handleCustomDelayChange = (e) => {
    const val = parseInt(e.target.value, 10);
    // Minimum value is 1.
    setCustomDelay(isNaN(val) || val < 1 ? 1 : val);
  };

  // Update customDate and auto-calculate delay from today's date.
  const handleDateChange = (e) => {
    const dateStr = e.target.value;
    setCustomDate(dateStr);
    const selectedDate = new Date(dateStr);
    const today = new Date();
    const diffTime = selectedDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // If the calculated delay is less than 1, set it to 1.
    setCustomDelay(diffDays < 1 ? 1 : diffDays);
    // Also mark custom as selected.
    setSelectedPreset("custom");
  };

  // Close modal if clicking outside.
  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onCancel();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // When confirming, send the chosen delay (customDelay).
  const handleConfirm = () => {
    onConfirm(customDelay, customDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div ref={modalRef} className="bg-black bg-opacity-90 p-6 max-w-md w-full mx-4 rounded-lg shadow-lg">
        <h2 className="text-lg font-bold mb-2 text-white">Payment Start Date</h2>
        <p className="text-sm mb-4 text-white">
          Delaying your first payment accrues extra interest. Select a delay (in days) below. Longer delays will
          increase your monthly payment.
        </p>
        <div className="text-xs opacity-50">Days</div>
        <div className="flex space-x-4 mb-4">
          {presets.map((option) => (
            <button
              key={option}
              onClick={() => handlePresetClick(option)}
              className={`px-4 py-1 md:px-4 md:py-2 rounded ${
                selectedPreset === String(option) ? "bg-blue-700 text-white" : "bg-white bg-opacity-5 text-white"
              }`}
            >
              {option} 
            </button>
          ))}
          <button
            onClick={handleCustomClick}
            className={`px-4 py-2 rounded ${
              selectedPreset === "custom" ? "bg-blue-700 text-white" : "bg-white bg-opacity-5 text-white"
            }`}
          >
            Custom
          </button>
        </div>
        {selectedPreset === "custom" && (
          <div className="mb-4">
            <label className="block text-sm mb-1 text-white">Custom Delay (days):</label>
            <input
              type="number"
              min="1"
              value={customDelay}
              onChange={handleCustomDelayChange}
              className="w-full border border-gray-600 p-2 rounded bg-white bg-opacity-5 text-white"
            />
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm mb-1 text-white">Or select a specific start date:</label>
          <input
            type="date"
            value={customDate}
            onChange={handleDateChange}
            className="w-full border border-gray-600 p-2 rounded bg-white bg-opacity-5 text-white"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button onClick={onCancel} className="px-4 py-2 border border-gray-400 rounded text-white">
            Cancel
          </button>
          <button onClick={handleConfirm} className="px-4 py-2 bg-blue-700 text-white rounded">
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDelayModal;
