import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

function ScanTest() {
  const [result, setResult] = useState("");
  const videoRef = useRef(null);
  const readerRef = useRef(null);

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();
    return () => {
      readerRef.current?.reset();
    };
  }, []);

  const startScan = async () => {
    try {
      await readerRef.current.decodeFromStream(
        // use environment camera
        { video: { facingMode: "environment" } },
        videoRef.current,
        (res, err) => {
          if (res) {
            console.log("Detected code:", res.text);
            setResult(res.text);
          }
          if (err) {
            console.error("Scan error:", err);
          }
        }
      );
    } catch (err) {
      console.error("Error starting scan:", err);
    }
  };

  const stopScan = () => {
    readerRef.current?.reset();
  };

  return (
    <div>
      <video ref={videoRef} style={{ width: "100%" }} playsInline muted />
      <p>Result: {result}</p>
      <button onClick={startScan}>Start</button>
      <button onClick={stopScan}>Stop</button>
    </div>
  );
}

export default ScanTest;
