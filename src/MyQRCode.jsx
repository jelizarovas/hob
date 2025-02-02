import React, { useRef } from "react";
import { MdDownload } from "react-icons/md";
import QRCode from "react-qr-code";

export function MyQRCode({ value }) {
  const qrRef = useRef(null);

  const handleDownload = (e) => {
    e.preventDefault();

    // 1) Grab the SVG element rendered by `react-qr-code`
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) {
      alert("QR code not found!");
      return;
    }

    // 2) Serialize SVG
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    // 3) Convert SVG string to a Blob
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    // 4) Create an off-screen image to draw it on a <canvas>
    const image = new Image();
    image.onload = () => {
      // 5) Create a canvas the same size as the loaded image
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);

      // 6) Convert the canvas to a PNG data URL
      const pngDataUrl = canvas.toDataURL("image/png");

      // 7) Create a temporary link & trigger download in the browser
      const downloadLink = document.createElement("a");
      downloadLink.href = pngDataUrl;
      const filename = getFilenameWithoutExtension(value);

      downloadLink.download = `${filename} qrcode.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Cleanup
      URL.revokeObjectURL(url);
    };

    // 8) Start loading the image
    image.src = url;
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <div ref={qrRef}>
        {/* This renders an <svg> inside the div */}
        <QRCode value={value} className="h-48 w-48" />
      </div>

      <button
        onClick={handleDownload}
        className="flex items-center gap-2 border border-white px-4 py-2 rounded border-opacity-15"
        style={{ marginTop: "1rem" }}
      >
        <MdDownload /> <span>Download as PNG</span>
      </button>
    </div>
  );
}

function getFilenameWithoutExtension(urlString) {
  try {
    // 1. Extract the path component after the last slash.
    const fileNameWithExt = urlString.substring(urlString.lastIndexOf("/") + 1);
    // e.g., "Arnas.vcf"

    // 2. Remove the extension (the period and everything after it).
    const fileName = fileNameWithExt.replace(/\.[^/.]+$/, "");
    // e.g., "Arnas"

    return fileName;
  } catch (err) {
    console.error("Error parsing filename:", err);
    return ""; // or some fallback
  }
}
