import React from "react";
import { Link } from "react-router-dom";
import { MdBlock, MdDelete, MdLock, MdLockOpen } from "react-icons/md";

export function UserCard({
  user,
  authInfo,
  selected,
  onSelect,
  onToggleDisable,
  onDelete,
  onRoleChange,
}) {
  // Create a round avatar using initials.
  const initials = `${user?.firstName?.[0] || ""}${
    user?.lastName?.[0] || ""
  }`.toUpperCase();

  // Full name from Firestore fields.
  const fullName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "No Name";

  // Determine the current role; fallback to "user" if not set.
  const currentRole = authInfo?.role || "not set";

  return (
    <div className="flex items-center p-4 bg-gray-800 rounded-lg shadow">
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onSelect(user.id)}
        className="mr-2"
      />
      <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center mr-4 overflow-hidden">
        {authInfo?.photoURL ? (
          <img
            src={authInfo.photoURL}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white font-bold">{initials}</span>
        )}
      </div>
      <div className="flex-1">
        <Link
          to={`/users/${user.id}`}
          className="text-lg font-semibold hover:underline"
        >
          {fullName}
        </Link>
        <p className="text-sm text-gray-400">{user.email}</p>
      </div>
      <div className="flex items-center space-x-2">
        <select
          value={authInfo?.role || "not set"}
          onChange={(e) =>
            onRoleChange && onRoleChange(user.id, e.target.value)
          }
          className="p-2 bg-gray-700 text-white rounded"
        >
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="user">User</option>
          <option value="not set">Not Set</option>
        </select>
        {authInfo && (
          <>
          {/* {JSON.stringify(authInfo, null, 2)} */}

<button
  onClick={() => {
    if (
      window.confirm(
        `Are you sure you want to ${authInfo.disabled ? "unlock" : "lock"} this account?`
      )
    ) {
      onToggleDisable(user.id, authInfo.disabled);
    }
  }}
  className="p-2 bg-yellow-600 rounded hover:bg-yellow-700"
  title={authInfo.disabled ? "Unlock Account" : "Lock Account"}
>
  {authInfo.disabled ? <MdLockOpen size={20} /> : <MdLock size={20} />}
</button>

            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to delete this account?"
                  )
                ) {
                  onDelete(user.id);
                }
              }}
              className="p-2 bg-red-600 rounded hover:bg-red-700"
            >
              <MdDelete size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
