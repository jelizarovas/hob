import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "./auth/AuthProvider";
import { db } from "./firebase";
import { useParams } from "react-router-dom";

export function BusinessCardGenerator() {
  const { currentUser, isPrivileged } = useAuth();
  const { uid } = useParams(); // Note: 'uid' matches the route "/account/:uid/vCard"

  // Determine target user: if uid is provided and it's not the current user's id, and current user is privileged, then load that user's info.
  const targetUserId = uid && uid !== currentUser?.uid && isPrivileged ? uid : currentUser?.uid;

  const [userData, setUserData] = useState({});
  const [selectedFields, setSelectedFields] = useState({
    firstName: true,
    lastName: true,
    cell: true,
    storeNumber: true,
    address: true,
    website: true,
    email: true,
  });
  const [customFileName, setCustomFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState("");

  useEffect(() => {
    if (!currentUser || !targetUserId) return;
    (async () => {
      try {
        const docRef = doc(db, "users", targetUserId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setUserData(data);
          if (data.firstName) {
            setCustomFileName(data.firstName);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    })();
  }, [currentUser, targetUserId]);

  const buildVCardString = () => {
    const { firstName = "", lastName = "", cell = "", storeNumber = "", website = "" } = userData;
    const email = userData?.email || "";

    let addressString = "";
    if (selectedFields.address) {
      addressString = "15026 1st Ave S;Burien;WA;98148;USA";
    }

    let vcard = "BEGIN:VCARD\nVERSION:3.0\n";
    if (selectedFields.firstName || selectedFields.lastName) {
      const fn = selectedFields.firstName ? firstName : "";
      const ln = selectedFields.lastName ? lastName : "";
      vcard += `N:${ln};${fn};;;\nFN:${fn} ${ln}\n`;
    }
    if (selectedFields.storeNumber && storeNumber) {
      vcard += `TEL;WORK;VOICE:${storeNumber}\n`;
    }
    if (selectedFields.cell && cell) {
      vcard += `TEL;CELL;VOICE:${cell}\n`;
    }
    if (selectedFields.email && email) {
      vcard += `EMAIL;WORK;INTERNET:${email}\n`;
    }
    if (selectedFields.address && addressString) {
      vcard += `ADR;WORK:;;${addressString}\n`;
    }
    if (selectedFields.website && website) {
      vcard += `URL:${website}\n`;
    }
    vcard += "END:VCARD";

    return vcard;
  };

  const handleDownloadVCard = () => {
    if (!customFileName) {
      alert("Please provide a file name.");
      return;
    }
    const vcardContent = buildVCardString();
    const blob = new Blob([vcardContent], { type: "text/vcard" });
    const fileName = `${customFileName}.vcf`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert("vCard downloaded locally!");
  };

  const handleUploadVCard = async () => {
    if (!currentUser) return;
    if (!customFileName) {
      alert("Please enter a file name.");
      return;
    }
    setIsLoading(true);
    try {
      const vcardContent = buildVCardString();
      const fileName = `${customFileName}.vcf`;
      const storage = getStorage();
      const fileRef = ref(storage, `vcards/${fileName}`);
      const blob = new Blob([vcardContent], { type: "text/vcard" });
      await uploadBytes(fileRef, blob);

      const forwardedUrl = `https://hofb.app/contact/${fileName}`;

      const url = await getDownloadURL(fileRef);
      const userDocRef = doc(db, "users", targetUserId);
      await updateDoc(userDocRef, { contactUrl: forwardedUrl });
      setUploadUrl(forwardedUrl);
      alert("vCard uploaded successfully!");
    } catch (error) {
      url;
      console.error("Error uploading vCard:", error);
      alert("Failed to upload vCard.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setSelectedFields((prev) => ({ ...prev, [name]: checked }));
  };

  if (!currentUser) {
    return <p>Loading user...</p>;
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl mb-4">Generate Business Card (vCard)</h1>

      {targetUserId !== currentUser.uid && (
        <div className="mb-4 p-2 bg-yellow-800 rounded">
          <p className="font-semibold">Editing info for user:</p>
          <p>
            {userData.firstName} {userData.lastName}
          </p>
        </div>
      )}

      <div className="mb-4 bg-gray-800 p-2 rounded">
        <p className="mb-1 font-semibold">
          {targetUserId === currentUser.uid ? "Your Info (Read-only):" : "User Info (Read-only):"}
        </p>
        <p>First Name: {userData.firstName || ""}</p>
        <p>Last Name: {userData.lastName || ""}</p>
        <p>Cell: {userData.cell || ""}</p>
        <p>Store Number: {userData.storeNumber || ""}</p>
        <p>Website: {userData.website || ""}</p>
        <p>Email: {userData.email}</p>
        <p className="text-xs text-gray-400">Address is set to dealership by default if selected</p>
      </div>

      <div className="mb-4">
        <label className="block mb-2">File Name (without .vcf):</label>
        <input
          type="text"
          value={customFileName}
          onChange={(e) => setCustomFileName(e.target.value)}
          className="bg-transparent border rounded px-2 py-1 w-full"
          placeholder="e.g., BusinessCard"
        />
      </div>

      <div className="mb-4">
        <p className="font-semibold">Select Fields to Include:</p>
        <Checkbox
          label="First Name"
          name="firstName"
          checked={selectedFields.firstName}
          onChange={handleCheckboxChange}
        />
        <Checkbox label="Last Name" name="lastName" checked={selectedFields.lastName} onChange={handleCheckboxChange} />
        <Checkbox label="Cell" name="cell" checked={selectedFields.cell} onChange={handleCheckboxChange} />
        <Checkbox
          label="Store Number"
          name="storeNumber"
          checked={selectedFields.storeNumber}
          onChange={handleCheckboxChange}
        />
        <Checkbox label="Website" name="website" checked={selectedFields.website} onChange={handleCheckboxChange} />
        <Checkbox label="Email" name="email" checked={selectedFields.email} onChange={handleCheckboxChange} />
        <Checkbox
          label="Dealership Address"
          name="address"
          checked={selectedFields.address}
          onChange={handleCheckboxChange}
        />
      </div>

      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
        <button onClick={handleDownloadVCard} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Download vCard Locally
        </button>
        <button
          onClick={handleUploadVCard}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isLoading ? "Uploading..." : "Upload to Storage"}
        </button>
      </div>

      {uploadUrl && (
        <div className="mt-4">
          <p>vCard is uploaded. Direct link:</p>
          <a href={uploadUrl} target="_blank" rel="noreferrer" className="text-blue-400 underline">
            Download from Storage
          </a>
        </div>
      )}
    </div>
  );
}

function Checkbox({ label, name, checked, onChange }) {
  return (
    <label className="flex items-center space-x-2 mt-1">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} className="h-4 w-4" />
      <span>{label}</span>
    </label>
  );
}
