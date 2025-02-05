import React, { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "./firebase";

export function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newUid, setNewUid] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // Listen to the users collection
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const usersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching users:", err);
        setError(err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      // Add a new document to the "users" collection.
      await addDoc(collection(db, "users"), {
        uid: newUid || null,
        email: newEmail || null,
      });
      // Clear the form
      setNewUid("");
      setNewEmail("");
    } catch (err) {
      console.error("Error adding user:", err);
      setError(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Users Collection</h1>

      {loading ? (
        <p className="text-center text-gray-400">Loading users...</p>
      ) : error ? (
        <p className="text-center text-red-400">Error: {error.message}</p>
      ) : (
        <ul className="space-y-4">
          {users.map((user) => (
            <li key={user.id} className="bg-gray-800 p-4 rounded-lg shadow">
              <p>
                <span className="font-semibold">UID:</span>{" "}
                {user.id ? user.id : "N/A"}
              </p>
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {user.email ? user.email : "N/A"}
              </p>
              <p>
                <span className="font-semibold">First Name:</span>{" "}
                {user.firstName ? user.firstName : "N/A"}
              </p>
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {user.lastName ? user.lastName : "N/A"}
              </p>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={handleAddUser}
        className="mt-8 max-w-md mx-auto bg-gray-800 p-4 rounded-lg shadow-md"
      >
        <h2 className="text-xl font-semibold text-center mb-4">Add New User</h2>
        <div className="mb-4">
          <label htmlFor="uid" className="block mb-1">
            UID
          </label>
          <input
            id="uid"
            type="text"
            value={newUid}
            onChange={(e) => setNewUid(e.target.value)}
            placeholder="Enter UID (optional)"
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter email (optional)"
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
        >
          Add User
        </button>
      </form>
    </div>
  );
}
