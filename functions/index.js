/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const { onRequest } = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

import {
  onDocumentCreated,
  onDocumentDeleted,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";
import { onCall } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import admin from "firebase-admin";
import * as functions from "firebase-functions";
import { listAuthUsers } from "./src/listAuthUsers.js";
import { makeMeAdmin } from "./src/makeMeAdmin.js";
export { makeMeAdmin };

export { listAuthUsers };

admin.initializeApp();
const db = getFirestore();

export const logUserCreated = onDocumentCreated(
  "users/{userId}",
  async (event) => {
    try {
      const newData = event.data?.data() || {};
      const userId = event.params.userId;

      // Suppose the client sets these fields on create
      const actorUid = newData.actorUid || "unknown";
      const actorDisplayName = newData.actorDisplayName || "Unknown Actor";

      await db.collection("logs").doc("users").collection("entries").add({
        actorUid,
        actorDisplayName,
        action: "create",
        targetDocId: userId,
        timestamp: FieldValue.serverTimestamp(),
        details: { newData },
      });

      functions.logger.info(
        `User ${userId} created by ${actorDisplayName} (${actorUid}).`
      );
    } catch (error) {
      functions.logger.error("Error logging user creation:", error);
    }
  }
);

export const logUserDeleted = onDocumentDeleted(
  "users/{userId}",
  async (event) => {
    try {
      const beforeData = event.data?.data() || {};
      const userId = event.params.userId;

      // Possibly store who performed the delete if you have a separate mechanism
      // e.g. your client sets a "deletedBy" somewhere before deleting, or you do this via a Cloud Function call
      const actorUid = beforeData.deletedByUid || "unknown";
      const actorDisplayName = beforeData.deletedByName || "Unknown Actor";

      await db.collection("logs").doc("users").collection("entries").add({
        actorUid,
        actorDisplayName,
        action: "delete",
        targetDocId: userId,
        timestamp: FieldValue.serverTimestamp(),
        details: { beforeData },
      });

      functions.logger.info(
        `User ${userId} deleted by ${actorDisplayName} (${actorUid}).`
      );
    } catch (error) {
      functions.logger.error("Error logging user deletion:", error);
    }
  }
);

/**
 * Callable function to disable or enable a user's login.
 * Expects data: { targetUid: string, disable: boolean, actorUid: string, actorDisplayName: string }
 */
export const setUserLoginEnabled = onCall(async (request) => {
  const { targetUid, disable, actorUid, actorDisplayName } = request.data || {};

  // Check if caller is admin
  if (!request.auth || !request.auth.token || !request.auth.token.admin) {
    throw new functions.https.HttpsError("permission-denied", "Admins only");
  }

  // Perform the action using Admin SDK
  await admin.auth().updateUser(targetUid, { disabled: disable });

  // Log the action
  await db
    .collection("logs")
    .doc("users")
    .collection("entries")
    .add({
      actorUid: actorUid || request.auth.uid,
      actorDisplayName: actorDisplayName || "Unknown Admin",
      action: disable ? "disableLogin" : "enableLogin",
      targetDocId: targetUid,
      timestamp: FieldValue.serverTimestamp(),
    });

  return { success: true };
});

//   import { getFunctions, httpsCallable } from "firebase/functions";

// const functions = getFunctions();
// const setUserLoginEnabled = httpsCallable(functions, "setUserLoginEnabled");

// async function disableLoginForUser(adminUid, adminName, targetUid) {
//   await setUserLoginEnabled({
//     targetUid,
//     disable: true,
//     actorUid: adminUid,
//     actorDisplayName: adminName,
//   });
//   alert("Disabled login for " + targetUid);
// }
//firebase deploy --only functions:logUserUpdated
export const logUserUpdated = onDocumentUpdated(
  "users/{userId}",
  async (event) => {
    try {
      const beforeData = event.data.before.data() || {};
      const afterData = event.data.after.data() || {};

      if (!event.data.before.exists || !event.data.after.exists) {
        functions.logger.info("No doc data found or doc not updated.");
        return;
      }

      // Build an object of changed fields: { fieldName: { oldValue, newValue } }
      const changedFields = {};
      for (const key of Object.keys(afterData)) {
        const beforeVal = beforeData[key];
        const afterVal = afterData[key];
        if (beforeVal !== afterVal) {
          changedFields[key] = { oldValue: beforeVal, newValue: afterVal };
        }
      }
      // Check for removed fields
      for (const key of Object.keys(beforeData)) {
        if (!(key in afterData)) {
          changedFields[key] = {
            oldValue: beforeData[key],
            newValue: undefined,
          };
        }
      }

      const changedKeys = Object.keys(changedFields);
      if (changedKeys.length === 0) {
        functions.logger.info("No actual field changes detected.");
        return;
      }

      // Extract actor information from lastUpdatedBy field
      const lastUpdatedBy = afterData.lastUpdatedBy || {};
      const actorUid = lastUpdatedBy.userId || "unknownUid";
      const actorDisplayName = lastUpdatedBy.displayName || "Unknown Actor";

      // Log the update in the /logs/users/entries subcollection
      await db.collection("logs").doc("users").collection("entries").add({
        actorUid,
        actorDisplayName,
        action: "update",
        targetDocId: event.params.userId,
        timestamp: FieldValue.serverTimestamp(),
        details: changedFields,
      });

      functions.logger.info(
        `User ${
          event.params.userId
        } updated by ${actorDisplayName} (${actorUid}). Changed fields: ${changedKeys.join(
          ", "
        )}`
      );
    } catch (error) {
      functions.logger.error("Error logging user update:", error);
    }
  }
);
