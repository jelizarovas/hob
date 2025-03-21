const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

exports.redirectHandler = onRequest(async (req, res) => {
  const slug = req.path.slice(1);

  if (!slug) return res.redirect("https://hofb.app");

  try {
    const doc = await db.collection("links").doc(slug).get();
    if (doc.exists) {
      const { destination } = doc.data();
      return res.redirect(302, destination);
    } else {
      return res.status(404).send("🔗 Link not found.");
    }
  } catch (err) {
    console.error("Redirect error:", err);
    return res.status(500).send("Something went wrong.");
  }
});
