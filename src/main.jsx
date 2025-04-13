import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import GamepadProvider from "./gamepad/GamepadProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <GamepadProvider>
    <App />
  </GamepadProvider>
  // </React.StrictMode>,
);
