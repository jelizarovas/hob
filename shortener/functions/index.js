const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// Algolia setup – ensure you have installed algoliasearch via npm
const algoliasearch = require("algoliasearch");
const ALGOLIA_APP_ID = "SEWJN80HTN"; // Replace with your Algolia App ID
const ALGOLIA_API_KEY = "179608f32563367799314290254e3e44"; // Replace with your Algolia API Key
const ALGOLIA_INDEX_NAME =
  "rairdonshondaofburien-legacymigration0222_production_inventory_low_to_high"; // Replace with your index name
const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
const algoliaIndex = algoliaClient.initIndex(ALGOLIA_INDEX_NAME);

/**
 * Helper: Determines which redirect status to use
 * - Uses 307 for non-GET methods (which preserves method and body),
 * - Otherwise, returns 302.
 */
function getRedirectStatus(method) {
  return method !== "GET" ? 307 : 302;
}

exports.redirectHandler = onRequest(async (req, res) => {
  // Get the incoming slug; remove the leading "/" and force lowercase.
  let slug = req.path.slice(1).toLowerCase();

  // If no slug is provided, redirect to the default site.
  if (!slug) {
    return res.redirect(
      getRedirectStatus(req.method),
      "https://burienhonda.com"
    );
  }

  // 1. Directory Forwarding: e.g., "quote/64443" => proposals.hofb.app/64443
  if (slug.startsWith("quote/")) {
    // Remove "quote/" prefix
    const id = slug.slice("quote/".length);
    return res.redirect(
      getRedirectStatus(req.method),
      `https://proposals.hofb.app/${id}`
    );
  }

  // 2. Stock Number Searches: if slug starts with "#" (expect URL-encoded as '%23')
  if (slug.startsWith("#")) {
    // Remove the "#" to get the stock number
    const stockNumber = slug.slice(1);
    try {
      const algoliaResult = await algoliaIndex.search(stockNumber, {
        // Optionally add filters here if needed:
        // filters: `stockNumber:"${stockNumber}"`,
      });
      if (algoliaResult.hits && algoliaResult.hits.length > 0) {
        const result = algoliaResult.hits[0];
        if (result.url) {
          return res.redirect(getRedirectStatus(req.method), result.url);
        }
      }
      // No match found – treat as expired.
      return res.status(404).send("Link has expired.");
    } catch (err) {
      console.error("Algolia search error:", err);
      return res.status(500).send("Something went wrong.");
    }
  }

  // 3. Standard Short URL Redirect via Firestore lookup
  try {
    const docRef = db.collection("links").doc(slug);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();

      // Check if an expiration date is set and if the link is expired.
      if (data.expirationDate && data.expirationDate.toMillis() < Date.now()) {
        // Either send a message or redirect to the default site.
        // Here we choose to redirect to burienhonda.com.
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
