// gamepadStore.js
import { useSyncExternalStore } from "react";

export const KNOWN_BUTTONS = [
  "A",
  "B",
  "X",
  "Y",
  "LB",
  "RB",
  "LT",
  "RT",
  "LS",
  "RS",
  "Start",
  "Back",
  "Home",
  "DPadUp",
  "DPadDown",
  "DPadLeft",
  "DPadRight",
];

// Threshold (in ms) to decide if a button press is a tap or a hold.
export const HOLD_THRESHOLD = 220;

const createInitialButtonState = () => {
  const state = {};
  KNOWN_BUTTONS.forEach((btn) => {
    state[btn] = {
      pressed: false,
      lastPressTime: null,
      tap: false,
      hold: false,
    };
  });
  return state;
};

let globalGamepadState = {
  connected: false,
  buttons: createInitialButtonState(),
  axes: {}, // holds axis values such as leftTrigger, rightTrigger, etc.
  controllerType: null,
  gamepads: [],
};

const subscribers = new Set();

export function getGamepadState() {
  return globalGamepadState;
}

export function subscribe(callback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

function notifySubscribers() {
  subscribers.forEach((cb) => cb());
}

export function updateGamepadState(newState) {
  globalGamepadState = { ...globalGamepadState, ...newState };
  notifySubscribers();
}

export function updateButtonState(buttonName, newValues) {
  const newButtons = {
    ...globalGamepadState.buttons,
    [buttonName]: { ...globalGamepadState.buttons[buttonName], ...newValues },
  };
  globalGamepadState = {
    ...globalGamepadState,
    buttons: newButtons,
  };
  notifySubscribers();
}

// Custom hook returns an object with a named gamepad property for easier consumption.
export function useGamepad(selector = (state) => state) {
  return {
    gamepad: useSyncExternalStore(
      (cb) => {
        subscribers.add(cb);
        // log here to see when a subscriber is added
        console.log("Subscribed to gamepad store");
        return () => subscribers.delete(cb);
      },
      () => {
        const snapshot = selector(getGamepadState());
        console.log("Snapshot:", snapshot);
        return snapshot;
      }
    ),
  };
}
// Optionally, helper to reset ephemeral events.
export function resetEphemeralButtonEvents() {
  const newButtons = {};
  Object.keys(globalGamepadState.buttons).forEach((btn) => {
    newButtons[btn] = {
      ...globalGamepadState.buttons[btn],
      tap: false,
      hold: false,
    };
  });
  globalGamepadState.buttons = newButtons;
  notifySubscribers();
}
