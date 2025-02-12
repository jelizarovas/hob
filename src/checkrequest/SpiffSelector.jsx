import React from "react";
import { spiffTemplates } from "./spifftemplates";

const SpiffSelector = ({ selectedSpiffKey, onSelectSpiff }) => {
  const [showModal, setShowModal] = React.useState(false);

  const handleChange = (e) => {
    if (e.target.value === "...") {
      setShowModal(true);
    } else {
      onSelectSpiff(e.target.value);
    }
  };

  return (
    <>
      <div className="relative inline-block w-full">
        <select
          className="block appearance-none w-full bg-white bg-opacity-5 rounded outline-none min-w-36  border-gray-500 p-2 text-white focus:bg-opacity-10 hover:bg-opacity-15 transition-all cursor-pointer text-sm"
          value={selectedSpiffKey}
          onChange={handleChange}
        >
          {Object.keys(spiffTemplates)
            .filter((key) => spiffTemplates[key].featured)
            .map((key) => (
              <option key={key} value={key} className="bg-gray-900 p-1">
                {spiffTemplates[key].name}
              </option>
            ))}
          <option value="..." className="bg-gray-900">
            Show All
          </option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg className="h-4 w-4 fill-current text-white" viewBox="0 0 20 20">
            <path d="M5.516 7.548l4.484 4.484 4.484-4.484L16 8.516l-6 6-6-6z" />
          </svg>
        </div>
      </div>
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-gray-800 p-4 rounded w-96 z-[60]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-white text-lg mb-4">Select a Spiff Template</h2>
            <div className="flex flex-col space-y-2">
              {Object.keys(spiffTemplates).map((key) => {
                const template = spiffTemplates[key];
                return (
                  <button
                    key={key}
                    type="button"
                    className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-all text-white text-left flex flex-col"
                    onClick={() => {
                      onSelectSpiff(key);
                      setShowModal(false);
                    }}
                  >
                    <strong>{template.name}</strong>
                    <span>{template.description}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 text-right">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-white underline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SpiffSelector;
