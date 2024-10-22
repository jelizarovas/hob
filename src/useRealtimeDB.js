import { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, set, onValue } from 'firebase/database';
import { auth } from './firebase';

const useRealtimeDB = (key, initialValue) => {
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    const [data, setData] = useState(initialValue);
    const isInitialLoad = useRef(true);
    const skipNextEffect = useRef(false);

    // Fetch remote data on load and subscribe to changes
    useEffect(() => {
        if (!userId) return;

        const db = getDatabase();
        const dataRef = ref(db, `sync/${userId}/${key}`);

        const unsubscribe = onValue(dataRef, (snapshot) => {
            const value = snapshot.val();
            if (value !== null) {
                setData(value);
            } else {
                setData(initialValue);
            }
            isInitialLoad.current = false;
        });

        return () => unsubscribe();
    }, [userId, key, initialValue]);

    // Sync state to remote database
    useEffect(() => {
        if (isInitialLoad.current || skipNextEffect.current || !userId) {
            skipNextEffect.current = false;
            return;
        }

        const db = getDatabase();
        const dataRef = ref(db, `sync/${userId}/${key}`);

        set(dataRef, data).catch((error) => {
            console.error("Error updating Firebase:", error);
        });
    }, [data, userId, key]);

    const addItem = (item) => {
        skipNextEffect.current = true;
        setData((prevData) => [...prevData, item]);
    };

    const removeItem = (itemId, identifierKey) => {
        skipNextEffect.current = true;
        setData((prevData) => prevData.filter((item) => item[identifierKey] !== itemId));
    };

    const clearItems = () => {
        skipNextEffect.current = true;
        setData([]);
    };

    const toggleItem = (item, identifierKey) => {
        skipNextEffect.current = true;
        setData((prevData) => {
            const exists = prevData.some((i) => i[identifierKey] === item[identifierKey]);
            return exists
                ? prevData.filter((i) => i[identifierKey] !== item[identifierKey])
                : [...prevData, item];
        });
    };

    return [data, addItem, removeItem, clearItems, toggleItem];
};

export default useRealtimeDB;
