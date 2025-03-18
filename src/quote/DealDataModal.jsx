// DealDataModal.jsx
import React, { useState } from "react";
import GenericModal from "./GenericModal";
import useModal from "./useModal";

const dealerships = [
  {
    storeId: "123",
    shortName: "HofB",
    longName: "Honda Burien",
    legalName: "HOFB Inc. dba Honda of Burien",
    address: "15206 1st Ave S. Burien, King, WA 98148",
    addressLine1: "15206 1st Ave S.",
    addressLine2: "Burien, King, WA 98148",
  },
  {
    storeId: "124",
    shortName: "RAO",
    longName: "Rairdon Auto Outlet",
    legalName: "Rairdon Auto Outlet",
    address: "14555 1st Ave S, Burien, WA 98166",
    addressLine1: "14555 1st Ave S",
    addressLine2: "Burien, King, WA 98166",
  },
];

const DealDataModal = ({ initialDealData, onConfirm, onCancel, users }) => {
  const { modalRef } = useModal();
  const defaultDealership = dealerships.find((d) => d.storeId === "123") || dealerships[0];

  // Initial state includes all buyer fields plus co-buyer fields (initially empty)
  const [dealData, setDealData] = useState(
    initialDealData || {
      dealership: defaultDealership,
      dealNumber: "",
      customerNumber: "",
      customerFullName: "",
      customerPhone: "",
      customerEmail: "",
      customerAddress: "",
      selectedUser: users?.length > 0 ? users[0].id : "",
      coBuyerFullName: "",
      coBuyerPhone: "",
      coBuyerEmail: "",
      coBuyerAddress: "",
    }
  );

  // Toggle for co-buyer fields
  const [showCoBuyer, setShowCoBuyer] = useState(false);

  // Generic change handler for text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDealData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for dealership dropdown
  const handleDealershipChange = (e) => {
    const selectedStoreId = e.target.value;
    const selectedDealership = dealerships.find((dealer) => dealer.storeId === selectedStoreId);
    setDealData((prev) => ({
      ...prev,
      dealership: selectedDealership || {},
    }));
  };

  // Copy only address from buyer to co-buyer
  const handleCopyAddress = () => {
    setDealData((prev) => ({
      ...prev,
      coBuyerAddress: prev.customerAddress,
    }));
  };

  // Swap buyer and co-buyer details (all fields)
  const handleSwapBuyerAndCoBuyer = () => {
    setDealData((prev) => ({
      ...prev,
      customerFullName: prev.coBuyerFullName,
      customerPhone: prev.coBuyerPhone,
      customerEmail: prev.coBuyerEmail,
      customerAddress: prev.coBuyerAddress,
      coBuyerFullName: prev.customerFullName,
      coBuyerPhone: prev.customerPhone,
      coBuyerEmail: prev.customerEmail,
      coBuyerAddress: prev.customerAddress,
    }));
  };

  // Toggle co-buyer fields; when hiding, clear co-buyer data
  const toggleCoBuyer = () => {
    if (showCoBuyer) {
      // Clearing co-buyer data on removal
      setDealData((prev) => ({
        ...prev,
        coBuyerFullName: "",
        coBuyerPhone: "",
        coBuyerEmail: "",
        coBuyerAddress: "",
      }));
    }
    setShowCoBuyer((prev) => !prev);
  };

  const handleConfirm = () => {
    onConfirm(dealData);
  };

  return (
    <GenericModal modalRef={modalRef}>
      <h2 className="text-lg font-bold mb-2 text-white">Edit Deal Data</h2>
      
      {/* Dealership Select */}
      <div className="mb-2">
        <label className="block text-sm mb-1 text-white">Dealership:</label>
        <select
          name="dealership"
          value={dealData.dealership?.storeId || ""}
          onChange={handleDealershipChange}
          className="w-full border border-gray-600 p-2 rounded bg-white bg-opacity-5 text-white"
        >
          {dealerships.map((dealer) => (
            <option key={dealer.storeId} className="bg-black text-white" value={dealer.storeId}>
              {dealer.longName}
            </option>
          ))}
        </select>
      </div>

      {/* Buyer Fields */}
      <div className="mb-2">
        <label className="block text-sm mb-1 text-white">Deal #:</label>
        <input
          type="text"
          name="dealNumber"
          value={dealData.dealNumber}
          onChange={handleChange}
          className="w-full border border-gray-600 p-2 rounded bg-white bg-opacity-5 text-white"
        />
      </div>
      
      <div className="mb-2">
        <label className="block text-sm mb-1 text-white">Customer #:</label>
        <input
          type="text"
          name="customerNumber"
          value={dealData.customerNumber}
          onChange={handleChange}
          className="w-full border border-gray-600 p-2 rounded bg-white bg-opacity-5 text-white"
        />
      </div>
      
      <div className="mb-2">
        <label className="block text-sm mb-1 text-white">Buyer Full Name:</label>
        <input
          type="text"
          name="customerFullName"
          value={dealData.customerFullName}
          onChange={handleChange}
          className="w-full border border-gray-600 p-2 rounded bg-white bg-opacity-5 text-white"
        />
      </div>
      
      <div className="mb-2">
        <label className="block text-sm mb-1 text-white">Buyer Phone:</label>
        <input
          type="text"
          name="customerPhone"
          value={dealData.customerPhone}
          onChange={handleChange}
          className="w-full border border-gray-600 p-2 rounded bg-white bg-opacity-5 text-white"
        />
      </div>
      
      <div className="mb-2">
        <label className="block text-sm mb-1 text-white">Buyer Email:</label>
        <input
          type="email"
          name="customerEmail"
          value={dealData.customerEmail}
          onChange={handleChange}
          className="w-full border border-gray-600 p-2 rounded bg-white bg-opacity-5 text-white"
        />
      </div>
      
      <div className="mb-2">
        <label className="block text-sm mb-1 text-white">Buyer Address:</label>
        <input
          type="text"
          name="customerAddress"
          value={dealData.customerAddress}
          onChange={handleChange}
          className="w-full border border-gray-600 p-2 rounded bg-white bg-opacity-5 text-white"
        />
      </div>
      
      <div className="mb-2">
        <label className="block text-sm mb-1 text-white">Assigned User:</label>
        <select
          name="selectedUser"
          value={dealData.selectedUser}
          onChange={handleChange}
          className="w-full border border-gray-600 p-2 rounded bg-white bg-opacity-5 text-white"
        >
          {users &&
            users.length > 0 &&
            users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.displayName}
              </option>
            ))}
        </select>
      </div>

      {/* Co-Buyer Toggle */}
      <div className="mb-2">
        <button
          type="button"
          onClick={toggleCoBuyer}
          className={`px-4 py-2 text-white rounded ${showCoBuyer ? "bg-red-500" : "bg-green-500"}`}
        >
          {showCoBuyer ? "Remove Co-Buyer" : "Add Co-Buyer"}
        </button>
      </div>

      {/* Co-Buyer Fields (Visible Only When Toggled) */}
      {showCoBuyer && (
        <>
          <div className="mb-2 flex items-center">
            <h3 className="text-lg font-bold text-white">Co-Buyer Information</h3>
            <button
              type="button"
              onClick={handleCopyAddress}
              className="ml-4 px-2 py-1 border border-gray-400 rounded text-white"
            >
              Copy Address from Buyer
            </button>
            <button
              type="button"
              onClick={handleSwapBuyerAndCoBuyer}
              className="ml-4 px-2 py-1 border border-gray-400 rounded text-white"
            >
              Swap Buyer & Co-Buyer
            </button>
          </div>
          <div className="mb-2">
            <label className="block text-sm mb-1 text-white">Co-Buyer Full Name:</label>
            <input
              type="text"
              name="coBuyerFullName"
              value={dealData.coBuyerFullName}
              onChange={handleChange}
              className="w-full border border-gray-600 p-2 rounded bg-white bg-opacity-5 text-white"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm mb-1 text-white">Co-Buyer Phone:</label>
            <input
              type="text"
              name="coBuyerPhone"
              value={dealData.coBuyerPhone}
              onChange={handleChange}
              className="w-full border border-gray-600 p-2 rounded bg-white bg-opacity-5 text-white"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm mb-1 text-white">Co-Buyer Email:</label>
            <input
              type="email"
              name="coBuyerEmail"
              value={dealData.coBuyerEmail}
              onChange={handleChange}
              className="w-full border border-gray-600 p-2 rounded bg-white bg-opacity-5 text-white"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm mb-1 text-white">Co-Buyer Address:</label>
            <input
              type="text"
              name="coBuyerAddress"
              value={dealData.coBuyerAddress}
              onChange={handleChange}
              className="w-full border border-gray-600 p-2 rounded bg-white bg-opacity-5 text-white"
            />
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 mt-4">
        <button onClick={onCancel} className="px-4 py-2 border border-gray-400 rounded text-white">
          Cancel
        </button>
        <button onClick={handleConfirm} className="px-4 py-2 bg-blue-700 text-white rounded">
          OK
        </button>
      </div>
    </GenericModal>
  );
};

export default DealDataModal;
