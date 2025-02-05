import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
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
  // Get :uid from the URL (if present)
  const { uid } = useParams();

  // Keep two copies: one for the original from DB, one for current user edits.
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
    role: "", // e.g., "admin", "sales", etc.
  });

  // 2) Loading state for user doc fetch
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // For photo upload
  const handlePhotoUploadComplete = async ({ mainURL, thumbURL }) => {
    try {
      const docRef = doc(db, "users", targetUid());
      await updateDoc(docRef, {
        profilePhotoURL: mainURL,
        profilePhotoThumbURL: thumbURL,
      });
      setUserData((prev) => ({
        ...prev,
        profilePhotoURL: mainURL,
        profilePhotoThumbURL: thumbURL,
      }));
      if (isViewingOwnProfile()) {
        await updateProfile(auth.currentUser, { photoURL: mainURL });
      }
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

  // Utility: determine which user document to read
  const targetUid = () => {
    if (uid) return uid;
    return currentUser?.uid || null;
  };

  // Utility: check if viewing your own profile
  const isViewingOwnProfile = () => {
    return currentUser && currentUser.uid === targetUid();
  };

  // 3) Fetch user doc on mount or when uid/currentUser changes
  useEffect(() => {
    const fetchData = async () => {
      if (!targetUid()) return;
      setIsLoadingUser(true);
      try {
        const docRef = doc(db, "users", targetUid());
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setUserData(snapshot.data());
          setOriginalData(snapshot.data());
        } else {
          const defaults = { firstName: "", lastName: "", role: "" };
          await setDoc(docRef, defaults);
          setUserData(defaults);
          setOriginalData(defaults);
        }
      } catch (err) {
        console.error("Error fetching or creating user doc:", err);
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchData();
  }, [uid, currentUser]);

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
      const docRef = doc(db, "users", targetUid());
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
      if (isViewingOwnProfile()) {
        await updateProfile(auth.currentUser, {
          displayName: `${userData.firstName} ${userData.lastName}`,
        });
      }
      setOriginalData(userData);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Update password (only if viewing own profile)
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

  if (!targetUid()) {
    return <p>No user found or not logged in.</p>;
  }

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
      ) : (
        <>
          <p className="text-lg mb-2">Email: {currentUser.email}</p>
          {/* Display role if available */}
          {userData.role && (
            <p className="text-sm text-gray-400 mb-2">
              Role: <span className="font-semibold">{userData.role}</span>
            </p>
          )}
          <p className="text-lg mb-2">
            Viewing profile for UID: <strong>{targetUid()}</strong>
          </p>
          {!isViewingOwnProfile() && (
            <p className="text-sm text-gray-500 mb-4">
              You are viewing someone else’s profile. Some actions may be
              disabled unless you’re an admin.
            </p>
          )}

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

            {userData?.contactUrl?.length > 0 && (
              <MyQRCode value={userData?.contactUrl} />
            )}

            <button
              type="submit"
              disabled={!isModified || isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </form>

          {isViewingOwnProfile() && (
            <Link
              to="/account/vCard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-3 inline-block"
            >
              Generate Business Card
            </Link>
          )}

          <div className="p-4">
            <div className="mt-6">
              <ProfilePhotoUpload
                userId={targetUid()}
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

          {isViewingOwnProfile() && (
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
          )}
        </>
      )}
    </div>
  );
};

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
