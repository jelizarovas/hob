import React, { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { UsersToolbar } from "./UsersToolbar";
import { UserCard } from "./UserCard";
import { AddUser } from "./AddUser";

export function Users() {
  const [firestoreUsers, setFirestoreUsers] = useState([]);
  const [authUsers, setAuthUsers] = useState([]);
  const [loadingFS, setLoadingFS] = useState(true);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [filterValue, setFilterValue] = useState("all");
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Cloud Function URLs (for auth actions)
  const listAccountsURL =
    "https://us-central1-honda-burien.cloudfunctions.net/listAccounts";
  const disableAccountURL =
    "https://us-central1-honda-burien.cloudfunctions.net/disableAccount";
  const enableAccountURL =
    "https://us-central1-honda-burien.cloudfunctions.net/enableAccount";
  const deleteAccountURL =
    "https://us-central1-honda-burien.cloudfunctions.net/deleteAccount";
  const makeMeAdminURL =
    "https://us-central1-honda-burien.cloudfunctions.net/makeMeAdmin";
  const updateUserRoleURL =
    "https://us-central1-honda-burien.cloudfunctions.net/updateUserRole";

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

  // Check if current user is admin
  const checkAdminStatus = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const idTokenResult = await user.getIdTokenResult();
      setIsAdmin(
        !!idTokenResult?.claims?.role && idTokenResult.claims.role === "admin"
      );
    }
  };
  useEffect(() => {
    checkAdminStatus();
  }, []);

  // Fetch Auth users (if admin)
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

  // Build an auth data map keyed by UID.
  const authDataMap = useMemo(() => {
    const map = {};
    authUsers.forEach((user) => {
      if (user.uid) map[user.uid] = user;
    });
    return map;
  }, [authUsers]);

  // Bulk actions
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
    if (
      window.confirm(
        "Are you sure you want to toggle disable for selected accounts?"
      )
    ) {
      for (const uid of selectedUserIds) {
        const authInfo = authDataMap[uid];
        await toggleDisableAccount(uid, authInfo ? authInfo.disabled : false);
      }
      setSelectedUserIds([]);
    }
  };

  const handleExportExcel = () => {
    // Implement Excel export logic (e.g., with the xlsx library)
    console.log("Export as Excel");
  };

  const handleToggleFilter = (value) => {
    setFilterValue(value);
  };

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

  // Callback from AddUser modal
  const handleAddUser = async ({ email, displayName }) => {
    try {
      await addDoc(collection(db, "users"), { email, displayName });
      setShowAddUserModal(false);
    } catch (err) {
      console.error("Error adding account to Firestore:", err);
      setError(err);
    }
  };

  // Filter Firestore users based on filterValue
  const filteredFirestoreUsers = firestoreUsers.filter((u) => {
    const uid = u.uid || u.id;
    const authInfo = authDataMap[uid];
    if (filterValue === "enabled") {
      return authInfo && !authInfo.disabled;
    }
    if (filterValue === "disabled") {
      return authInfo && authInfo.disabled;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold text-center mb-4">User Management</h1>

      {!isAdmin && (
        <div className="mb-4 text-center">
          <p className="mb-2">You are not an admin.</p>
          <button
            onClick={handleMakeMeAdmin}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
          >
            Make Me Admin
          </button>
        </div>
      )}

      <UsersToolbar
        filterValue={filterValue}
        onFilterChange={handleToggleFilter}
        onSelectAll={() =>
          setSelectedUserIds(filteredFirestoreUsers.map((u) => u.uid || u.id))
        }
        onSelectNone={() => setSelectedUserIds([])}
        onBulkDelete={handleBulkDelete}
        onBulkDisable={handleBulkDisable}
        onExportExcel={handleExportExcel}
        selectedCount={selectedUserIds.length}
        onOpenAddUser={() => setShowAddUserModal(true)}
      />

      {loadingFS ? (
        <p className="text-center text-gray-400">Loading Firestore users...</p>
      ) : (
        <>
          <div className="space-y-4">
            {filteredFirestoreUsers.map((user) => {
              const uid = user.uid || user.id;
              const authInfo = authDataMap[uid];
              // If authInfo.role is not set, default to "not set"
              const role = authInfo?.role ? authInfo.role : "not set";
              if (authInfo) authInfo.role = role;
              return (
                <UserCard
                  key={uid}
                  user={user}
                  authInfo={authInfo}
                  selected={selectedUserIds.includes(uid)}
                  onSelect={handleSelectUser}
                  onToggleDisable={toggleDisableAccount}
                  onDelete={deleteAccount}
                  onRoleChange={(uid, newRole) => {
                    fetchWithAuth(updateUserRoleURL, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ uid, newRole }),
                    })
                      .then((res) => {
                        if (!res.ok) throw new Error("Failed to update role");
                        return res.json();
                      })
                      .then((data) => {
                        console.log(data.message);
                        // Optionally refresh auth data after role change.
                        fetchAuthUsers();
                      })
                      .catch((err) =>
                        console.error("Error updating role:", err)
                      );
                  }}
                />
              );
            })}
          </div>
          {showAddUserModal && (
            <AddUser
              onClose={() => setShowAddUserModal(false)}
              onAddUser={handleAddUser}
            />
          )}
        </>
      )}
    </div>
  );
}
