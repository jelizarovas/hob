// DealDataModal.jsx
import React, { useState } from "react";
import GenericModal from "./GenericModal";
import useModal from "./useModal";

const DealDataModal = ({ initialDealData, onConfirm, onCancel, users }) => {
  const { modalRef } = useModal();
  const [dealData, setDealData] = useState(
    initialDealData || {
      dealership: "HOFB Inc. dba Honda of Burien",
      address: "15206 1st Ave S. Burien, King, WA 98148",
      dealNumber: "",
      customerNumber: "",
      customerFullName: "",
      customerPhone: "",
      customerEmail: "",
      customerAddress: "",
      selectedUser: users && users?.length > 0 ? users?.[0]?.id : "",
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDealData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirm = () => {
    onConfirm(dealData);
  };

  return (
    <GenericModal modalRef={modalRef}>
      <h2 className="text-lg font-bold mb-2 text-white">Edit Deal Data</h2>
      <div className="mb-2">
        <label className="block text-sm mb-1 text-white">Dealership:</label>
        <select
          name="dealership"
          value={dealData.dealership}
          onChange={handleChange}
          className="w-full border border-gray-600 p-2 rounded bg-white bg-opacity-5 text-white"
        >
          {[
            {
              storeId: "123",
              shortName: "HofB",
              longName: "Honda Burien",
              legalName: "HOFB Inc. dba Honda of Burien",
              address: "15206 1st Ave S. Burien, King, WA 98148",
            },
          ].map((dealer) => (
            <option value={dealer}>{dealer?.longName}</option>
          ))}
        </select>
      </div>
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
        <label className="block text-sm mb-1 text-white">
          Customer Full Name:
        </label>
        <input
          type="text"
          name="customerFullName"
          value={dealData.customerFullName}
          onChange={handleChange}
          className="w-full border border-gray-600 p-2 rounded bg-white bg-opacity-5 text-white"
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm mb-1 text-white">Customer Phone:</label>
        <input
          type="text"
          name="customerPhone"
          value={dealData.customerPhone}
          onChange={handleChange}
          className="w-full border border-gray-600 p-2 rounded bg-white bg-opacity-5 text-white"
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm mb-1 text-white">Customer Email:</label>
        <input
          type="email"
          name="customerEmail"
          value={dealData.customerEmail}
          onChange={handleChange}
          className="w-full border border-gray-600 p-2 rounded bg-white bg-opacity-5 text-white"
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm mb-1 text-white">
          Customer Address:
        </label>
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
            users?.length > 0 &&
            users?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.displayName}
              </option>
            ))}
        </select>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
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

export default DealDataModal;
