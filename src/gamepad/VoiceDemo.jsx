import React, { useState, useEffect, useRef, useCallback } from "react";
import Gamepad from "react-gamepad";

/**
 * Known buttons on a typical controller.
 * We'll ignore events for unknown (null) or unmapped button names.
 */
const KNOWN_BUTTONS = [
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

/**
 * Attempt to use built-in webkitSpeechRecognition if available.
 * There's no official way to specify a deviceId for this approach.
 */
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

/**
 * A full VoiceDemo component that:
 * 1) Enumerates audio input devices upon LB press,
 * 2) Toggles recording with A (start/stop),
 * 3) Push-to-talk with Y (hold to record),
 * 4) Displays partial transcripts + final chat bubbles.
 */
export default function VoiceDemo() {
  // Keep track of pressed states for known buttons.
  const [buttonStates, setButtonStates] = useState(() => {
    const init = {};
    KNOWN_BUTTONS.forEach((btn) => (init[btn] = false));
    return init;
  });

  // For minimal "device selection" UI
  const [devices, setDevices] = useState([]); // list of audio input devices
  const [showDeviceList, setShowDeviceList] = useState(false);
  const [deviceIndex, setDeviceIndex] = useState(0); // which device is highlighted
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  // Are we actively recording (from toggling with A or push-to-talk on Y)?
  const [isRecording, setIsRecording] = useState(false);

  // Are we holding the Y button for push-to-talk?
  const [isHoldingY, setIsHoldingY] = useState(false);

  // Chat messages (final transcripts)
  const [messages, setMessages] = useState([]);

  // We'll keep separate final vs. interim transcripts to avoid duplication
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");

  // Keep a reference to the speech recognition instance
  const recognitionRef = useRef(null);

  // --- 1) SET UP SPEECH RECOGNITION ---
  useEffect(() => {
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported on this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // On each result, separate final vs interim text
    recognition.onresult = (e) => {
      let newFinal = "";
      let newInterim = "";

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) {
          newFinal += res[0].transcript;
        } else {
          newInterim += res[0].transcript;
        }
      }
      // Append any final text to our finalTranscript
      if (newFinal) {
        setFinalTranscript((prev) => prev + newFinal);
      }
      // Replace the interim transcript
      setInterimTranscript(newInterim);
    };

    // If recognition ends but we are still "recording", attempt to restart
    recognition.onend = () => {
      if (isRecording || isHoldingY) {
        try {
          recognition.start();
        } catch (err) {
          console.warn("Speech restart error:", err);
        }
      }
    };

    recognitionRef.current = recognition;
  }, [isRecording, isHoldingY]);

  // Cleanup if unmounted
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // --- 2) GET AUDIO DEVICES (for user reference only) ---
  const fetchDevices = async () => {
    try {
      const devs = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devs.filter((d) => d.kind === "audioinput");
      setDevices(audioInputs);
    } catch (err) {
      console.error("Failed to enumerate devices", err);
    }
  };

  // --- 3) START RECORDING ---
  const startRecording = () => {
    if (!recognitionRef.current || !SpeechRecognition) return;
    recognitionRef.current.stop(); // ensure a clean start
    setFinalTranscript("");
    setInterimTranscript("");
    recognitionRef.current.start();
  };

  // --- 4) STOP RECORDING + SAVE FINAL TEXT ---
  const stopRecording = () => {
    if (!recognitionRef.current || !SpeechRecognition) return;
    recognitionRef.current.stop();

    const fullText = (finalTranscript + interimTranscript).trim();
    if (fullText) {
      setMessages((prev) => [...prev, fullText]);
    }
    setFinalTranscript("");
    setInterimTranscript("");
  };

  // --- 5) HANDLE BUTTON CHANGES ---
  const handleButtonChange = useCallback((buttonName, pressed) => {
    // 1) Ignore null/empty button names
    if (!buttonName) {
      return;
    }
    // 2) If not known, skip (or log once if you like)
    if (!KNOWN_BUTTONS.includes(buttonName)) {
      return;
    }
    // 3) If the pressed state hasn't changed, skip
    if (buttonStates[buttonName] === pressed) {
      return;
    }

    // Update pressed state
    setButtonStates((prev) => ({ ...prev, [buttonName]: pressed }));

    // LB => show/hide device list (and fetch if pressed)
    if (buttonName === "LB" && pressed) {
      // Toggle device list UI
      setShowDeviceList((prev) => !prev);
      fetchDevices();
    }

    // A => toggle record on single press
    if (buttonName === "A" && pressed) {
      // If not recording, start
      if (!isRecording) {
        setIsRecording(true);
        startRecording();
      } else {
        // If we ARE recording, stop
        setIsRecording(false);
        stopRecording();
      }
    }

    // B => if pressed, do nothing special here. (You could map B to something else.)

    // Y => push-to-talk (hold)
    if (buttonName === "Y") {
      if (pressed) {
        // Just pressed Y
        setIsHoldingY(true);
        if (!isRecording) {
          setIsRecording(true);
          startRecording();
        }
      } else {
        // Y released
        setIsHoldingY(false);
        if (isRecording) {
          setIsRecording(false);
          stopRecording();
        }
      }
    }
  }, []);

  // --- 6) HANDLE DPAD FOR DEVICE LIST NAV ---
  // If the device list is shown, up/down changes deviceIndex. Press A to confirm selection
  const handleAxisChange = useCallback((axisName, value) => {
    // We'll treat DPadUp/DPadDown as button events, but some controllers treat them as axes.
    // For demonstration, let’s say if axisName is "LeftStickY", negative => up, positive => down
    // We skip if not showing the device list
    if (!showDeviceList) return;

    // Quick threshold
    if (axisName === "LeftStickY") {
      if (value < -0.5) {
        // up
        setDeviceIndex((prev) => Math.max(0, prev - 1));
      } else if (value > 0.5) {
        // down
        setDeviceIndex((prev) => Math.min(devices.length - 1, prev + 1));
      }
    }
  }, []);

  // If the user wants to confirm device selection with A while in device list mode,
  // we've already used A for toggling recording. In real usage, you'd create a separate mode
  // or "click" event. For example, if you want LB to open the device list,
  // then DPad + A to select, you might need a separate "device select mode."
  // For brevity, let's assume you do it with the UI or some other approach.

  // If the user picks a device from the list, we store deviceId in state
  const selectCurrentDevice = () => {
    if (!devices.length) return;
    const dev = devices[deviceIndex];
    setSelectedDeviceId(dev.deviceId);
  };

  // Possibly call `selectCurrentDevice` if they press X or something.

  return (
    <Gamepad
      onButtonChange={handleButtonChange}
      onAxisChange={handleAxisChange}
      gamepadIndex={0}
    >
      <div className="h-screen w-screen bg-gray-900 text-white p-4 flex flex-col">
        {/* Title / instructions */}
        <div className="mb-2 text-center">
          <h1 className="text-xl font-bold">
            Voice Demo (Toggle, Push-to-Talk, Device List)
          </h1>
          <p className="text-sm text-gray-400">
            Press LB to show/hide device list. Press A to toggle record. Hold Y
            to push-to-talk.
          </p>
        </div>

        {/* Microphone selection UI (just a list) */}
        {showDeviceList && (
          <div className="border border-gray-600 p-2 mb-4 max-w-md mx-auto">
            <h2 className="font-semibold mb-2">Select Audio Device</h2>
            {devices.length === 0 && (
              <p className="text-gray-400">No audio inputs found</p>
            )}
            {devices.map((d, i) => (
              <div
                key={d.deviceId}
                className={`
                  px-2 py-1 rounded cursor-pointer 
                  ${i === deviceIndex ? "bg-green-600" : "bg-gray-700"}
                  mb-1
                `}
              >
                {d.label || `Device ${i + 1}`}
              </div>
            ))}
            <p className="text-sm text-gray-400 mt-2">
              Currently selected: {selectedDeviceId || "Default"}
            </p>
            <p className="text-xs text-gray-500">
              (Note: Web Speech API always uses system/chrome default mic.)
            </p>
          </div>
        )}

        {/* "Recording" indicator */}
        <div className="flex justify-center items-center mb-4">
          {isRecording || isHoldingY ? (
            <div className="w-8 h-8 bg-red-600 rounded-full animate-pulse" />
          ) : (
            <div className="w-8 h-8 bg-gray-600 rounded-full" />
          )}
        </div>

        {/* Chat area */}
        <div className="flex-1 max-w-lg mx-auto flex flex-col justify-end space-y-2 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className="flex justify-start">
              <div className="bg-green-600 text-white px-3 py-2 rounded-xl mb-1 max-w-sm">
                {msg}
              </div>
            </div>
          ))}

          {/* Show partial text while speaking */}
          {(isRecording || isHoldingY) &&
            (finalTranscript || interimTranscript) && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-white px-3 py-2 rounded-xl mb-1 max-w-sm animate-pulse">
                  {finalTranscript}
                  <span className="text-gray-300">{interimTranscript}</span>
                </div>
              </div>
            )}
        </div>
      </div>
    </Gamepad>
  );
}
