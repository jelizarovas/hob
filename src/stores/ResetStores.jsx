import React from "react";
import {
  collection,
  getDocs,
  writeBatch,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export const ResetStores = () => {
  const handleReset = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete ALL stores and reset counter to 0?"
      )
    ) {
      return;
    }
    try {
      // 1) Delete all docs in the 'stores' collection
      const storesRef = collection(db, "stores");
      const snapshot = await getDocs(storesRef);
      const batch = writeBatch(db);
      snapshot.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();

      // 2) Reset the counter doc
      const countersRef = doc(db, "counters", "stores");
      await setDoc(countersRef, { count: 0 }, { merge: true });

      alert("All stores deleted and counter reset to 0!");
    } catch (err) {
      console.error("Error resetting stores:", err);
      alert("Failed to reset. See console for details.");
    }
  };

  return (
    <button
      onClick={handleReset}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Reset Stores
    </button>
  );
};
