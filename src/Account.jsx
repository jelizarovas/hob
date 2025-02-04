import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import {
  updateProfile,
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider,
} from "firebase/auth";
import { db, auth } from "./firebase";
import { useAuth } from "./auth/AuthProvider";
import ProfilePhotoUpload from "./ProfilePhotoUpload";
import { MyQRCode } from "./MyQRCode";

// 1) Import Skeleton
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

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

  // 2) Loading state specifically for user doc fetch
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // For photo upload
  const handlePhotoUploadComplete = async ({ mainURL, thumbURL }) => {
    try {
      const docRef = doc(db, "users", currentUser.uid);
      await updateDoc(docRef, {
        profilePhotoURL: mainURL,
        profilePhotoThumbURL: thumbURL,
      });
      setUserData((prev) => ({
        ...prev,
        profilePhotoURL: mainURL,
        profilePhotoThumbURL: thumbURL,
      }));
      await updateProfile(currentUser, { photoURL: mainURL });
      alert("Photo updated!");
    } catch (err) {
      console.error("Failed to save photo:", err);
      alert("Failed to save photo URLs.");
    }
  };

  // Loading states for saving user data & updating password
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 3) Fetch user doc on mount
  useEffect(() => {
    if (!currentUser) return;

    (async () => {
      setIsLoadingUser(true); // start loading
      try {
        const docRef = doc(db, "users", currentUser.uid);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          setUserData(snapshot.data());
          setOriginalData(snapshot.data());
        } else {
          // If no doc, create a default
          const defaults = { firstName: "", lastName: "" };
          await setDoc(docRef, defaults);
          setUserData(defaults);
          setOriginalData(defaults);
        }
      } catch (err) {
        console.error("Error fetching or creating user doc:", err);
      } finally {
        // End loading
        setIsLoadingUser(false);
      }
    })();
  }, [currentUser]);

  // Track changes in form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  // Check if any field is modified
  const isModified = Object.keys(userData).some(
    (key) => userData[key] !== originalData[key]
  );

  // Save form to Firestore
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const docRef = doc(db, "users", currentUser.uid);
      // Prepare updated data with lastUpdatedBy included
      const updatedData = {
        ...userData,
        lastUpdatedBy: {
          userId: currentUser.uid,
          displayName:
            currentUser.displayName ||
            `${userData.firstName} ${userData.lastName}`,
        },
      };
      await updateDoc(docRef, updatedData);

      await updateProfile(currentUser, {
        displayName: `${userData.firstName} ${userData.lastName}`,
      });

      setOriginalData(userData);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Update password
  const handlePasswordChange = async () => {
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
      const user = auth.currentUser;
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);

      await updatePassword(user, newPassword);
      alert("Password updated successfully!");

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

      {/* 4) If we are loading user data, show skeletons, otherwise show the main form */}
      {isLoadingUser ? (
        <div className="max-w-md">
          <Skeleton height={20} width={200} className="mb-2" />
          <Skeleton height={30} className="mb-4" />
          <Skeleton height={20} width={100} className="mb-2" />
          <Skeleton height={30} className="mb-4" />
          <Skeleton height={20} width={100} className="mb-2" />
          <Skeleton height={30} className="mb-4" />
          <Skeleton height={20} width={180} className="mb-2" />
          <Skeleton height={30} className="mb-4" />
          <Skeleton height={20} width={150} className="mb-2" />
          <Skeleton height={30} className="mb-4" />
        </div>
      ) : currentUser ? (
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

            <MyQRCode value={userData.contactUrl} />

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
        <p>No user found</p>
      )}
    </div>
  );
};

// The rest of the code remains the same
const AccountInput = ({
  label,
  name,
  value,
  originalValue,
  onChange,
  type = "text",
}) => {
  const hasChanged = value !== originalValue;
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
