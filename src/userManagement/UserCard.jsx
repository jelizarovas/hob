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
    <div className="flex items-center p-1 bg-white bg-opacity-5 hover:bg-opacity-10  rounded-lg shadow">
      <div className="w-12 h-12 relative mx-1  flex items-center justify-center mr-4 overflow-hidden">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(user.id)}
          className=" absolute -top-0 -left-0 z-10 opacity-50 hover:opacity-100 cursor-pointer" 
        />
        {authInfo?.photoURL ? (
          <img
            src={authInfo.photoURL}
            alt="avatar"
            onClick={() => onSelect(user.id)}
            className="w-12 h-12 object-cover rounded-full cursor-pointer"
          />
        ) : (
          <span
            onClick={() => onSelect(user.id)}
            className="text-white text-xl p-2 cursor-pointer  w-12 h-12 font-bold rounded-full bg-gray-600"
          >
            {initials}
          </span>
        )}
      </div>
      <div className="flex-1 text-sm">
        <Link
          to={`/user/${user.id}`}
          className="text-sm font-semibold hover:underline"
        >
          {fullName}
        </Link>
        <p className="text-xs text-gray-400">{user.email}</p>
      </div>
      <div className="flex items-center text-xs space-x-2">
        <select
          value={authInfo?.role || "not set"}
          onChange={(e) =>
            onRoleChange && onRoleChange(user.id, e.target.value)
          }
          className="p-0.5 py-1 bg-white bg-opacity-5 text-white rounded"
        >
          <option className="bg-gray-900" value="admin">
            Admin
          </option>
          <option className="bg-gray-900" value="manager">
            Manager
          </option>
          <option className="bg-gray-900" value="user">
            User
          </option>
          <option className="bg-gray-900" value="not set">
            Not Set
          </option>
        </select>
        {authInfo && (
          <>
            {/* {JSON.stringify(authInfo, null, 2)} */}

            <button
              onClick={() => {
                if (
                  window.confirm(
                    `Are you sure you want to ${
                      authInfo.disabled ? "unlock" : "lock"
                    } this account?`
                  )
                ) {
                  onToggleDisable(user.id, authInfo.disabled);
                }
              }}
              className={`p-1 rounded ${authInfo.disabled ? "bg-yellow-600  hover:bg-yellow-700 " : "bg-gray-600  hover:bg-yellow-900"}`}
              title={authInfo.disabled ? "Unlock Account " : "Lock Account"}
            >
              {authInfo.disabled ? (
                <MdLockOpen size={20} />
              ) : (
                <MdLock size={20} />
              )}
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
              className="p-1 bg-red-600 rounded hover:bg-red-700"
            >
              <MdDelete size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
