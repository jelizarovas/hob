// GamepadProvider.jsx
import React from "react";
import Gamepad from "react-gamepad";
import {
  updateGamepadState,
  updateButtonState,
  getGamepadState,
  HOLD_THRESHOLD,
} from "./gamepadStore";

function handleButtonChange(buttonName, pressed) {
  const currentButton = getGamepadState().buttons[buttonName];

  console.log(`Button ${buttonName} ${pressed ? "pressed" : "released"}`);

  // Avoid processing if nothing changed.
  if (currentButton.pressed === pressed) return;

  if (pressed) {
    // Record press time and mark as pressed.
    updateButtonState(buttonName, { pressed: true, lastPressTime: Date.now() });
    // Set a timeout to mark as hold if still pressed after HOLD_THRESHOLD.
    setTimeout(() => {
      const stateNow = getGamepadState().buttons[buttonName];
      if (
        stateNow.pressed &&
        Date.now() - stateNow.lastPressTime >= HOLD_THRESHOLD
      ) {
        console.log(`Button ${buttonName} detected as hold`);
        updateButtonState(buttonName, { hold: true });
      }
    }, HOLD_THRESHOLD);
  } else {
    // Button released. Determine press duration.
    const pressDuration = Date.now() - (currentButton.lastPressTime || 0);
    if (pressDuration < HOLD_THRESHOLD) {
      console.log(
        `Button ${buttonName} detected as tap (duration ${pressDuration}ms)`
      );
      updateButtonState(buttonName, { tap: true });
    }
    // Reset the pressed state.
    updateButtonState(buttonName, { pressed: false, lastPressTime: null });
    // Reset ephemeral events (tap and hold) after a brief delay.
    setTimeout(() => {
      updateButtonState(buttonName, { tap: false, hold: false });
    }, 50);
  }
}

function handleAxisChange(axisName, value) {
  // Log the axis changes so you can see, for example, trigger percentages.
  console.log(`Axis ${axisName} changed to ${value.toFixed(2)}`);
  // Update axes in global state.
  updateGamepadState({
    axes: { ...getGamepadState().axes, [axisName]: value },
  });
}

function handleConnect() {
  console.log("Gamepad connected");
  updateGamepadState({ connected: true });
  // Optionally, inspect the connected gamepad(s) here and update type.
}

function handleDisconnect() {
  console.log("Gamepad disconnected");
  updateGamepadState({ connected: false });
}

export default function GamepadProvider({ children }) {
  return (
    <Gamepad
      onButtonChange={handleButtonChange}
      onAxisChange={handleAxisChange}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      gamepadIndex={0}
    >
      {children}
    </Gamepad>
  );
}
