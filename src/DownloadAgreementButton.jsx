export default function DownloadAgreementButton({ proposalData }) {
  async function handleDownload() {
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

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Agreement.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading PDF:", err);
      alert("Error downloading PDF: " + err.message);
    }
  }

  return (
    <button
      onClick={handleDownload}
      className="print:hidden px-4 py-2 bg-blue-500 text-white"
    >
      Download PDF
    </button>
  );
}
