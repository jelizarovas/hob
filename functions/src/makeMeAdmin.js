// functions/src/makeMeAdmin.js
import { onRequest } from "firebase-functions/v2/https";
import admin from "firebase-admin";

//firebase deploy --only functions:makeMeAdmin
//firebase functions:delete makeMeAdmin --region=<region>
//https://us-central1-honda-burien.cloudfunctions.net/makeMeAdmin?secret=YOUR_SECRET_HERE

export const makeMeAdmin = onRequest(async (req, res) => {
  // Optional: secure the function with a secret query parameter
  const secret = req.query.secret;
  if (secret !== "YOUR_SECRET_HERE") {
    return res.status(403).send("Forbidden: Invalid secret.");
  }

  // Replace this UID with your own UID
  const targetUid = "VjyHtNo6clg4JdMU8aw3YGfRhfT2";

  try {
    await admin.auth().setCustomUserClaims(targetUid, { admin: true });
    res.status(200).send(`User ${targetUid} is now an admin.`);
  } catch (error) {
    res.status(500).send(`Error setting admin: ${error.message}`);
  }
});
