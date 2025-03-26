import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import admin from "firebase-admin";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

 

import { createElement } from "react";
// import ReactDOMServer from "react-dom/server";
import { renderToStaticMarkup } from "react-dom/server";
import cors from "cors";

// If your AgreementSheet expects separate props like dealership, manager, etc.
// you'll want to pass them via { ...proposalData } instead of { proposalData }.
import { AgreementSheetText } from "../../src/components/templates/AgreementSheetText.jsx";

// 1) Create a CORS handler
const corsHandler = cors({ origin: true });

export const generateAgreementSheetPdf = onRequest(
  {
    memory: "1GiB", // or "1Gi", "256MiB", etc.
    timeoutSeconds: 120, // extend if needed for Puppeteer
    // concurrency: 80,     // optionally limit concurrency
    // maxInstances: 2,     // optionally limit scale
  },
  async (req, res) => {
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
        let html;
        try {
          html = renderToStaticMarkup(createElement(AgreementSheetText));
        } catch (renderError) {
          logger.error("Error rendering component:", renderError);
          return res.status(500).json({ error: "Error rendering PDF content" });
        }

        // Build a minimal HTML doc
        // ${html}
        const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Screenshot Test</title>
        </head>
        <body style="margin:0;padding:0;">
          <h1>Hello from Puppeteer</h1>
          ${html}
          <h1>Bye from Puppeteer</h1>
        </body>
        </html>
        `;

        // 7) Launch Puppeteer with chrome-aws-lambda
        try {
          const executablePath = await chromium.executablePath();
          browser = await puppeteer.launch({
            executablePath,
            args: chromium.args,
            headless: chromium.headless,
            defaultViewport: chromium.defaultViewport,
          });
        } catch (launchError) {
          logger.error("Error launching Puppeteer:", launchError);
          return res.status(500).json({ error: "Error launching browser" });
        }

        const page = await browser.newPage();
        // await page.emulateMediaType("print");

        try {
          await page.setContent(fullHtml, { waitUntil: "networkidle0" });
        } catch (contentError) {
          logger.error("Error setting page content:", contentError);
          return res.status(500).json({ error: "Error setting page content" });
        }

        // let pdfBuffer;
        // try {
        //   pdfBuffer = await page.pdf({ format: "Letter" });
        // } catch (pdfError) {
        //   logger.error("Error generating PDF:", pdfError);
        //   return res.status(500).json({ error: "Error generating PDF" });
        // }
        // logger.info(`Generated PDF buffer length: ${pdfBuffer.length}`);

        // // Return PDF
        // res.set("Content-Type", "application/pdf");
        // res.status(200).send(pdfBuffer);

        let screenshotBuffer;
        try {
          screenshotBuffer = await page.screenshot({
            type: "png", // or "jpeg"
            fullPage: true,
            encoding: "base64",
          });
          logger.info(`Screenshot buffer length: ${screenshotBuffer.length}`);
        } catch (screenshotError) {
          logger.error("Error taking screenshot:", screenshotError);
          return res.status(500).json({ error: "Error taking screenshot" });
        }
        logger.info(
          `Generated screenshot buffer length: ${screenshotBuffer.length}`
        );

        res.set("Content-Type", "image/png");
        res.status(200).send(screenshotBuffer);
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
  }
);
