import React, { useState } from "react";

export function AddUser({ onClose, onAddUser, currentUserRole }) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("not set");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddUser({ email, displayName, role });
    setEmail("");
    setDisplayName("");
    setRole("not set");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose} // Clicking outside closes the modal
    >
      <div
        className="bg-gray-900 text-white p-6 rounded shadow-lg max-w-md w-full"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
      >
        <h2 className="text-xl mb-4">Add New User</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="w-full p-2 rounded bg-gray-700"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="displayName" className="block mb-1">
              Full Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter full name"
              className="w-full p-2 rounded bg-gray-700"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="role" className="block mb-1">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 rounded bg-gray-700"
            >
              <option value="not set">Not Set</option>
              {currentUserRole === "admin" && (
                <option value="admin">Admin</option>
              )}
              <option value="manager">Manager</option>
              <option value="user">User</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
