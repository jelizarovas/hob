import React from "react";
import { MdAdd, MdCheck, MdBlock, MdDelete, MdSelectAll, MdClear } from "react-icons/md";

export function UsersToolbar({
  filterValue,
  onFilterChange,
  onSelectAll,
  onSelectNone,
  onBulkEnable,
  onBulkDisable,
  onBulkDelete,
  onExportExcel,
  selectedCount,
  onOpenAddUser
}) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0 md:space-x-4 p-2 bg-gray-800 rounded">
      <div className="flex items-center space-x-2">
        <select
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
          className="p-2 bg-gray-700 text-white rounded"
        >
          <option value="all">Show All</option>
          <option value="enabled">Show Only Enabled</option>
          <option value="disabled">Show Only Disabled</option>
        </select>
        <button
          onClick={onSelectAll}
          className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
        >
          <MdSelectAll className="mr-1" /> Select All
        </button>
        <button
          onClick={onSelectNone}
          className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
        >
          <MdClear className="mr-1" /> Select None
        </button>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenAddUser}
          className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
        >
          <MdAdd className="mr-1" /> Add User
        </button>
        {selectedCount > 0 && (
          <>
            <button
              onClick={onBulkEnable}
              className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
            >
              <MdCheck className="mr-1" /> Enable Selected
            </button>
            <button
              onClick={onBulkDisable}
              className="flex items-center px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-white"
            >
              <MdBlock className="mr-1" /> Disable Selected
            </button>
            <button
              onClick={onBulkDelete}
              className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
            >
              <MdDelete className="mr-1" /> Delete Selected
            </button>
          </>
        )}
        {/* <button
          onClick={onExportExcel}
          className="flex items-center px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white"
        >
          Export as Excel
        </button> */}
      </div>
    </div>
  );
}
