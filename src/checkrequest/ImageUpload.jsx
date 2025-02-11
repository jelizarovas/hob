import React from "react";
import { FaImage, FaUpload, FaCamera } from "react-icons/fa";
import { MdContentPaste } from "react-icons/md";

const ImageUpload = ({
  setImages,
  dropActive,
  setDropActive,
  handlePasteImage,
}) => {
  const handleFiles = (files) => {
    const fileArray = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (fileArray.length > 0) setImages((prev) => [...prev, ...fileArray]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e) => {
    handleFiles(e.target.files);
  };

  return (
    <div
      className={`border border-white border-dashed mt-4 flex flex-col items-center rounded border-opacity-20 p-4 my-2 text-center cursor-default transition-all ${
        dropActive ? "bg-orange-200 bg-opacity-30" : "bg-gray-100 bg-opacity-10"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => {
        setDropActive(true);
        setTimeout(() => setDropActive(false), 3000);
      }}
      onPaste={handlePasteImage}
    >
      <div className="flex items-center space-x-2">
        <FaImage className="text-xl text-white hidden xs:block" />
        <span className="text-white hidden sm:block">
          Drag & drop or click to paste an image
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-300 hidden sm:block">
        (Tip: Use Windows+Shift+S to capture a snippet, then click to paste.)
      </p>
      <div className="flex mt-4 space-x-4">
        <button
          type="button"
          className="flex flex-col md:flex-row justify-center items-center bg-blue-800 hover:bg-blue-600 transition-all text-white px-4 py-2 rounded"
          onClick={() => document.getElementById("fileInput").click()}
        >
          <FaUpload className="text-xl mb-2" />
          <span className="text-xs whitespace-nowrap"> Upload Images</span>
        </button>
        <button
          type="button"
          className=" flex-col md:flex-row justify-center items-center bg-purple-800 hover:bg-purple-600 transition-all text-white px-4 py-2 rounded hidden sm:flex"
          onClick={handlePasteImage}
        >
          <MdContentPaste className="text-xl mb-2" />
          <span className="text-xs whitespace-nowrap"> Paste Image</span>
        </button>
        <button
          type="button"
          className="flex flex-col md:flex-row justify-center items-center bg-green-800 hover:bg-green-600 transition-all text-white px-4 py-2 rounded md:hidden"
          onClick={() => document.getElementById("captureInput").click()}
        >
          <FaCamera className="text-xl mb-2" />
          <span className="text-xs whitespace-nowrap"> Take Photo</span>
        </button>
      </div>
      <input
        type="file"
        id="fileInput"
        multiple
        accept="image/jpeg, image/png"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
      <input
        type="file"
        id="captureInput"
        accept="image/jpeg, image/png"
        capture="environment"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default ImageUpload;
