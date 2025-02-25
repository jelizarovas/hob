import { useEffect, useReducer } from "react";

const useLocalStorage = (reducer, initialState, id) => {
  const key = id ? `quoteState_${id}` : `quoteState_default`;

  // Initialize state from localStorage or initialState
  const initializeState = () => {
    const savedState = JSON.parse(localStorage.getItem(key));
    return savedState || initialState;
  };

  const [state, dispatch] = useReducer(reducer, {}, initializeState);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [state, key]);

  // Reset state if the vehicle changes and has a `id`
  useEffect(() => {
    if (id) {
      const savedState = JSON.parse(localStorage.getItem(key)) || initialState;
      dispatch({ type: "RESET_STATE", payload: savedState });
    }
  }, [id]); // Only reset if the `vin` changes

  return [state, dispatch];
};

export default useLocalStorage;
