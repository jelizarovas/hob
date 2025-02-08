import React from "react";
import { PDFDocument, rgb } from "pdf-lib";
import download from "downloadjs";
import { useAuth } from "./auth/AuthProvider";
import { CheckInput } from "./CheckInput";

const reducer = (state, { type, payload }) => {
  switch (type) {
    case "UPDATE_INPUT":
      return { ...state, [payload.field]: payload.value };
    case "UPDATE_ALL":
      return { ...state, ...payload };
    default:
      return state;
  }
};

export const CheckRequest = () => {
  const { currentUser, profile } = useAuth();
  const [state, dispatch] = React.useReducer(reducer, {
    amount: 25,
    name: "",
    address: "",
    explanation: "",
  });
  const [loadingPDF, setLoadingPDF] = React.useState(false);
  const [pdfUrl, setPdfUrl] = React.useState("");
  const [images, setImages] = React.useState([]);
  const [dropActive, setDropActive] = React.useState(false);

  const handleOnChange = (e) =>
    dispatch({
      type: "UPDATE_INPUT",
      payload: { field: e.target.name, value: e.target.value },
    });

  // Prefill name and address
  React.useEffect(() => {
    if (currentUser) {
      const prefillName =
        currentUser.displayName ||
        `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim();
      if (prefillName && !state.name)
        dispatch({ type: "UPDATE_INPUT", payload: { field: "name", value: prefillName } });
      if (profile?.address && !state.address)
        dispatch({ type: "UPDATE_INPUT", payload: { field: "address", value: profile.address } });
    }
  }, [currentUser, profile, state.name, state.address]);

  // Handle image files
  const handleFiles = (files) => {
    const fileArray = Array.from(files).filter((file) => file.type.startsWith("image/"));
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

  const handlePasteImage = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        setImages((prev) => [...prev, file]);
      }
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const modifyPdf = async (data, toDownload) => {
    const baseUrl = window.location.origin + import.meta.env.BASE_URL;
    const pdfPath = "pdf/CHECK REQUEST.pdf";
    const url = baseUrl + pdfPath;
    const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const helveticaFont = await pdfDoc.embedFont("Helvetica");
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Add text fields on the first page
    firstPage.drawText(`${data.amount}`, {
      x: 170,
      y: 652,
      size: 16,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(data.name, {
      x: 170,
      y: 620,
      size: 16,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    const parseAddress = (address) => {
      const index = address.indexOf(",");
      if (index === -1) return [address, ""];
      return [address.substring(0, index).trim(), address.substring(index + 1).trim()];
    };
    const [add1, add2] = parseAddress(data.address);
    firstPage.drawText(add1, {
      x: 255,
      y: 582,
      size: 16,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(add2, {
      x: 220,
      y: 545,
      size: 16,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(data.explanation, {
      x: 95,
      y: 345,
      size: 16,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    // Add images two per page: first in the top half, second in the bottom half.
    if (images.length > 0) {
      const { width: pageWidth, height: pageHeight } = firstPage.getSize();
      const margin = 20;
      const availableWidth = pageWidth - 2 * margin;
      const availableHeight = (pageHeight / 2) - 2 * margin;
      for (let i = 0; i < images.length; i += 2) {
        const newPage = pdfDoc.addPage([pageWidth, pageHeight]);
        // First image (top half)
        const imageFile1 = images[i];
        const imageBytes1 = await imageFile1.arrayBuffer();
        const embeddedImage1 = imageFile1.type.includes("png")
          ? await pdfDoc.embedPng(imageBytes1)
          : await pdfDoc.embedJpg(imageBytes1);
        const origWidth1 = embeddedImage1.width;
        const origHeight1 = embeddedImage1.height;
        const scaleFactor1 = Math.min(availableWidth / origWidth1, availableHeight / origHeight1);
        const imgWidth1 = origWidth1 * scaleFactor1;
        const imgHeight1 = origHeight1 * scaleFactor1;
        const x1 = margin + (availableWidth - imgWidth1) / 2;
        const y1 = pageHeight - margin - imgHeight1;
        newPage.drawImage(embeddedImage1, { x: x1, y: y1, width: imgWidth1, height: imgHeight1 });

        // Second image (bottom half) if available
        if (i + 1 < images.length) {
          const imageFile2 = images[i + 1];
          const imageBytes2 = await imageFile2.arrayBuffer();
          const embeddedImage2 = imageFile2.type.includes("png")
            ? await pdfDoc.embedPng(imageBytes2)
            : await pdfDoc.embedJpg(imageBytes2);
          const origWidth2 = embeddedImage2.width;
          const origHeight2 = embeddedImage2.height;
          const scaleFactor2 = Math.min(availableWidth / origWidth2, availableHeight / origHeight2);
          const imgWidth2 = origWidth2 * scaleFactor2;
          const imgHeight2 = origHeight2 * scaleFactor2;
          const x2 = margin + (availableWidth - imgWidth2) / 2;
          const y2 = (pageHeight / 2) - margin - imgHeight2;
          newPage.drawImage(embeddedImage2, { x: x2, y: y2, width: imgWidth2, height: imgHeight2 });
        }
      }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    setPdfUrl(URL.createObjectURL(blob));

    if (toDownload) {
      const now = new Date();
      return download(
        pdfBytes,
        `Check Request ${data.name} ${data.amount} ${getFormattedDate(now, " ")}.pdf`,
        "application/pdf"
      );
    }
  };

  return (
    <div className="flex flex-col mt-2 px-4">
      <h1 className="bg-slate-800 py-2 uppercase text-sm text-center rounded-t">
        Check Request
      </h1>
      <div className="flex flex-col bg-slate-700 px-2 rounded-b py-4">
        <CheckInput
          label="Amount"
          name="amount"
          value={state.amount}
          placeholder="25"
          type="number"
          onChange={handleOnChange}
        />
        <CheckInput
          label="Name"
          name="name"
          value={state.name}
          placeholder="John Doe"
          onChange={handleOnChange}
        />
        <CheckInput
          label="Address"
          name="address"
          value={state.address}
          placeholder="123 John St, Seattle"
          onChange={handleOnChange}
        />
        <CheckInput
          label="Explanation"
          name="explanation"
          value={state.explanation}
          placeholder="Google Review"
          onChange={handleOnChange}
        />

        {/* Dedicated Upload Button */}
        <button
          type="button"
          className="bg-blue-600 text-white px-4 py-2 rounded my-2"
          onClick={() => document.getElementById("fileInput").click()}
        >
          Upload Images
        </button>
        <input
          type="file"
          id="fileInput"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        {/* Drag & Drop / Paste Zone */}
        <div
          className={`border-2 p-4 my-2 text-center cursor-default ${
            dropActive ? "bg-orange-200" : "bg-gray-100"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            // On click, flash the orange background to signal paste capability.
            setDropActive(true);
            setTimeout(() => setDropActive(false), 300);
          }}
          onPaste={handlePasteImage}
        >
          Drag & drop images here or paste an image.
        </div>

        {/* Thumbnails Preview */}
        {images.length > 0 && (
          <div className="my-2">
            <h3 className="text-white">Uploaded Images:</h3>
            <div className="flex flex-wrap gap-2">
              {images.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-20 h-20 object-cover border"
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full px-1"
                    onClick={() => removeImage(index)}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <button
            type="button"
            className="bg-indigo-700 text-white px-4 py-2 rounded my-2"
            onClick={async () => {
              setLoadingPDF(true);
              await modifyPdf(state, true);
              setLoadingPDF(false);
            }}
          >
            {loadingPDF ? "Loading" : "Get Check Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

function getFormattedDate(date, separator = "/") {
  const year = date.getFullYear();
  const month = (1 + date.getMonth()).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return month + separator + day + separator + year;
}
