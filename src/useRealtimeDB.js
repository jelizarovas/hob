import { useState, useEffect, useRef } from "react";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { auth } from "./firebase";
import useLocalStorage from "./useLocalStorage";

function useRealtimeDB(key, initialValue, identifierKey) {
  const userId = auth.currentUser ? auth.currentUser.uid : null;
  const [
    localData,
    setLocalData,
    addLocalItem,
    removeLocalItem,
    clearLocalItems,
    toggleLocalItem,
  ] = useLocalStorage(key, initialValue, identifierKey);

  const [remoteData, setRemoteData] = useState(initialValue);
  const isRemoteDataInitialized = useRef(false);
  const isLocalDataInitialized = useRef(false);

  // Fetch remote data
  useEffect(() => {
    if (!userId) return;

    const db = getDatabase();
    const dataRef = ref(db, `sync/${userId}/${key}`);

    const unsubscribe = onValue(dataRef, (snapshot) => {
      const value = snapshot.val();
      if (value !== null) {
        setRemoteData(value);
        isRemoteDataInitialized.current = true;
      }
    });

    return () => unsubscribe();
  }, [userId, key]);

  // Sync remote data to local storage
  useEffect(() => {
    if (!isRemoteDataInitialized.current) return;

    setLocalData(remoteData);
  }, [remoteData]);

  // Sync local data to remote database
  useEffect(() => {
    if (!userId) return;

    const db = getDatabase();
    const dataRef = ref(db, `sync/${userId}/${key}`);

    if (isRemoteDataInitialized.current) {
      isRemoteDataInitialized.current = false;
      return;
    }

    set(dataRef, localData);
  }, [localData, userId, key]);

  const addItem = (item) => {
    addLocalItem(item);
  };

  const removeItem = (itemId) => {
    removeLocalItem(itemId);
  };

  const clearItems = () => {
    clearLocalItems();
  };

  const toggleItem = (item) => {
    toggleLocalItem(item);
  };

  return [localData, setLocalData, addItem, removeItem, clearItems, toggleItem];
}

export default useRealtimeDB;
