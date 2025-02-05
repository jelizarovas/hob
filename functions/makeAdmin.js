import admin from "firebase-admin";

admin.initializeApp({
  projectId: "honda-burien",
});

async function makeUserAdmin(uid) {
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`User ${uid} is now an admin.`);
  } catch (error) {
    console.error("Error setting custom claims:", error);
  }
}

makeUserAdmin("VjyHtNo6clg4JdMU8aw3YGfRhfT2");
