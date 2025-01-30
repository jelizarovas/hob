import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  updateProfile,
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider,
} from "firebase/auth";
import { db, auth } from "./firebase";
import { useAuth } from "./auth/AuthProvider";
import ProfilePhotoUpload from "./ProfilePhotoUpload";

const Account = () => {
  const { currentUser } = useAuth();

  // Keep two copies: one for the original from DB, one for the current user edits
  const [originalData, setOriginalData] = useState({});
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    cell: "",
    storeNumber: "",
    address: "",
    website: "",
    apptScheduleUrl: "",
    contactUrl: "",
    profilePhoto: "",
  });

  const handlePhotoUploadComplete = async ({ mainURL, thumbURL }) => {
    try {
      // Save in Firestore
      const docRef = doc(db, "users", currentUser.uid);
      await updateDoc(docRef, {
        profilePhotoURL: mainURL,
        profilePhotoThumbURL: thumbURL,
      });
      // Update local state
      setUserData((prev) => ({
        ...prev,
        profilePhotoURL: mainURL,
        profilePhotoThumbURL: thumbURL,
      }));

      // Optionally update user photo in Auth:
      await updateProfile(currentUser, { photoURL: mainURL });
      alert("Photo updated!");
    } catch (err) {
      console.error("Failed to save photo:", err);
      alert("Failed to save photo URLs.");
    }
  };

  // Loading states for both user data save and password update
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // For password re-auth + updates
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Fetch user doc on mount
  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const docRef = doc(db, "users", currentUser.uid);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setUserData(snapshot.data());
          setOriginalData(snapshot.data());
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    })();
  }, [currentUser]);

  // Form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  // Determine if anything has changed by comparing userData to originalData
  const isModified = Object.keys(userData).some(
    (key) => userData[key] !== originalData[key]
  );

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Update Firestore
      const docRef = doc(db, "users", currentUser.uid);
      await updateDoc(docRef, { ...userData });

      // Update Firebase Auth displayName
      await updateProfile(currentUser, {
        displayName: `${userData.firstName} ${userData.lastName}`,
      });

      // Reflect new changes as “originalData” so the Save button re-disables
      setOriginalData(userData);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    // Basic checks
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill out all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    setIsUpdatingPassword(true);
    try {
      // Re-authenticate user with current password
      const user = auth.currentUser;
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);

      // Now we can safely update the password
      await updatePassword(user, newPassword);
      alert("Password updated successfully!");

      // Clear the fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      alert(
        "Could not update password. Please make sure your current password is correct."
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex space-x-4 text-2xl font-bold mb-4">
        <Link
          className="w-24 bg-white bg-opacity-5 flex items-center justify-center rounded hover:bg-opacity-20 transition-all"
          to="/"
        >
          <MdKeyboardArrowLeft />
        </Link>
        <h2 className="flex-grow px-4">Account Settings</h2>
      </div>

      {currentUser ? (
        <>
          <p className="text-lg mb-2">Email: {currentUser.email}</p>

          <form
            onSubmit={handleSave}
            className="flex flex-col space-y-4 max-w-md"
          >
            <AccountInput
              label="First Name"
              name="firstName"
              value={userData.firstName}
              originalValue={originalData.firstName}
              onChange={handleChange}
            />
            <AccountInput
              label="Last Name"
              name="lastName"
              value={userData.lastName}
              originalValue={originalData.lastName}
              onChange={handleChange}
            />
            <AccountInput
              label="Cell"
              name="cell"
              value={userData.cell}
              originalValue={originalData.cell}
              onChange={handleChange}
            />
            <AccountInput
              label="Store Number"
              name="storeNumber"
              value={userData.storeNumber}
              originalValue={originalData.storeNumber}
              onChange={handleChange}
            />
            <AccountInput
              label="Address"
              name="address"
              value={userData.address}
              originalValue={originalData.address}
              onChange={handleChange}
            />
            <AccountInput
              label="Website"
              name="website"
              value={userData.website}
              originalValue={originalData.website}
              onChange={handleChange}
            />
            <AccountInput
              label="Appointment Schedule URL"
              name="apptScheduleUrl"
              value={userData.apptScheduleUrl}
              originalValue={originalData.apptScheduleUrl}
              onChange={handleChange}
            />
            <AccountInput
              label="Contact URL"
              name="contactUrl"
              value={userData.contactUrl}
              originalValue={originalData.contactUrl}
              onChange={handleChange}
            />

            <button
              type="submit"
              disabled={!isModified || isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </form>

          <Link
            to="/account/vCard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-3 inline-block"
          >
            Generate Business Card
          </Link>

          <div className="p-4">
            <div className="mt-6">
              <ProfilePhotoUpload
                userId={currentUser.uid}
                onUploadComplete={handlePhotoUploadComplete}
              />
            </div>

            {userData.profilePhotoThumbURL && (
              <img
                src={userData.profilePhotoThumbURL}
                alt="Thumb"
                className="w-16 h-16 object-cover rounded-full mt-4"
              />
            )}
          </div>

          {/* Change Password Section */}
          <div className="mt-8 max-w-md">
            <h3 className="text-xl mb-2">Change Password</h3>
            <div className="flex flex-col space-y-2">
              <input
                type="password"
                placeholder="Current Password"
                className="bg-transparent px-2 py-1 border border-white border-opacity-10 rounded"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="New Password"
                autoComplete="new-password"
                className="bg-transparent px-2 py-1 border border-white border-opacity-10 rounded"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                autoComplete="new-password"
                className="bg-transparent px-2 py-1 border border-white border-opacity-10 rounded"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button
              onClick={handlePasswordChange}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isUpdatingPassword}
            >
              {isUpdatingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </>
      ) : (
        <p>Loading user...</p>
      )}
    </div>
  );
};

// Updated input component to highlight fields if value != originalValue
const AccountInput = ({
  label,
  name,
  value,
  originalValue,
  onChange,
  type = "text",
}) => {
  const hasChanged = value !== originalValue;
  // Tailwind classes to highlight changes (green border & label text)
  const highlightClass = hasChanged
    ? "border-green-400"
    : "border-white border-opacity-10";
  const labelClass = hasChanged
    ? "text-green-400 text-xs uppercase mb-1"
    : "text-xs uppercase opacity-50 mb-1";

  return (
    <label className="flex flex-col">
      <span className={labelClass}>{label}</span>
      <input
        className={`bg-transparent px-2 py-1 border rounded ${highlightClass}`}
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        autoComplete="off"
      />
    </label>
  );
};

export default Account;
