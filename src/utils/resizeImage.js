// src/utils/resizeImage.js
export async function resizeImage(imageSource, width, height) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    // If imageSource is a File object, read it as a data URL
    if (typeof imageSource !== "string") {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(imageSource);
    } else {
      // If it's already a base64 string
      img.src = imageSource;
    }

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = width;
      canvas.height = height;

      // Draw (here you could implement cropping logic if desired)
      ctx.drawImage(img, 0, 0, width, height);

      // Convert canvas to Blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        0.9
      );
    };
    img.onerror = (err) => reject(err);
  });
}
