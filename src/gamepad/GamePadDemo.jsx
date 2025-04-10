import React, { useState } from "react";
import Gamepad from "react-gamepad";

// Known buttons you'd like to visualize
// Your Kishi uses these names, but if something new appears, we'll catch it as "unknown"
const KNOWN_BUTTONS = [
  "LB",
  "RB",
  "LT", // left trigger
  "RT", // right trigger
  "A",
  "B",
  "X",
  "Y",
  "LS", // left stick click
  "RS", // right stick click
  "Start",
  "Back",
  "Home",
  "DPadUp",
  "DPadDown",
  "DPadLeft",
  "DPadRight",
];

export default function GamePadDemo() {
  // Track pressed state for known buttons
  const [buttonStates, setButtonStates] = useState(() => {
    const init = {};
    KNOWN_BUTTONS.forEach((b) => {
      init[b] = false;
    });
    return init;
  });

  // We'll store unknown buttons in a separate object, e.g. { Button15: true/false }
  const [unknownButtons, setUnknownButtons] = useState({});

  // Last action for debugging
  const [lastAction, setLastAction] = useState("");

  // Axes for left/right sticks + triggers
  const [axes, setAxes] = useState({
    leftX: 0,
    leftY: 0,
    rightX: 0,
    rightY: 0,
    leftTrigger: 0, // numeric 0..1
    rightTrigger: 0, // numeric 0..1
  });

  // Called whenever a button changes
  const handleButtonChange = (buttonName, pressed) => {
    // If it's one of our known buttons
    if (KNOWN_BUTTONS.includes(buttonName)) {
      setButtonStates((prev) => ({ ...prev, [buttonName]: pressed }));
      if (pressed) {
        setLastAction(`Pressed: ${buttonName}`);
      }
    } else {
      // It's an unknown button
      setUnknownButtons((prev) => ({ ...prev, [buttonName]: pressed }));
      if (pressed) {
        setLastAction(`Pressed unknown button: ${buttonName}`);
      }
    }
  };

  // Called whenever an axis moves
  const handleAxisChange = (axisName, value) => {
    setAxes((prev) => {
      const next = { ...prev };
      switch (axisName) {
        case "LeftStickX":
          next.leftX = value;
          setLastAction(`Moved LeftStickX -> ${value.toFixed(2)}`);
          break;
        case "LeftStickY":
          next.leftY = value;
          setLastAction(`Moved LeftStickY -> ${value.toFixed(2)}`);
          break;
        case "RightStickX":
          next.rightX = value;
          setLastAction(`Moved RightStickX -> ${value.toFixed(2)}`);
          break;
        case "RightStickY":
          next.rightY = value;
          setLastAction(`Moved RightStickY -> ${value.toFixed(2)}`);
          break;
        case "LT":
          next.leftTrigger = value;
          setLastAction(`Moved LT -> ${value.toFixed(2)}`);
          break;
        case "RT":
          next.rightTrigger = value;
          setLastAction(`Moved RT -> ${value.toFixed(2)}`);
          break;
        case "LeftTrigger":
          next.leftTrigger = value;
          setLastAction(`Moved LeftTrigger -> ${value.toFixed(2)}`);
          break;
        case "RightTrigger":
          next.rightTrigger = value;
          setLastAction(`Moved RightTrigger -> ${value.toFixed(2)}`);
          break;
        default:
          // For an unknown axis name, you could log it here
          setLastAction(`Moved unknown axis: ${axisName} = ${value.toFixed(2)}`);
          break;
      }
      return next;
    });
  };

  // Tailwind class for a known button block
  const btnClass = (name) =>
    `rounded-sm transition-colors duration-200 flex items-center justify-center
     text-xs font-semibold w-14 h-9
     ${buttonStates[name] ? "bg-green-600" : "bg-gray-700"}`;

  // Tailwind class for an unknown button block
  // We'll show them in a separate "Unknown Buttons" row
  const unknownBtnClass = (pressed) =>
    `rounded-sm transition-colors duration-200 flex items-center justify-center
     text-xs font-semibold w-14 h-9
     ${pressed ? "bg-orange-600" : "bg-gray-700"}`;

  return (
    <Gamepad onButtonChange={handleButtonChange} onAxisChange={handleAxisChange} gamepadIndex={0}>
      <div className="w-screen h-screen bg-gray-900 text-white flex flex-col items-center justify-center overflow-hidden">
        {/* Debug: Last Action */}
        {/* <div className="text-lg mb-3">{lastAction}</div> */}

        {/* Row 1: LT / RT triggers with fill bars + numeric display */}
        <div className="flex items-center justify-between w-10/12 mb-2">
          {/* LT */}
          <div className="flex flex-col items-center">
            <div className={`${btnClass("LT")} mb-1`}>LT</div>
            <div className="w-20 bg-gray-700 h-2 relative rounded-sm">
              <div
                className="absolute left-0 top-0 h-2 bg-green-600"
                style={{ width: `${(axes.leftTrigger * 100).toFixed(0)}%` }}
              />
            </div>
            <div className="text-sm mt-1">{Math.round(axes.leftTrigger * 100)}%</div>
          </div>

          {/* RT */}
          <div className="flex flex-col items-center">
            <div className={`${btnClass("RT")} mb-1`}>RT</div>
            <div className="w-20 bg-gray-700 h-2 relative rounded-sm">
              <div
                className="absolute left-0 top-0 h-2 bg-green-600"
                style={{ width: `${(axes.rightTrigger * 100).toFixed(0)}%` }}
              />
            </div>
            <div className="text-sm mt-1">{Math.round(axes.rightTrigger * 100)}%</div>
          </div>
        </div>

        {/* Row 2: LB / RB */}
        <div className="flex justify-between w-10/12 mb-2">
          <div className={btnClass("LB")}>LB</div>
          <div className={btnClass("RB")}>RB</div>
        </div>

        {/* Row 3: Left Stick, A/B/X/Y cluster, Right Stick */}
        <div className="flex justify-between w-10/12 mb-2 items-center">
          {/* Left Stick - circle */}
          <div className="relative w-28 h-28 bg-gray-700 rounded-full">
            <div
              className="absolute w-6 h-6 bg-green-500 rounded-full"
              style={{
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) translate(${axes.leftX * 20}px, ${axes.leftY * -20}px)`,
                transition: "transform 0.03s linear",
              }}
            />
          </div>

          {/* Face Buttons in a diamond layout: A, B, X, Y */}
          <div className="grid grid-cols-3 grid-rows-3 gap-1">
            <div />
            <div className={btnClass("Y")}>Y</div>
            <div />
            <div className={btnClass("X")}>X</div>
            <div />
            <div className={btnClass("B")}>B</div>
            <div />
            <div className={btnClass("A")}>A</div>
            <div />
          </div>

          {/* Right Stick */}
          <div className="relative w-28 h-28 bg-gray-700 rounded-full">
            <div
              className="absolute w-6 h-6 bg-blue-500 rounded-full"
              style={{
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) translate(${axes.rightX * 20}px, ${axes.rightY * -20}px)`,
                transition: "transform 0.03s linear",
              }}
            />
          </div>
        </div>

        {/* Row 4: Dpad, Start/Back/Home, LS/RS */}
        <div className="flex justify-between w-10/12 items-center">
          {/* D-Pad */}
          <div className="flex flex-col items-center space-y-1 mr-4">
            <div className={btnClass("DPadUp")}>Up</div>
            <div className="flex space-x-1">
              <div className={btnClass("DPadLeft")}>Left</div>
              <div className={btnClass("DPadRight")}>Right</div>
            </div>
            <div className={btnClass("DPadDown")}>Down</div>
          </div>

          <div className="flex space-x-2">
            <div className={btnClass("Back")}>Back</div>
            <div className={btnClass("Start")}>Start</div>
            {/* <div className={btnClass("Home")}>Home</div> */}
          </div>

          <div className="flex space-x-2">
            <div className={btnClass("LS")}>LS</div>
            <div className={btnClass("RS")}>RS</div>
          </div>
        </div>

        {/* Unknown Buttons */}
        {Object.keys(unknownButtons).length > 0 && (
          <div className="mt-6">
            <div className="mb-1 text-sm text-gray-400">Unknown Buttons:</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(unknownButtons).map(([name, pressed]) => (
                <div key={name} className={unknownBtnClass(pressed)}>
                  {name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Gamepad>
  );
}
