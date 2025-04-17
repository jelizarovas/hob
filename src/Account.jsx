import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
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
import { getAuth } from "firebase/auth";

// 1) Import Skeleton
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import SignatureEPad from "./SignatureEPad";
import { FaLayerGroup, FaStore } from "react-icons/fa";

const updateUserPhotoURL =
  "https://us-central1-honda-burien.cloudfunctions.net/updateUserPhoto";

const Account = () => {
  const { currentUser, isPrivileged, isAdmin, profile } = useAuth();
  const { uid } = useParams();

  // Keep two copies: one for the original from DB, one for current user edits.
  const [originalData, setOriginalData] = useState({});
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    cell: "",
    storeNumber: "",
    address: "",
    website: "",
    apptScheduleUrl: "",
    contactUrl: "",
    profilePhotoURL: "",
  });

  // Loading state for user doc fetch
  const [isLoadingUser, setIsLoadingUser] = useState(true);

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
        // Update the Auth profile for self.
        await updateProfile(auth.currentUser, { photoURL: mainURL });
      } else if (!isViewingOwnProfile() && isPrivileged) {
        // If editing someone else's profile and you have privileges, update Auth via Cloud Function.
        await fetchWithAuth(updateUserPhotoURL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: targetUid(), photoURL: mainURL }),
        });
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
  const [showRawData, setShowRawData] = useState(false);
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

  // Fetch user doc on mount or when uid/currentUser changes
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
          const defaults = { firstName: "", lastName: "", email: "" };
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
        "Could not update password. Please ensure your current password is correct."
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!targetUid()) {
    return <p>No user found or not logged in.</p>;
  }

  const assignedTeams = Object.values(userData.assignments || {});

  return (
    <div className="container mx-auto p-2">
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
          <form
            onSubmit={handleSave}
            className="flex flex-col space-y-4 max-w-md"
          >
            {/* { isAdmin && showRawData ? (
              <pre className="text-xs">{JSON.stringify(userData, null, 2)}</pre>
            ) : (
              <button onClick={() => setShowRawData(true)}>RawData</button>
            )} */}
            <Section title="Teams" icon={<FaLayerGroup />}>
              {assignedTeams?.length > 0 ? (
                assignedTeams?.map((a) => (
                  <div
                    key={a?.teamId}
                    className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow"
                    title={`Added by ${a?.addedBy.displayName} on
                      ${a?.addedAt.toDate().toLocaleDateString()}`}
                  >
                    <h4 className="font-semibold dark:text-slate-100">
                      {a?.teamName}
                    </h4>
                    <p className="text-sm text-slate-500"></p>
                    <div className="text-xs text-gray-500">
                      <ul className=" list-inside">
                        {a?.stores?.map((s) => (
                          <li key={s?.id} className=" ">
                            {s?.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              ) : (
                <Empty>None assigned</Empty>
              )}
            </Section>
            <AccountInput
              label="Email"
              name="email"
              value={userData.email}
              originalValue={originalData.email}
              onChange={handleChange}
              disabled
            />
            
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
              label="Address (For Check Requests)"
              name="address"
              value={userData.address}
              originalValue={originalData.address}
              onChange={handleChange}
            />
            <AccountInput
              label="DriveCentric Email"
              name="driveCentricEmail"
              value={userData.driveCentricEmail}
              originalValue={originalData.driveCentricEmail}
              onChange={handleChange}
            />
            <AccountInput
              label="extenstion"
              name="extenstion"
              value={userData.extenstion}
              originalValue={originalData.extenstion}
              onChange={handleChange}
            />
            <AccountInput
              label="dptsid"
              name="dptsid"
              value={userData.dptsid}
              originalValue={originalData.dptsid}
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
              label="Contact Card URL"
              name="contactUrl"
              value={userData.contactUrl}
              originalValue={originalData.contactUrl}
              onChange={handleChange}
            />
            <SignatureEPad
              signature={userData.signature}
              handleChange={handleChange}
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

          {isPrivileged && (
            <Link
              to={`/account/${targetUid()}/vCard`}
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
  disabled,
  ...props
}) => {
  const hasChanged = value !== originalValue;
  const highlightClass = hasChanged
    ? "border-green-400"
    : "border-white border-opacity-10";
  const labelClass = hasChanged
    ? "text-green-400 text-xs uppercase mb-1"
    : "text-xs uppercase opacity-50 mb-1";
  const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <label className="flex flex-col">
      <span className={labelClass}>{label}</span>
      <input
        className={`bg-transparent px-2 py-1 border rounded ${highlightClass} ${disabledClass}`}
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        autoComplete="off"
        disabled={disabled}
        {...props}
      />
    </label>
  );
};

export default Account;

/* ---------- tiny presentational helpers ------------------- */
const Section = ({ title, icon, children }) => (
  <section>
    <h2 className="flex items-center gap-2 text-lg font-semibold mb-2">
      {icon} {title}
    </h2>
    <div className="flex flex-wrap gap-2">{children}</div>
  </section>
);

const Chip = ({ label, subLabel }) => (
  <div className="flex flex-col bg-slate-200 dark:bg-slate-700 rounded-full px-3 py-1">
    <span className="text-sm dark:text-slate-100">{label}</span>
    {subLabel && (
      <span className="text-xs opacity-70 dark:text-slate-400">{subLabel}</span>
    )}
  </div>
);

const Empty = ({ children }) => (
  <span className="text-slate-400 text-sm">{children}</span>
);
