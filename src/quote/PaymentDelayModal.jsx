// PaymentDelayModal.jsx
import React, { useState } from "react";
import GenericModal from "./GenericModal";
import useModal from "./useModal";

const PaymentDelayModal = ({ initialDelay, onConfirm, onCancel }) => {
  const presets = [30, 45, 90];
  const [selectedPreset, setSelectedPreset] = useState(
    presets.includes(initialDelay) ? String(initialDelay) : "custom"
  );
  const [customDelay, setCustomDelay] = useState(initialDelay);
  const [customDate, setCustomDate] = useState("");
  const { modalRef } = useModal(); // Using the hook’s ref for click-outside logic

  const handlePresetClick = (value) => {
    setSelectedPreset(String(value));
    setCustomDelay(value);
  };

  const handleCustomClick = () => {
    setSelectedPreset("custom");
  };

  const handleCustomDelayChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setCustomDelay(isNaN(val) || val < 1 ? 1 : val);
  };

  const handleDateChange = (e) => {
    const dateStr = e.target.value;
    setCustomDate(dateStr);
    const selectedDate = new Date(dateStr);
    const today = new Date();
    const diffTime = selectedDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setCustomDelay(diffDays < 1 ? 1 : diffDays);
    setSelectedPreset("custom");
  };

  const handleConfirm = () => {
    onConfirm(customDelay, customDate);
  };

  return (
    <GenericModal modalRef={modalRef}>
      <h2 className="text-lg font-bold mb-2 text-white">Payment Start Date</h2>
      <p className="text-sm mb-4 text-white">
        Delaying your first payment accrues extra interest. Select a delay (in
        days) below. Longer delays will increase your monthly payment.
      </p>
      <div className="text-xs opacity-50">Days</div>
      <div className="flex space-x-4 mb-4">
        {presets.map((option) => (
          <button
            key={option}
            onClick={() => handlePresetClick(option)}
            className={`px-4 py-2 rounded ${
              selectedPreset === String(option)
                ? "bg-blue-700 text-white"
                : "bg-white bg-opacity-5 text-white"
            }`}
          >
            {option}
          </button>
        ))}
        <button
          onClick={handleCustomClick}
          className={`px-4 py-2 rounded ${
            selectedPreset === "custom"
              ? "bg-blue-700 text-white"
              : "bg-white bg-opacity-5 text-white"
          }`}
        >
          Custom
        </button>
      </div>
      {selectedPreset === "custom" && (
        <div className="mb-4">
          <label className="block text-sm mb-1 text-white">
            Custom Delay (days):
          </label>
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
        <label className="block text-sm mb-1 text-white">
          Or select a specific start date:
        </label>
        <input
          type="date"
          value={customDate}
          onChange={handleDateChange}
          className="w-full border border-gray-600 p-2 rounded bg-white bg-opacity-5 text-white"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-400 rounded text-white"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="px-4 py-2 bg-blue-700 text-white rounded"
        >
          OK
        </button>
      </div>
    </GenericModal>
  );
};

export default PaymentDelayModal;
