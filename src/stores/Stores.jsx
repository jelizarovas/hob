import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  doc,
  runTransaction,
  setDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { ResetStores } from "./ResetStores";

export const Stores = () => {
  const [stores, setStores] = useState([]);
  const storesCollectionRef = collection(db, "stores");

  useEffect(() => {
    const unsubscribe = onSnapshot(storesCollectionRef, (snapshot) => {
      const storeList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStores(storeList);
    });

    return () => unsubscribe();
  }, []);

  const handleAddStore = async () => {
    const storeName = prompt("Name of the new dealership?");
    if (!storeName) return;

    try {
      const slug = await getNextSlug();
      await setDoc(doc(db, "stores", slug), { name: storeName });
    } catch (err) {
      console.error("Error adding store:", err);
      alert("Failed to create new store. See console for details.");
    }
  };

  // Increments the counter doc and returns the new zero-padded base36 slug
  const getNextSlug = async () => {
    const countersRef = doc(db, "counters", "stores");

    const newSlug = await runTransaction(db, async (transaction) => {
      const countersSnap = await transaction.get(countersRef);

      // If doc doesn't exist yet, create it starting at 1
      if (!countersSnap.exists()) {
        transaction.set(countersRef, { count: 1 });
        return "0001"; // first doc
      }

      // If it does exist, increment
      let currentCount = countersSnap.data().count || 0;
      currentCount++;
      if (currentCount > 999999) {
        throw new Error("Max store count reached (999999).");
      }
      transaction.update(countersRef, { count: currentCount });

      // Convert to base36, then pad to 4 chars
      const rawSlug = currentCount.toString(36); // e.g. "1"
      const slug = rawSlug.padStart(4, "0"); // e.g. "0001"
      return slug;
    });

    return newSlug;
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Stores</h1>

      <button
        onClick={handleAddStore}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
      >
        Add Store
      </button>

      <ul className="space-y-2">
        {stores.map((store) => (
          <li key={store.id}>
            <Link
              to={`/admin/store/${store.id}`}
              className="text-blue-500 underline hover:text-blue-700"
            >
              {store.id} — {store.name}
            </Link>
          </li>
        ))}
      </ul>
      <ResetStores />
    </div>
  );
};
