import {
    BrowserMultiFormatReader,
    NotFoundException,
    RGBLuminanceSource,
    HybridBinarizer,
    BinaryBitmap,
  } from "@zxing/library";
  
  // We'll reuse one reader instance
  const codeReader = new BrowserMultiFormatReader();
  
  self.onmessage = (e) => {
    const { imageData, width, height } = e.data;
    if (!imageData || !width || !height) {
      self.postMessage({});
      return;
    }
  
    try {
      // Recreate the pixel data
      const pixels = new Uint8ClampedArray(imageData);
  
      // ZXing needs a luminance source + binarizer + binary bitmap
      // 1) Convert raw pixels to a luminance source
      const luminanceSource = new RGBLuminanceSource(pixels, width, height);
  
      // 2) Create a binarizer (with an optional threshold)
      const binarizer = new HybridBinarizer(luminanceSource);
  
      // 3) Wrap in a binary bitmap
      const binaryBitmap = new BinaryBitmap(binarizer);
  
      // 4) Decode from that bitmap
      const result = codeReader.decode(binaryBitmap);
  
      // If successful, we’ll have result.text and result.resultPoints
      const { text, resultPoints } = result;
      if (text) {
        // Convert resultPoints to a simpler array of { x, y } for the overlay
        const points = Array.isArray(resultPoints)
          ? resultPoints.map((p) => ({ x: p.getX(), y: p.getY() }))
          : null;
  
        self.postMessage({ vin: text, points });
      } else {
        self.postMessage({});
      }
    } catch (err) {
      if (err instanceof NotFoundException) {
        // No barcode found in this frame
        self.postMessage({});
      } else {
        console.error("[Worker] ZXing Error:", err);
        self.postMessage({});
      }
    }
  };
  