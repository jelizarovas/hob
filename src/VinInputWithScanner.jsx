import React, { useEffect, useRef, useState } from "react";
import { MdClear } from "react-icons/md";
import {
  BrowserMultiFormatReader,
  RGBLuminanceSource,
  HybridBinarizer,
  BinaryBitmap,
} from "@zxing/library";

// No NotFoundException or worker usage here
export default function VinInputWithScanner({
  label = "VIN",
  name = "vin",
  value,
  onChange,
  placeholder = "Enter VIN...",
}) {
  const [scanning, setScanning] = useState(false);
  const [detectedVin, setDetectedVin] = useState(null);
  const [resultPoints, setResultPoints] = useState(null);

  const videoRef = useRef(null);           // Real <video> element
  const canvasRef = useRef(null);          // Single canvas for both scanning + bounding box
  const intervalIdRef = useRef(null);      // For scanning loop
  const readerRef = useRef(new BrowserMultiFormatReader());

  // Start scanning: request camera, set up interval
  const startScanning = async () => {
    if (scanning) return;
    setScanning(true);
    setDetectedVin(null);
    setResultPoints(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", true);
        await videoRef.current.play();
      }

      // Scan about 5 times per second
      intervalIdRef.current = setInterval(scanFrame, 200);
    } catch (err) {
      console.error("[VinInputWithScanner] Camera error:", err);
      setScanning(false);
    }
  };

  // Stop scanning: clear interval, stop camera
  const stopScanning = () => {
    setScanning(false);
    setDetectedVin(null);
    setResultPoints(null);

    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    clearCanvas();
  };

  // Grab frame from video, decode with ZXing, draw bounding box (if any)
  const scanFrame = () => {
    const videoEl = videoRef.current;
    const canvasEl = canvasRef.current;
    if (!videoEl || !canvasEl) return;
    if (videoEl.readyState !== videoEl.HAVE_ENOUGH_DATA) return;

    // Match canvas to video size
    canvasEl.width = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;

    const ctx = canvasEl.getContext("2d", { willReadFrequently: true });
    // 1) Draw the current video frame
    ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

    // 2) Extract pixel data for ZXing
    const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
    try {
      // Build the binary bitmap
      const luminanceSource = new RGBLuminanceSource(
        imageData.data,
        canvasEl.width,
        canvasEl.height
      );
      const binarizer = new HybridBinarizer(luminanceSource);
      const binaryBitmap = new BinaryBitmap(binarizer);

      // 3) Decode
      const result = readerRef.current.decode(binaryBitmap);
      if (result?.text) {
        setDetectedVin(result.text);

        // Convert resultPoints to simpler array
        if (Array.isArray(result.resultPoints) && result.resultPoints.length) {
          const points = result.resultPoints.map((p) => ({
            x: p.getX(),
            y: p.getY(),
          }));
          setResultPoints(points);
        } else {
          setResultPoints(null);
        }
      } else {
        setDetectedVin(null);
        setResultPoints(null);
      }
    } catch (err) {
      // If no code found in this frame or other error
      setDetectedVin(null);
      setResultPoints(null);
    }

    // 4) Re-draw the bounding box (if any)
    if (resultPoints?.length) {
      drawBox(ctx, resultPoints);
    }
  };

  // Overlays a bounding box in red
  const drawBox = (ctx, points) => {
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "red";

    if (points.length === 2) {
      // 1D barcode => 2 points
      const [p1, p2] = points;
      const pad = 10;
      const minX = Math.min(p1.x, p2.x) - pad;
      const maxX = Math.max(p1.x, p2.x) + pad;
      const minY = Math.min(p1.y, p2.y) - pad;
      const maxY = Math.max(p1.y, p2.y) + pad;
      ctx.rect(minX, minY, maxX - minX, maxY - minY);
    } else {
      // Probably 3 or 4 points for 2D code
      const [first, ...rest] = points;
      ctx.moveTo(first.x, first.y);
      rest.forEach((pt) => ctx.lineTo(pt.x, pt.y));
      ctx.closePath();
    }
    ctx.stroke();
  };

  // Clear the canvas
  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  // User accepts the scanned VIN => fill input
  const handleAcceptVin = () => {
    if (detectedVin && onChange) {
      onChange({ target: { name, value: detectedVin } });
    }
    stopScanning();
  };

  // Cleanup on unmount
  useEffect(() => stopScanning, []);

  return (
    <div style={{ position: "relative" }}>
      <label htmlFor={name} className="flex flex-col my-1">
        <span className="text-xs text-white">{label}</span>
        <input
          type="text"
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          className="text-sm px-2 py-1 rounded outline-none bg-white bg-opacity-10 text-white hover:bg-opacity-15 focus:bg-opacity-15"
        />
      </label>

      {/* {!scanning && (
        <button
          onClick={startScanning}
          style={{
            background: "#444",
            color: "#fff",
            padding: "6px 10px",
            borderRadius: "4px",
            marginTop: "8px",
          }}
        >
          Scan QR/Barcode
        </button>
      )} */}

      {scanning && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.8)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* X button top-right */}
          <button
            onClick={stopScanning}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "2rem",
              cursor: "pointer",
              zIndex: 10,
            }}
          >
            <MdClear />
          </button>

          {/* Camera feed at top */}
          <div style={{ position: "relative" }}>
            <video
              ref={videoRef}
              style={{
                width: "100vw",
                maxHeight: "50vh",
                objectFit: "contain",
              }}
            />
            {/* Single canvas for scanning + bounding box */}
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Accept button if we have a VIN */}
          <div style={{ padding: "1rem", color: "#fff" }}>
            {detectedVin ? (
              <>
                <p>
                  Detected: <strong>{detectedVin}</strong>
                </p>
                <button
                  onClick={handleAcceptVin}
                  style={{
                    background: "#444",
                    color: "#fff",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    marginTop: "8px",
                  }}
                >
                  Accept &quot;{detectedVin}&quot;
                </button>
              </>
            ) : (
              <p>Point camera at a barcode / QR code…</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
