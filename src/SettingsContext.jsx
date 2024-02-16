import React, { useReducer, useEffect, createContext, useContext } from "react";

const SettingsContext = createContext();

const initialState = {
  vehicleListDisplayMode: "list",
  showPrice: true,
  showCarfax: true,
  showMiles: true,
  showDays: true,
  showLocation: true,
  showColor: true,
};

const getInitialSettings = () => {
  const settingsFromStorage = localStorage.getItem("settings");
  return settingsFromStorage ? JSON.parse(settingsFromStorage) : initialState;
};

const settingsReducer = (state, action) => {
  switch (action.type) {
    case "SET_SETTING":
      return {
        ...state,
        [action.payload.name]: action.payload.value,
      };
    default:
      throw new Error(`Unsupported action type: ${action.type}`);
  }
};

export const SettingsProvider = ({ children }) => {
  // Initialize state from localStorage or use defaults
  const initialSettings = getInitialSettings();
  const [settings, dispatch] = useReducer(settingsReducer, initialSettings);

  useEffect(() => {
    // Store the settings to localStorage whenever they change
    localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);

  const setSetting = (name, value) => {
    dispatch({ type: "SET_SETTING", payload: { name, value } });
  };

  return <SettingsContext.Provider value={{ settings, setSetting }}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
