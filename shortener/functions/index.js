const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// Algolia setup using the lite client
const { liteClient } = require("algoliasearch/lite");
const ALGOLIA_APP_ID = "SEWJN80HTN"; // Replace with your Algolia App ID
const ALGOLIA_API_KEY = "179608f32563367799314290254e3e44"; // Replace with your Algolia API Key
const ALGOLIA_INDEX_NAME =
  "rairdonshondaofburien-legacymigration0222_production_inventory_low_to_high"; // Replace with your index name
const algoliaClient = liteClient(ALGOLIA_APP_ID, ALGOLIA_API_KEY);

/**
 * Helper: Determines which redirect status to use.
 * Uses 307 for non-GET methods (to preserve method and body), otherwise returns 302.
 */
function getRedirectStatus(method) {
  return method !== "GET" ? 307 : 302;
}

exports.redirectHandler = onRequest(async (req, res) => {
  // Get the incoming slug; remove the leading "/" and convert to lowercase.
  let slug = req.path.slice(1).toLowerCase();

  // If no slug is provided, redirect to the default site.
  if (!slug) {
    return res.redirect(
      getRedirectStatus(req.method),
      "https://burienhonda.com"
    );
  }

  // 1. Directory Forwarding: e.g. "quote/64443" -> proposals.hofb.app/64443
  if (slug.startsWith("quote/")) {
    const id = slug.slice("quote/".length);
    return res.redirect(
      getRedirectStatus(req.method),
      `https://proposals.hofb.app/${id}`
    );
  }

  // 2. Stock Number Searches: if slug starts with "#" (e.g. URL-encoded as '%23')
  // 2. Stock Number Searches: if slug starts with "#" (expect URL-encoded as '%23')
  if (slug.startsWith("#")) {
    // Remove the "#" to get the stock number.
    const stockNumber = slug.slice(1);
    try {
      // Use the Algolia lite client's search API.
      const { results } = await algoliaClient.search({
        requests: [
          {
            indexName: ALGOLIA_INDEX_NAME,
            query: stockNumber,
          },
        ],
      });
      // Ensure at least one hit is returned.
      if (
        results &&
        results[0] &&
        results[0].hits &&
        results[0].hits.length > 0
      ) {
        const result = results[0].hits[0];
        // Check for the 'link' property in the returned object.
        if (result.link) {
          return res.redirect(getRedirectStatus(req.method), result.link);
        }
      }
      // No matching result, treat as expired.
      return res.status(404).send("Link has expired.");
    } catch (err) {
      console.error("Algolia search error:", err);
      return res.status(500).send("Something went wrong.");
    }
  }

  // 3. Standard Short URL Redirect via Firestore lookup.
  try {
    const docRef = db.collection("links").doc(slug);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();

      // Check if an expiration date is set and if the link is expired.
      if (data.expirationDate && data.expirationDate.toMillis() < Date.now()) {
        return res.redirect(
          getRedirectStatus(req.method),
          "https://burienhonda.com"
        );
      }

      // Update click counter and last accessed timestamp.
      await docRef.update({
        clickCount: FieldValue.increment(1),
        lastAccessed: FieldValue.serverTimestamp(),
      });

      const { destination } = data;
      return res.redirect(getRedirectStatus(req.method), destination);
    } else {
      return res.status(404).send("🔗 Link not found.");
    }
  } catch (err) {
    console.error("Redirect error:", err);
    return res.status(500).send("Something went wrong.");
  }
});
