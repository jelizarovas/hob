import React, { useState, useCallback, useRef } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase"; // adjust path
import { resizeImage } from "./utils/resizeImage"; // from earlier example

const ProfilePhotoUpload = ({ userId, onUploadComplete }) => {
  const [photoPreview, setPhotoPreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // DRAG & DROP
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleDrop = async (e) => {
    e.preventDefault();
    if (!e.dataTransfer.files.length) return;
    handleFile(e.dataTransfer.files[0]);
  };

  // CLICK TO SELECT
  const handleClickSelect = () => {
    fileInputRef.current?.click();
  };
  const handleFileSelect = (e) => {
    if (!e.target.files.length) return;
    handleFile(e.target.files[0]);
  };

  // PASTE FROM CLIPBOARD
  const handlePaste = (e) => {
    if (!e.clipboardData) return;
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") === 0) {
        // Found an image in clipboard
        const file = item.getAsFile();
        handleFile(file);
        break;
      }
    }
  };

  // CORE LOGIC: handle a single File object
  const handleFile = (file) => {
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    uploadToStorage(file);
  };

  // UPLOAD + RESIZE
  const uploadToStorage = async (file) => {
    if (!userId || !file) return;
    setIsUploading(true);
    try {
      // Resize for main (512x512) & thumb (128x128)
      const mainBlob = await resizeImage(file, 512, 512);
      const thumbBlob = await resizeImage(file, 128, 128);
      console.log({ userId });
      const mainRef = ref(storage, `profileImages/${userId}/main.jpg`);
      const thumbRef = ref(storage, `profileImages/${userId}/thumb.jpg`);

      await uploadBytes(mainRef, mainBlob);
      await uploadBytes(thumbRef, thumbBlob);

      const mainURL = await getDownloadURL(mainRef);
      const thumbURL = await getDownloadURL(thumbRef);

      // Report back to the parent
      onUploadComplete({ mainURL, thumbURL });
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="border-2 my-10 border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center space-y-4 cursor-pointer hover:border-blue-400"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClickSelect}
      onPaste={handlePaste}
    >
      <p className="text-gray-500 text-sm">
        Drag & Drop / Click / Paste to upload
      </p>

      {photoPreview ? (
        <img
          src={photoPreview}
          alt="preview"
          className="w-32 h-32 object-cover rounded-full border border-gray-300"
        />
      ) : (
        <div className="w-32 h-32 flex items-center justify-center text-gray-400 bg-gray-100 rounded-full">
          No Preview
        </div>
      )}

      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Upload Again?"}
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
};

export default ProfilePhotoUpload;
