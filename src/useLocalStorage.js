import { useState, useEffect } from "react";

function useLocalStorage(key, initialValue, identifierKey) {
  // Initialize the state
  const [state, setState] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  // Update local storage when state changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.log(error);
    }
  }, [state]);

  // Function to add an item
  const addItem = (item) => {
    console.log({ item });
    setState((prev) => (Array.isArray(prev) ? [...prev, item] : [item]));
  };

  // Function to remove an item
  const removeItem = (itemId) => {
    setState((prev) => (Array.isArray(prev) ? prev.filter((i) => i[identifierKey] !== itemId) : []));
  };

  // Function to clear all items
  const clearItems = () => {
    setState([]);
  };

  // Function to toggle an item
  const toggleItem = (item) => {
    setState((prev) => {
      if (Array.isArray(prev) && prev.some((i) => i[identifierKey] === item[identifierKey])) {
        return prev.filter((i) => i[identifierKey] !== item[identifierKey]);
      } else {
        return [...prev, item];
      }
    });
  };

  return [state, setState, addItem, removeItem, clearItems, toggleItem];
}

export default useLocalStorage;
