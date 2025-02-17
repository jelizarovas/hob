/*
firebase deploy --only functions:listAccounts,functions:addAccount,functions:disableAccount,functions:enableAccount,functions:deleteAccount,functions:createUserProfile

*/
import { onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import admin from "firebase-admin";
import cors from "cors";

const corsHandler = cors({ origin: true });

// Helper: Verify the Authorization header for an admin token.
// Only admin may call
async function verifyAdmin(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: No token provided" });
    return false;
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken.role !== "admin") {
      res.status(403).json({ error: "Forbidden: Only admins allowed" });
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(403).json({ error: "Forbidden: Invalid token" });
    return false;
  }
}

// Allow admin or manager, but with an optional targetRole check:
// If the targetRole is "admin", then a manager is not allowed.
async function verifyAdminOrManager(req, res, targetRole = null) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: No token provided" });
    return false;
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken.role === "admin") {
      // Admin can do anything.
      return true;
    }
    if (decodedToken.role === "manager") {
      // Managers cannot, for example, disable an admin or set admin role.
      if (targetRole && targetRole === "admin") {
        res.status(403).json({
          error: "Forbidden: Managers cannot modify admin users",
        });
        return false;
      }
      return true;
    }
    res.status(403).json({ error: "Forbidden: Insufficient privileges" });
    return false;
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(403).json({ error: "Forbidden: Invalid token" });
    return false;
  }
}

// List Accounts (HTTP endpoint)
// firebase deploy --only functions:listAccounts
export const listAccounts = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (!(await verifyAdminOrManager(req, res))) return;
    try {
      if (req.method !== "GET") {
        res.status(405).json({ error: "Method Not Allowed" });
        return;
      }
      const listUsersResult = await admin.auth().listUsers();
      const users = listUsersResult.users.map((userRecord) => ({
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        disabled: userRecord.disabled,
        role: (userRecord.customClaims && userRecord.customClaims.role) || "not set",
        photoURL: userRecord.photoURL || null,
      }));
      res.status(200).json({ users });
    } catch (error) {
      console.error("Error listing accounts:", error);
      res.status(500).json({ error: error.message });
    }
  });
});


// ----------------------------------------------------------------
// DISABLE ACCOUNT
// ----------------------------------------------------------------
// firebase deploy --only functions:disableAccount
export const disableAccount = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }
    let body = req.body;
    if (typeof body === "string") body = JSON.parse(body);
    const { uid } = body;
    if (!uid) {
      res.status(400).json({ error: "UID is required" });
      return;
    }
    // Fetch the target user's record so we can check its role.
    let targetUser;
    try {
      targetUser = await admin.auth().getUser(uid);
    } catch (error) {
      console.error("Error fetching target user:", error);
      res.status(500).json({ error: "Could not fetch target user" });
      return;
    }
    // Extract target user's role from custom claims (or default to "not set")
    const targetRole =
      (targetUser.customClaims && targetUser.customClaims.role) || "not set";
    // Verify that the caller is an admin or manager (managers cannot disable admin users).
    if (!(await verifyAdminOrManager(req, res, targetRole))) return;
    try {
      await admin.auth().updateUser(uid, { disabled: true });
      res.status(200).json({ message: "Account disabled" });
    } catch (error) {
      console.error("Error disabling account:", error);
      res.status(500).json({ error: error.message });
    }
  });
});

// Enable Account (HTTP endpoint)
export const enableAccount = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (!(await verifyAdmin(req, res))) return;
    try {
      if (req.method !== "POST") {
        res.status(405).json({ error: "Method Not Allowed" });
        return;
      }
      let body = req.body;
      if (typeof body === "string") body = JSON.parse(body);
      const { uid } = body;
      if (!uid) {
        res.status(400).json({ error: "UID is required" });
        return;
      }
      await admin.auth().updateUser(uid, { disabled: false });
      res.status(200).json({ message: "Account enabled" });
    } catch (error) {
      console.error("Error enabling account:", error);
      res.status(500).json({ error: error.message });
    }
  });
});

