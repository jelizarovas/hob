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
  // isPrivileged is true if viewer's role is "admin" or "manager"
  const [isPrivileged, setIsPrivileged] = useState(false);
  const [viewerRole, setViewerRole] = useState("not set");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [filterValue, setFilterValue] = useState("enabled");
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Cloud Function URLs for Auth actions
  const listAccountsURL =
    "https://us-central1-honda-burien.cloudfunctions.net/listAccounts";
  const disableAccountURL =
    "https://us-central1-honda-burien.cloudfunctions.net/disableAccount";
  const enableAccountURL =
    "https://us-central1-honda-burien.cloudfunctions.net/enableAccount";
  const deleteAccountURL =
    "https://us-central1-honda-burien.cloudfunctions.net/deleteAccount";
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

  // Helper: fetch with current auth token
  const fetchWithAuth = async (url, options = {}) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      options.headers = { ...options.headers, Authorization: `Bearer ${token}` };
    }
    return fetch(url, options);
  };

  // Check viewer's role (admin/manager or not)
  const checkPrivilegeStatus = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const idTokenResult = await user.getIdTokenResult();
      const role = idTokenResult?.claims?.role || "not set";
      setViewerRole(role);
      setIsPrivileged(role === "admin" || role === "manager");
    }
  };
  useEffect(() => {
    checkPrivilegeStatus();
  }, []);

  // Fetch Auth users only if viewer is privileged
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
    if (isPrivileged) {
      fetchAuthUsers();
    }
  }, [isPrivileged]);

  // Build an auth data map keyed by UID.
  const authDataMap = useMemo(() => {
    const map = {};
    authUsers.forEach((user) => {
      if (user.uid) map[user.uid] = user;
    });
    return map;
  }, [authUsers]);

  // Bulk actions (only available for privileged users)
  const toggleDisableAccount = async (uid, currentlyDisabled) => {
    if (!isPrivileged) return;
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
    if (!isPrivileged) return;
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
    if (!isPrivileged) return;
    if (window.confirm("Are you sure you want to delete selected accounts?")) {
      for (const uid of selectedUserIds) {
        await deleteAccount(uid);
      }
      setSelectedUserIds([]);
    }
  };

  const handleBulkDisable = async () => {
    if (!isPrivileged) return;
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
    // Implement Excel export logic (e.g., using xlsx)
    console.log("Export as Excel");
  };

  const handleToggleFilter = (value) => {
    setFilterValue(value);
  };

  // Callback from AddUser modal to create a new user document with role.
  const handleAddUser = async ({ email, displayName, role }) => {
    try {
      await addDoc(collection(db, "users"), { email, displayName, role });
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
    <div className="min-h-screen bg-white bg-opacity-5 text-white p-1">

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
          <div className="space-y-2 px-0">
            {filteredFirestoreUsers.map((user) => {
              const uid = user.uid || user.id;
              const authInfo = authDataMap[uid];
              // If no role is set, default to "not set"
              if (authInfo && !authInfo.role) authInfo.role = "not set";
              return (
                <UserCard
                  key={uid}
                  user={user}
                  // Only pass authInfo if viewer is privileged; regular users see just basic info.
                  authInfo={isPrivileged ? authInfo : null}
                  selected={selectedUserIds.includes(uid)}
                  onSelect={isPrivileged ? handleSelectUser : () => {}}
                  onToggleDisable={isPrivileged ? toggleDisableAccount : () => {}}
                  onDelete={isPrivileged ? deleteAccount : () => {}}
                  onRoleChange={
                    isPrivileged
                      ? (uid, newRole) => {
                          fetchWithAuth(updateUserRoleURL, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ uid, newRole }),
                          })
                            .then((res) => {
                              if (!res.ok)
                                throw new Error("Failed to update role");
                              return res.json();
                            })
                            .then((data) => {
                              console.log(data.message);
                              fetchAuthUsers();
                            })
                            .catch((err) =>
                              console.error("Error updating role:", err)
                            );
                        }
                      : () => {}
                  }
                  viewerRole={viewerRole}
                />
              );
            })}
          </div>
          {showAddUserModal && (
            <AddUser
              onClose={() => setShowAddUserModal(false)}
              onAddUser={handleAddUser}
              currentUserRole={viewerRole}
            />
          )}
        </>
      )}
    </div>
  );
}
