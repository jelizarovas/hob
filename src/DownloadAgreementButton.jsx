import React from "react";
import { getAuth } from "firebase/auth";

const DownloadAgreementButton = ({
  dealership,
  manager,
  dealData,
  vehicle,
  ...otherProps
}) => {
  const handleDownload = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to download the agreement.");
        return;
      }
      // Get a Firebase ID token for authentication
      const token = await user.getIdToken();

      // Build the data payload for the PDF.
      // This payload should contain all the props your AgreementSheet component requires.
      const payload = {
        dealership,
        manager,
        dealData,
        vehicle,
        ...otherProps,
      };

      // Replace with your deployed Cloud Function URL
      const functionUrl =
        "https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/generateAgreementSheetPdf";

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to generate PDF");
      }

      // Convert the response to a blob and trigger the download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = "AgreementSheet.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading agreement PDF:", error);
      alert("Error downloading agreement PDF: " + error.message);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="print:none px-4 py-2 bg-blue-600 text-white rounded"
    >
      Download Agreement
    </button>
  );
};

export default DownloadAgreementButton;
