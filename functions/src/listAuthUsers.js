// functions/src/listAuthUsers.js
import { onCall } from "firebase-functions/v2/https";
import admin from "firebase-admin";
import functions from "firebase-functions";


export const listAuthUsers = onCall(async (data, context) => {
  // Check that the caller is authenticated and has an admin role.
  // You might use custom claims or a Firestore lookup for admin status.
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only admins can list users."
    );
  }

  let nextPageToken;
  const users = [];

  try {
    // List all users in batches of 1000.
    do {
      const result = await admin.auth().listUsers(1000, nextPageToken);
      // Map the results to the fields you want to send to the client.
      users.push(
        ...result.users.map((userRecord) => ({
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          disabled: userRecord.disabled,
        }))
      );
      nextPageToken = result.pageToken;
    } while (nextPageToken);
    return users;
  } catch (error) {
    throw new functions.https.HttpsError("unknown", error.message, error);
  }
});
