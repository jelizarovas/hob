import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import admin from "firebase-admin";
import puppeteer from "puppeteer-core";
import chrome from "chrome-aws-lambda";
import React from "react";
import ReactDOMServer from "react-dom/server";
import cors from "cors";

// If your AgreementSheet expects separate props like dealership, manager, etc.
// you'll want to pass them via { ...proposalData } instead of { proposalData }.
import { AgreementSheet } from "../../src/components/templates/AgreementSheet.jsx";

// 1) Create a CORS handler
const corsHandler = cors({ origin: true });

export const generateAgreementSheetPdf = onRequest(async (req, res) => {
  // 2) Always set some basic CORS headers for preflight + actual request
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // 3) If OPTIONS, respond with 204 (no content)
  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  // 4) If you have authentication, skip it for now; or else allow unauth
  // e.g. allow unauth from Cloud Run so local testing is easier

  // 5) Wrap your main logic in the CORS handler
  corsHandler(req, res, async () => {
    let browser;
    try {
      let proposalData = {};

      // Collect data from either POST body or query param
      if (req.method === "POST") {
        proposalData = req.body || {};
      } else {
        const { proposalId } = req.query;
        if (!proposalId) {
          return res
            .status(400)
            .json({ error: "Missing proposalId parameter" });
        }
        const proposalDoc = await admin
          .firestore()
          .collection("proposals")
          .doc(proposalId)
          .get();
        if (!proposalDoc.exists) {
          return res.status(404).json({ error: "Proposal not found" });
        }
        proposalData = proposalDoc.data() || {};
      }
      logger.info("Data being passed to AgreementSheet:", proposalData);

      // Basic validation check (customize as needed)
      // e.g. if your AgreementSheet expects "customerFullName"

      // 6) Render AgreementSheet using ...proposalData if it expects separate props
      // let html;
      // try {
      //   html = ReactDOMServer.renderToStaticMarkup(
      //     React.createElement(AgreementSheet, { ...proposalData })
      //   );
      // } catch (renderError) {
      //   logger.error("Error rendering component:", renderError);
      //   return res.status(500).json({ error: "Error rendering PDF content" });
      // }

      // Build a minimal HTML doc
      // ${html}
      const fullHtml = `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Agreement PDF</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
          </head>
          <body>
          TEST IF THIS WORKS!
          </body>
        </html>`;

      // 7) Launch Puppeteer with chrome-aws-lambda
      try {
        browser = await puppeteer.launch({
          args: chrome.args,
          executablePath: await chrome.executablePath,
          headless: chrome.headless,
        });
      } catch (launchError) {
        logger.error("Error launching Puppeteer:", launchError);
        return res.status(500).json({ error: "Error launching browser" });
      }

      const page = await browser.newPage();
      await page.emulateMediaType("print");

      try {
        await page.setContent(fullHtml, { waitUntil: "domcontentloaded" });
      } catch (contentError) {
        logger.error("Error setting page content:", contentError);
        return res.status(500).json({ error: "Error setting page content" });
      }

      let pdfBuffer;
      try {
        pdfBuffer = await page.pdf({ format: "Letter" });
      } catch (pdfError) {
        logger.error("Error generating PDF:", pdfError);
        return res.status(500).json({ error: "Error generating PDF" });
      }

      // Return PDF
      res.set("Content-Type", "application/pdf");
      res.status(200).send(pdfBuffer);
    } catch (error) {
      logger.error("Unexpected error in generateAgreementSheetPdf:", error);
      res
        .status(500)
        .json({ error: "Unexpected error", details: error.message });
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          logger.error("Error closing browser:", closeError);
        }
      }
    }
  });
});