// Delete Account (HTTP endpoint)
export const deleteAccount = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (!(await verifyAdmin(req, res))) return;
    try {
      if (req.method !== "POST") {
        res.status(405).json({ error: "Method Not Allowed" });
        return;
      }
      let body = req.body;
      if (typeof body === "string") body = JSON.parse(body);
      const { uid } = body;
      if (!uid) {
        res.status(400).json({ error: "UID is required" });
        return;
      }
      await admin.auth().deleteUser(uid);
      await admin.firestore().collection("users").doc(uid).delete();
      res.status(200).json({ message: "Account deleted" });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ error: error.message });
    }
  });
});

// Make Me Admin (HTTP endpoint)
// For convenience in dev: If you're not admin, call this endpoint with your UID and a secret query parameter.
export const makeMeAdmin = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    // Accept UID from query/body; verify with a secret.
    const secret = req.query.secret || req.body.secret;
    const expectedSecret = process.env.MAKE_ME_ADMIN_SECRET || "devsecret";
    let uid = req.method === "GET" ? req.query.uid : req.body.uid;
    if (!uid) {
      res.status(400).json({ error: "UID is required" });
      return;
    }
    if (secret !== expectedSecret) {
      res.status(403).json({ error: "Forbidden: Invalid secret" });
      return;
    }
    try {
      await admin.auth().setCustomUserClaims(uid, { role: "admin" });
      res.status(200).json({ message: `User ${uid} is now an admin` });
    } catch (error) {
      console.error("Error in makeMeAdmin:", error);
      res.status(500).json({ error: error.message });
    }
  });
});

// Firestore Trigger: When a new document is added to "users/{newUserId}",
// create a corresponding Firebase Auth account.
// firebase deploy --only functions:createAuthAccount
export const createAuthAccount = onDocumentCreated(
  "/users/{newUserId}",
  async (event) => {
    // Get the document ID from the path parameter.
    const docId = event.params.newUserId;
    const snapshot = event.data;
    const userData = snapshot.data();
    const { email, displayName, role } = userData;
    if (!email || !displayName) {
      console.error("Missing email or displayName in Firestore document.");
      return;
    }
    // Split displayName into firstName and lastName.
    const nameParts = displayName?.trim()?.split(" ") || [];
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    try {
      // Use the document ID as the UID.
      const uidToUse = docId;
      const newUser = {
        email,
        displayName,
        firstName,
        lastName,
        uid: uidToUse,
        password: "Rairdon123!",
      };
      // Create the Auth account with the specified UID.
      const userRecord = await admin.auth().createUser(newUser);
      console.log(`Auth account created for doc ${docId}: ${userRecord.uid}`);
      // Update the Firestore document with the auth UID and name parts.

      if (role) {
        await admin.auth().setCustomUserClaims(userRecord.uid, { role });
      }

      await snapshot.ref.update({
        uid: userRecord.uid,
        firstName,
        lastName,
        role: role || "not set",
      });
    } catch (error) {
      console.error("Error creating auth account:", error);
    }
  }
);

// ----------------------------------------------------------------
// UPDATE USER ROLE
// ----------------------------------------------------------------
// firebase deploy --only functions:updateUserRole
export const updateUserRole = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        res.status(400).json({ error: "Invalid JSON" });
        return;
      }
    }
    const { uid, newRole } = body;
    if (!uid || !newRole) {
      res.status(400).json({ error: "Missing uid or newRole" });
      return;
    }
    // For role updates, if newRole is "admin", a manager is not allowed.
    if (!(await verifyAdminOrManager(req, res, newRole))) return;
    try {
      await admin.auth().setCustomUserClaims(uid, { role: newRole });
      res
        .status(200)
        .json({ message: `User ${uid} role updated to ${newRole}` });
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ error: error.message });
    }
  });
});
