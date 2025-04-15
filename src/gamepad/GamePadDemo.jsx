import React from "react";
import { useGamepad, KNOWN_BUTTONS } from "./gamepadStore";

export default function GamePadDemo() {
  const { gamepad } = useGamepad();

  // Unknown buttons: those not in our KNOWN_BUTTONS list.
  const unknownButtons =
    gamepad.buttons &&
    Object.keys(gamepad.buttons).filter((btn) => !KNOWN_BUTTONS.includes(btn));

  // Helper for known button styling.
  const btnClass = (btnName) => {
    const state = gamepad.buttons && gamepad.buttons[btnName];
    // If nothing is pressed, bg-gray-700 might blend into the background (bg-gray-900).
    // You can adjust these colors or add borders to ensure visibility.
    return `rounded-sm transition-colors duration-200 flex items-center justify-center text-xs font-semibold w-14 h-9 ${
      state && state.pressed ? "bg-green-600" : "bg-gray-700"
    }`;
  };

  // Helper for unknown button styling.
  const unknownBtnClass = (pressed) =>
    `rounded-sm transition-colors duration-200 flex items-center justify-center text-xs font-semibold w-14 h-9 ${
      pressed ? "bg-orange-600" : "bg-gray-700"
    }`;

  return (
    <div className="py-20 bg-gray-900 text-white flex flex-col items-center justify-center overflow-hidden">
      <div className="text-lg mb-3">
        Gamepad is {gamepad.connected ? "Connected" : "Disconnected"}
      </div>

      {/* Row for triggers */}
      <div className="flex items-center justify-between w-10/12 mb-2">
        {/* Left Trigger */}
        <div className="flex flex-col items-center">
          <div className={`${btnClass("LT")} mb-1`}>LT</div>
          <div className="w-20 bg-gray-700 h-2 relative rounded-sm">
            <div
              className="absolute left-0 top-0 h-2 bg-green-600"
              style={{
                width: `${
                  gamepad.axes && gamepad.axes["LeftTrigger"]
                    ? (gamepad.axes["LeftTrigger"] * 100).toFixed(0)
                    : 0
                }%`,
              }}
            />
          </div>
          <div className="text-sm mt-1">
            {gamepad.axes && gamepad.axes["LeftTrigger"]
              ? Math.round(gamepad.axes["LeftTrigger"] * 100)
              : 0}
            %
          </div>
        </div>

        {/* Right Trigger */}
        <div className="flex flex-col items-center">
          <div className={`${btnClass("RT")} mb-1`}>RT</div>
          <div className="w-20 bg-gray-700 h-2 relative rounded-sm">
            <div
              className="absolute left-0 top-0 h-2 bg-green-600"
              style={{
                width: `${
                  gamepad.axes && gamepad.axes["RightTrigger"]
                    ? (gamepad.axes["RightTrigger"] * 100).toFixed(0)
                    : 0
                }%`,
              }}
            />
          </div>
          <div className="text-sm mt-1">
            {gamepad.axes && gamepad.axes["RightTrigger"]
              ? Math.round(gamepad.axes["RightTrigger"] * 100)
              : 0}
            %
          </div>
        </div>
      </div>

      {/* Row for LB and RB */}
      <div className="flex justify-between w-10/12 mb-2">
        <div className={btnClass("LB")}>LB</div>
        <div className={btnClass("RB")}>RB</div>
      </div>

      {/* Row with Left Stick, Face Buttons, and Right Stick */}
      <div className="flex justify-between w-10/12 mb-2 items-center">
        {/* Left Stick */}
        <div className="relative w-28 h-28 bg-gray-700 rounded-full">
          <div
            className="absolute w-6 h-6 bg-green-500 rounded-full"
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) translate(${
                (gamepad?.axes?.["LeftStickX"] ?? 0) * 40
              }px, ${(gamepad?.axes?.["LeftStickY"] ?? 0) * -40}px)`,
              transition: "transform 0.03s linear",
            }}
          />
        </div>

        {/* Face Buttons arranged in a diamond */}
        <div className="grid grid-cols-3 grid-rows-3 gap-1">
          <div />
          <div className={btnClass("Y")}>
            Y {gamepad.buttons.Y.hold && "hold"}
          </div>
          <div />
          <div className={btnClass("X")}>
            X {gamepad.buttons.X.hold && "hold"}
          </div>
          <div />
          <div className={btnClass("B")}>
            B {gamepad.buttons.B.hold && "hold"}
          </div>
          <div />
          <div className={btnClass("A")}>
            A {gamepad.buttons.A.hold && "hold"}
          </div>
          <div />
        </div>

        {/* Right Stick */}
        <div className="relative w-28 h-28 bg-gray-700 rounded-full">
          <div
            className="absolute w-6 h-6 bg-blue-500 rounded-full"
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) translate(${
                gamepad.axes && gamepad.axes["RightStickX"]
                  ? gamepad.axes["RightStickX"] * 40
                  : 0
              }px, ${
                gamepad.axes && gamepad.axes["RightStickY"]
                  ? gamepad.axes["RightStickY"] * -40
                  : 0
              }px)`,

              transition: "transform 0.03s linear",
            }}
          />
        </div>
      </div>

      {/* Row with D-Pad, Start/Back, LS/RS */}
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
        </div>

        <div className="flex space-x-2">
          <div className={btnClass("LS")}>LS</div>
          <div className={btnClass("RS")}>RS</div>
        </div>
      </div>

      {/* Unknown Buttons */}
      {unknownButtons && unknownButtons.length > 0 && (
        <div className="mt-6">
          <div className="mb-1 text-sm text-gray-400">Unknown Buttons:</div>
          <div className="flex flex-wrap gap-2">
            {unknownButtons.map((btn) => (
              <div
                key={btn}
                className={unknownBtnClass(gamepad.buttons[btn].pressed)}
              >
                {btn}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* <div>
        {JSON.stringify(gamepad, 2, null)}
      </div> */}
    </div>
  );
}
