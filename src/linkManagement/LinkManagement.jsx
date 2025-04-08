import React, { useState, useEffect } from "react";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase"; // your Firestore init
import { useAuth } from "../auth/AuthProvider"; // for currentUser, isAdmin, isPrivileged, etc.
import {
  FaLock,
  FaLockOpen,
  FaTrash,
  FaClipboard,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import { MdCopyAll } from "react-icons/md";

////////////////////////////////////////////////////////////////////////////////
// Helper function to get "time ago" strings
// In a real app, you'd probably use date-fns, dayjs, or moment.
////////////////////////////////////////////////////////////////////////////////
function timeAgo(timestamp) {
  if (!timestamp) return "N/A";
  const now = Date.now();
  const diffMs = now - timestamp.toMillis(); // toMillis() for Firestore Timestamp
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  // for simplicity
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears}y ago`;
}

export default function LinkManagement() {
  const { currentUser, isAdmin, isPrivileged } = useAuth();

  // Data from Firestore
  const [links, setLinks] = useState([]);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editLinkId, setEditLinkId] = useState(null);

  // Form data for create/edit
  const [formData, setFormData] = useState({
    slug: "",
    destination: "",
    expirationDate: "",
  });

  // Load data (simplest approach: once on mount, or on demand)
  useEffect(() => {
    fetchLinks();
  }, []);

  async function fetchLinks() {
    try {
      const colRef = collection(db, "links");
      // For demonstration, let's just do orderBy createdOn desc:
      const q = query(colRef, orderBy("createdOn", "desc"));
      const snap = await getDocs(q);
      const result = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setLinks(result);
    } catch (err) {
      console.error("Error fetching links:", err);
    }
  }

  // Handle input changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Add or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    const slug = formData.slug.trim().toLowerCase();
    const destination = formData.destination.trim();
    if (!slug || !destination) return;

    // Convert expirationDate input to a Firestore Timestamp if provided.
    let expirationTimestamp = null;
    if (formData.expirationDate) {
      expirationTimestamp = Timestamp.fromDate(
        new Date(formData.expirationDate)
      );
    }

    try {
      if (isEditing && editLinkId) {
        // Update existing doc
        await updateDoc(doc(db, "links", editLinkId), {
          slug,
          destination,
          expirationDate: expirationTimestamp,
        });
      } else {
        // Create new doc (with slug as the ID)
        await setDoc(doc(db, "links", slug), {
          slug,
          destination,
          clickCount: 0,
          expirationDate: expirationTimestamp,
          createdBy: {
            uid: currentUser?.uid || "unknown",
            displayName: currentUser?.displayName || "Anonymous",
          },
          createdOn: serverTimestamp(),
          lastAccessed: null,
          locked: false,
          lockedLevel: null,
        });
      }
      // Clear / reset
      setFormData({ slug: "", destination: "", expirationDate: "" });
      setIsEditing(false);
      setEditLinkId(null);
      // Refresh list
      fetchLinks();
    } catch (err) {
      console.error("Error creating/updating link:", err);
    }
  };

  // Start editing
  const handleEdit = (link) => {
    setIsEditing(true);
    setEditLinkId(link.id);
    setFormData({
      slug: link.slug,
      destination: link.destination,
    });
  };

  // Discard changes
  const handleDiscard = () => {
    setIsEditing(false);
    setEditLinkId(null);
    setFormData({ slug: "", destination: "" });
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this link?")) return;
    try {
      await deleteDoc(doc(db, "links", id));
      fetchLinks();
    } catch (err) {
      console.error("Error deleting link:", err);
    }
  };

  // Toggle lock
  const handleToggleLock = async (link) => {
    const { locked, lockedLevel } = link;
    const docRef = doc(db, "links", link.id);
    // If unlocked -> lock
    if (!locked) {
      if (isAdmin) {
        await updateDoc(docRef, {
          locked: true,
          lockedLevel: "admin",
        });
      } else if (isPrivileged) {
        await updateDoc(docRef, {
          locked: true,
          lockedLevel: "manager",
        });
      } else {
        alert("You do not have permission to lock this link.");
      }
    } else {
      // It's locked
      if (lockedLevel === "admin") {
        if (isAdmin) {
          await updateDoc(docRef, {
            locked: false,
            lockedLevel: null,
          });
        } else {
          alert("Only admin can unlock this link.");
        }
      } else if (lockedLevel === "manager") {
        if (isAdmin || isPrivileged) {
          await updateDoc(docRef, {
            locked: false,
            lockedLevel: null,
          });
        } else {
          alert("Only manager or admin can unlock this link.");
        }
      }
    }
    fetchLinks();
  };

  // Copy helper
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  };

  // Decide lock button styling
  const getLockButtonClass = (link) => {
    if (!link.locked) {
      // Unlocked: show a green-ish style
      return "bg-green-600 hover:bg-green-500";
    } else {
      // Locked: color depends on lockedLevel
      if (link.lockedLevel === "admin") {
        // Orange
        return "bg-orange-600 hover:bg-orange-500";
      } else {
        // Manager
        return "bg-yellow-600 hover:bg-yellow-500";
      }
    }
  };

  // Lock icon
  const getLockIcon = (link) => {
    return link.locked ? <FaLock /> : <FaLockOpen />;
  };

  const handleMouseDown = (e, url) => {
    if (e.button === 1) {
      // Middle mouse button
      // Open URL in new tab
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="p-4 min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Manage URLs</h1>

      {/* Add / Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-4 p-4 bg-gray-800 rounded flex flex-col gap-4 max-w-lg"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {isEditing ? "Edit Link" : "Create New Link"}
          </h2>
          {isEditing && (
            <button
              type="button"
              onClick={handleDiscard}
              className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
            >
              <FaTimes />
              <span>Discard</span>
            </button>
          )}
        </div>
        <div>
          <label className="block font-semibold mb-1">Slug</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
            placeholder="e.g. product123"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Destination</label>
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
            placeholder="e.g. https://example.com/my-product"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">
            Expiration Date (optional)
          </label>
          <input
            type="datetime-local"
            name="expirationDate"
            value={formData.expirationDate}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
          />
          <p className="text-sm text-gray-400">
            Set a date and time for the link to expire.
          </p>
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded"
        >
          {isEditing ? (
            <span className="flex items-center gap-2">
              <FaCheck />
              Save Changes
            </span>
          ) : (
            "Add Link"
          )}
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-800 rounded">
        <table className="min-w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-2">Slug</th>
              <th className="p-2">Destination</th>
              <th className="p-2">Created By</th>
              <th className="p-2">Created</th>
              <th className="p-2">Last Accessed</th>
              <th className="p-2">Clicks</th>
              <th className="p-2">Lock</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => {
              // Build short URL for copying
              const shortUrl = `https://gohofb.web.app/${link.slug}`;
              const customUrl = `https://go.hofb.app/${link.slug}`;
              const createdTime = link.createdOn
                ? timeAgo(link.createdOn)
                : "N/A";
              const accessedTime = link.lastAccessed
                ? timeAgo(link.lastAccessed)
                : "N/A";

              // Truncate destination for display
              const truncatedDest =
                link.destination.length > 40
                  ? link.destination.slice(0, 40) + "…"
                  : link.destination;

              return (
                <tr
                  key={link.id}
                  className="border-b border-gray-700 flex-wrap"
                >
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={customUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-400"
                      >
                        {link.slug}
                      </a>
                      <button
                        onMouseDown={(e) => handleMouseDown(e, shortUrl)}
                        onClick={() => handleCopy(shortUrl)}
                        className="text-sm bg-gray-700 hover:bg-gray-600 px-1 py-1 rounded"
                        title={`Copy ${shortUrl}`}
                      >
                        <MdCopyAll />
                      </button>
                      <button
                        onMouseDown={(e) => handleMouseDown(e, customUrl)}
                        onClick={() => handleCopy(customUrl)}
                        className="text-sm bg-green-700 hover:bg-green-600 px-1 py-1 rounded"
                        title={`Copy ${customUrl}`}
                      >
                        <MdCopyAll />
                      </button>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      {/* Truncate for display, show full in title/tooltip */}
                      <span
                        className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap"
                        title={link.destination}
                      >
                        {truncatedDest}
                      </span>
                      <button
                        onClick={() => handleCopy(link.destination)}
                        className="text-sm bg-gray-700 hover:bg-gray-600 px-1 py-1 rounded"
                        title="Copy destination"
                      >
                        <MdCopyAll />
                      </button>
                    </div>
                  </td>
                  <td className="p-2">
                    {link.createdBy?.displayName || "Unknown"}
                  </td>
                  <td className="p-2">{createdTime}</td>
                  <td className="p-2">{accessedTime}</td>
                  <td className="p-2">{link.clickCount || 0}</td>
                  <td className="p-2">
                    <button
                      onClick={() => handleToggleLock(link)}
                      className={`px-2 py-1 rounded flex items-center gap-1 ${getLockButtonClass(
                        link
                      )}`}
                      title={
                        link.locked
                          ? `Locked by ${link.lockedLevel}`
                          : "Unlocked"
                      }
                    >
                      {getLockIcon(link)}
                      {link.lockedLevel === "admin" && (
                        <span className="text-sm font-semibold">Admin</span>
                      )}
                      {link.lockedLevel === "manager" && (
                        <span className="text-sm font-semibold">Mgr</span>
                      )}
                    </button>
                  </td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(link)}
                      disabled={link.locked} // disallow editing if locked
                      className={`px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded ${
                        link.locked ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      disabled={link.locked} // disallow deleting if locked
                      className={`px-2 py-1 bg-red-600 hover:bg-red-500 rounded flex items-center gap-1 ${
                        link.locked ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
            {links.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-400">
                  No links found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
