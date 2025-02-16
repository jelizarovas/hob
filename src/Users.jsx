import React, { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { getAuth } from "firebase/auth";
import { Link } from "react-router-dom";
import { MdCheck, MdBlock, MdDelete } from "react-icons/md";

function UsersToolbar({ selectedCount, filterDisabled, onToggleFilter, onBulkDelete, onBulkDisable }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <button onClick={onToggleFilter} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded">
        {filterDisabled ? "Show All Accounts" : "Show Only Disabled"}
      </button>
      {selectedCount > 0 && (
        <div className="flex space-x-2">
          <button onClick={onBulkDisable} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded">
            Bulk Toggle Disable ({selectedCount})
          </button>
          <button onClick={onBulkDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded">
            Bulk Delete ({selectedCount})
          </button>
        </div>
      )}
    </div>
  );
}

function UserCard({ user, authInfo, selected, onSelect, onToggleDisable, onDelete }) {
  // Compute initials if no photoURL.
  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();
  const firestoreName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
  const authDisplayName = authInfo?.displayName;
  const nameMatches = authDisplayName && firestoreName === authDisplayName.trim();
  // Assume admin if user doc has isAdmin flag or if authInfo has a custom claim role "admin"
  const isAdmin = user?.isAdmin || (authInfo && authInfo.customClaims && authInfo.customClaims.role === "admin");

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
          <img src={authInfo.photoURL} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-white font-bold">{initials}</span>
        )}
      </div>
      <div className="flex-1">
        <Link to={`/users/${user.id}`} className="text-lg font-semibold hover:underline">
          {firestoreName}{" "}
          {authDisplayName &&
            (nameMatches ? (
              <span className="text-green-500">✓</span>
            ) : (
              <span className="text-gray-400">({authDisplayName})</span>
            ))}
        </Link>
        {isAdmin && (
          <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
            Admin
          </span>
        )}
      </div>
      <div className="flex space-x-2">
        {authInfo && (
          <button
            onClick={() => {
              if (
                window.confirm(
                  `Are you sure you want to ${authInfo.disabled ? "enable" : "disable"} this account?`
                )
              ) {
                onToggleDisable(user.id, authInfo.disabled);
              }
            }}
            className="p-2 bg-yellow-600 rounded hover:bg-yellow-700"
          >
            {authInfo.disabled ? <MdCheck size={20} /> : <MdBlock size={20} />}
          </button>
        )}
        {authInfo && (
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this account?")) {
                onDelete(user.id);
              }
            }}
            className="p-2 bg-red-600 rounded hover:bg-red-700"
          >
            <MdDelete size={20} />
          </button>
        )}
      </div>
    </div>
  );
}

