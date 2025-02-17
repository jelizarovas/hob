import React from "react";
import {
  MdAdd,
  MdCheck,
  MdBlock,
  MdDelete,
  MdSelectAll,
  MdClear,
} from "react-icons/md";

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
  onOpenAddUser,
}) {
  return (
    <div className="flex flex-row flex-wrap md:flex-row items-center justify-between space-y-0 md:space-y-0 md:space-x-0 p-1  transition-all  rounded">
      <div className="flex items-center space-x-1 w-full">
        <select
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
          className="p-0.5 w-16 bg-white bg-opacity-5 text-xs text-white rounded"
        >
          <option className="bg-gray-900" value="all">
            All
          </option>
          <option className="bg-gray-900" value="enabled">
            Active
          </option>
          <option className="bg-gray-900" value="disabled">
            Disabled
          </option>
        </select>
        <span className="flex-grow"></span>
        <button
          onClick={onSelectAll}
          className="flex items-center px-1 py-0.5 text-xs  rounded text-white"
        >
          <MdSelectAll className="mr-1" /> <span> Select All</span>
        </button>
        <button
          onClick={onSelectNone}
          className="flex items-center px-1 py-0.5 text-xs  rounded text-white"
        >
          <MdClear className="mr-1" /> <span> Select None</span>
        </button>
        <span className="flex-grow"></span>
        <button
          onClick={onOpenAddUser}
          className="flex items-center px-1 py-0.5 text-xs bg-green-600 hover:bg-green-700 rounded text-white"
        >
          <MdAdd className="mr-1" /> <span> Add User</span>
        </button>
      </div>
      {selectedCount > 0 && (
        <div className="flex items-center justify-center w-full space-x-4 pt-4 pb-2 transition-all">
          <>
            <button
              onClick={onBulkEnable}
              className="flex items-center px-1 py-0.5 text-xs bg-green-600 hover:bg-green-700 rounded text-white"
            >
              <MdCheck className="mr-1" /> Enable ({selectedCount})
            </button>
            <button
              onClick={onBulkDisable}
              className="flex items-center px-1 py-0.5 text-xs bg-yellow-600 hover:bg-yellow-700 rounded text-white"
            >
              <MdBlock className="mr-1" /> Disable ({selectedCount})
            </button>
            <button
              onClick={onBulkDelete}
              className="flex items-center px-1 py-0.5 text-xs bg-red-600 hover:bg-red-700 rounded text-white"
            >
              <MdDelete className="mr-1" /> Delete ({selectedCount})
            </button>
          </>
          {/* <button
          onClick={onExportExcel}
          className="flex items-center px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white"
          >
          Export as Excel
          </button> */}
        </div>
      )}
    </div>
  );
}
