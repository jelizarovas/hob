import { useState } from "react";

export default function DownloadAgreementButton({ proposalData }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const functionUrl =
        "https://generateagreementsheetpdf-muc7erlkaa-uc.a.run.app";
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proposalData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to generate PDF");
      }

      // Get the base64 string from the response text.
      let base64String = await response.text();

      // If the returned string has a prefix (like "data:image/png;base64,") remove it:
      base64String = base64String
        .replace(/^data:image\/\w+;base64,/, "")
        .trim();

      // Decode the base64 string to a binary string.
      const binaryString = atob(base64String);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "image/png" });

      // Create a URL for the blob and trigger the download.
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Agreement.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading PDF:", err);
      alert("Error downloading PDF: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="print:hidden px-4 py-2 bg-blue-500 text-white"
    >
      {loading ? "Loading..." : "Download PDF"}
    </button>
  );
}
