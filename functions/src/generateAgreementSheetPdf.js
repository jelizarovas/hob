import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import admin from "firebase-admin";
import puppeteer from "puppeteer-core";
import chrome from "chrome-aws-lambda";
import React from "react";
import ReactDOMServer from "react-dom/server";

// Import your AgreementSheet component via symlink
import { AgreementSheet } from "./components/templates/AgreementSheet.js";

//firebase deploy --only functions:generateAgreementSheetPdf
export const generateAgreementSheetPdf = onRequest(async (req, res) => {
  try {
    let proposalData;

    if (req.method === "POST") {
      // Ensure your client sends a JSON body.
      proposalData = req.body;
      if (!proposalData) {
        res.status(400).send("Missing proposal data in POST body");
        return;
      }
    } else {
      // GET request fallback: Use query parameter to fetch data from Firestore.
      const { proposalId } = req.query;
      if (!proposalId) {
        res.status(400).send("Missing proposalId parameter");
        return;
      }
      const proposalDoc = await admin
        .firestore()
        .collection("proposals")
        .doc(proposalId)
        .get();
      if (!proposalDoc.exists) {
        res.status(404).send("Proposal not found");
        return;
      }
      proposalData = proposalDoc.data();
    }

    // Render AgreementSheet component to HTML using ReactDOMServer.
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(AgreementSheet, { ...proposalData })
    );

    // Build a full HTML document and include Tailwind CSS for styling.
    const fullHtml = `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Proposal PDF</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
        </head>
        <body>
          ${html}
        </body>
      </html>`;

    // Launch Puppeteer using chrome-aws-lambda.
    const browser = await puppeteer.launch({
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless,
    });
    const page = await browser.newPage();

    // Emulate print media to apply print-specific CSS
    await page.emulateMediaType("print");

    await page.setContent(fullHtml, { waitUntil: "domcontentloaded" });

    // Generate the PDF with letter size. You can adjust other options as needed.
    const pdfBuffer = await page.pdf({ format: "Letter" });
    await browser.close();

    res.set("Content-Type", "application/pdf");
    res.status(200).send(pdfBuffer);
  } catch (error) {
    logger.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF: " + error.message);
  }
});