export function Users() {
  const [firestoreUsers, setFirestoreUsers] = useState([]);
  const [authUsers, setAuthUsers] = useState([]);
  const [loadingFS, setLoadingFS] = useState(true);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [filterDisabled, setFilterDisabled] = useState(false);

  // Cloud Function URLs (update as needed)
  const listAccountsURL = "https://us-central1-honda-burien.cloudfunctions.net/listAccounts";
  const disableAccountURL = "https://us-central1-honda-burien.cloudfunctions.net/disableAccount";
  const enableAccountURL = "https://us-central1-honda-burien.cloudfunctions.net/enableAccount";
  const deleteAccountURL = "https://us-central1-honda-burien.cloudfunctions.net/deleteAccount";
  const makeMeAdminURL = "https://us-central1-honda-burien.cloudfunctions.net/makeMeAdmin";

  // Listen to Firestore "users" collection
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const profiles = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFirestoreUsers(profiles);
        setLoadingFS(false);
      },
      (err) => {
        console.error("Error fetching Firestore users:", err);
        setError(err);
        setLoadingFS(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Helper: fetch with current admin token
  const fetchWithAuth = async (url, options = {}) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return fetch(url, options);
  };

  // Check if current user is admin by reading token claims
  const checkAdminStatus = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const idTokenResult = await user.getIdTokenResult();
      setIsAdmin(!!idTokenResult?.claims?.role && idTokenResult.claims.role === "admin");
    }
  };
  useEffect(() => {
    checkAdminStatus();
  }, []);

  // Fetch auth accounts (if admin)
  const fetchAuthUsers = async () => {
    setLoadingAuth(true);
    try {
      const res = await fetchWithAuth(listAccountsURL, { method: "GET" });
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      setAuthUsers(data.users || []);
    } catch (err) {
      console.error("Error fetching auth accounts:", err);
      setAuthUsers([]);
    } finally {
      setLoadingAuth(false);
    }
  };
  useEffect(() => {
    if (isAdmin) fetchAuthUsers();
  }, [isAdmin]);

  // Build auth data map keyed by UID
  const authDataMap = useMemo(() => {
    const map = {};
    authUsers.forEach((user) => {
      if (user.uid) map[user.uid] = user;
    });
    return map;
  }, [authUsers]);

  const authStatusClass = (status) => {
    if (status === "Enabled") return "bg-green-500 text-white px-2 py-1 rounded";
    if (status === "Disabled") return "bg-red-500 text-white px-2 py-1 rounded";
    return "bg-gray-500 text-white px-2 py-1 rounded";
  };

  const toggleDisableAccount = async (uid, currentlyDisabled) => {
    const endpoint = currentlyDisabled ? enableAccountURL : disableAccountURL;
    try {
      const res = await fetchWithAuth(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      if (!res.ok) throw new Error("Failed to update account status");
      fetchAuthUsers();
    } catch (err) {
      console.error("Error updating account status:", err);
    }
  };

  const deleteAccount = async (uid) => {
    try {
      const res = await fetchWithAuth(deleteAccountURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      if (!res.ok) throw new Error("Failed to delete account");
      fetchAuthUsers();
    } catch (err) {
      console.error("Error deleting account:", err);
    }
  };

  const handleSelectUser = (uid) => {
    setSelectedUserIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleBulkDelete = async () => {
    if (window.confirm("Are you sure you want to delete selected accounts?")) {
      for (const uid of selectedUserIds) {
        await deleteAccount(uid);
      }
      setSelectedUserIds([]);
    }
  };

  const handleBulkDisable = async () => {
    if (window.confirm("Are you sure you want to toggle disable for selected accounts?")) {
      for (const uid of selectedUserIds) {
        const authInfo = authDataMap[uid];
        await toggleDisableAccount(uid, authInfo ? authInfo.disabled : false);
      }
      setSelectedUserIds([]);
    }
  };

  const handleToggleFilter = () => {
    setFilterDisabled((prev) => !prev);
  };

  // Promote self to admin if needed.
  const handleMakeMeAdmin = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    try {
      const res = await fetchWithAuth(makeMeAdminURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, secret: "devsecret" }),
      });
      if (!res.ok) throw new Error("Failed to promote account");
      await user.getIdToken(true);
      checkAdminStatus();
    } catch (err) {
      console.error("Error promoting account:", err);
    }
  };

  // "Add New Account" form state
  const [newEmail, setNewEmail] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");

  const handleAddAccount = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "users"), {
        email: newEmail,
        displayName: newDisplayName,
      });
      setNewEmail("");
      setNewDisplayName("");
    } catch (err) {
      console.error("Error adding account to Firestore:", err);
      setError(err);
    }
  };

  // Optionally filter Firestore users if filterDisabled is true.
  const filteredFirestoreUsers = filterDisabled
    ? firestoreUsers.filter((u) => {
        const uid = u.uid || u.id;
        const authInfo = authDataMap[uid];
        return authInfo && authInfo.disabled;
      })
    : firestoreUsers;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold text-center mb-4">User Management</h1>

      {!isAdmin && (
        <div className="mb-4 text-center">
          <p className="mb-2">You are not an admin.</p>
          <button onClick={handleMakeMeAdmin} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded">
            Make Me Admin
          </button>
        </div>
      )}

      <UsersToolbar
        selectedCount={selectedUserIds.length}
        filterDisabled={filterDisabled}
        onToggleFilter={handleToggleFilter}
        onBulkDelete={handleBulkDelete}
        onBulkDisable={handleBulkDisable}
      />

      {loadingFS ? (
        <p className="text-center text-gray-400">Loading Firestore users...</p>
      ) : (
        <>
          <div className="space-y-4">
            {filteredFirestoreUsers.map((user) => {
              const uid = user.uid || user.id;
              const authInfo = authDataMap[uid];
              return (
                <UserCard
                  key={uid}
                  user={user}
                  authInfo={authInfo}
                  selected={selectedUserIds.includes(uid)}
                  onSelect={handleSelectUser}
                  onToggleDisable={toggleDisableAccount}
                  onDelete={deleteAccount}
                />
              );
            })}
          </div>
          <form onSubmit={handleAddAccount} className="mt-8 max-w-md mx-auto bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-center mb-4">Add New Account</h2>
            <div className="mb-4">
              <label htmlFor="newEmail" className="block mb-1">Email</label>
              <input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="newDisplayName" className="block mb-1">Full Name</label>
              <input
                id="newDisplayName"
                type="text"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder="Enter full name"
                className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded">
              Add New Account
            </button>
          </form>
        </>
      )}
    </div>
  );
}
