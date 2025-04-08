const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

exports.redirectHandler = onRequest(async (req, res) => {
  const slug = req.path.slice(1);

  if (!slug) {
    return res.redirect("https://hofb.app");
  }

  try {
    const docRef = db.collection("links").doc(slug);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).send("🔗 Link not found.");
    }

    // Pull out `destination` from the link document.
    const { destination } = docSnap.data();

    // Increment the counter and set lastAccessed to server time.
    await docRef.update({
      clickCount: FieldValue.increment(1),
      lastAccessed: FieldValue.serverTimestamp(),
    });

    // Finally, redirect the user
    return res.redirect(302, destination);
  } catch (err) {
    console.error("Redirect error:", err);
    return res.status(500).send("Something went wrong.");
  }
});
