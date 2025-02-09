// barcodeWorker.js
import { BrowserMultiFormatReader } from "@zxing/library";

// We create one instance of the reader
const codeReader = new BrowserMultiFormatReader();

// Listen for messages from our main thread
self.onmessage = async (e) => {
  const { imageData, width, height } = e.data;
  if (!imageData || !width || !height) {
    self.postMessage({});
    return;
  }

  try {
    // ZXing expects image data in a specific format:
    // decodeFromImageData(imageData) in newer versions, or from a typed object
    const result = await codeReader.decodeFromImageData({
      data: new Uint8ClampedArray(imageData),
      width,
      height,
    });
    // If successful, send back the result
    self.postMessage({ value: result.text });
  } catch (err) {
    // If nothing found, send empty
    self.postMessage({});
  }
};
