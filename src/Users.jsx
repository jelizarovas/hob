import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

export function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUid, setUpdatingUid] = useState(null);
  const functions = getFunctions();

  // Fetch all auth users via callable function
  useEffect(() => {
    const listAuthUsers = httpsCallable(functions, 'listAuthUsers');
    listAuthUsers()
      .then((result) => {
        setUsers(result.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error listing users:', error);
        setLoading(false);
      });
  }, [functions]);

  const handleToggleUser = (user) => {
    setUpdatingUid(user.uid);
    const setUserLoginEnabled = httpsCallable(functions, 'setUserLoginEnabled');
    setUserLoginEnabled({
      targetUid: user.uid,
      disable: !user.disabled,
    })
      .then(() => {
        // Update the local state to reflect change
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.uid === user.uid ? { ...u, disabled: !u.disabled } : u
          )
        );
      })
      .catch((error) => {
        console.error('Error updating user status:', error);
      })
      .finally(() => {
        setUpdatingUid(null);
      });
  };

  if (loading) {
    return <p className="text-center text-gray-300">Loading users...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Auth Users</h1>
      <ul className="space-y-4">
        {users.map((user) => (
          <li key={user.uid} className="bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div>
                <h2 className="text-xl font-semibold">
                  {user.displayName || 'No Name'}
                </h2>
                <p className="text-gray-400">{user.email}</p>
                <p className="mt-1">
                  Status:{' '}
                  <span className={user.disabled ? 'text-red-400' : 'text-green-400'}>
                    {user.disabled ? 'Disabled' : 'Enabled'}
                  </span>
                </p>
              </div>
              <button
                onClick={() => handleToggleUser(user)}
                disabled={updatingUid === user.uid}
                className="mt-2 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {updatingUid === user.uid
                  ? 'Updating...'
                  : user.disabled
                  ? 'Enable Login'
                  : 'Disable Login'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
