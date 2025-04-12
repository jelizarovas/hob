import React, { useState, useEffect, useRef } from "react";
import Gamepad from "react-gamepad";
import { FaCheck, FaMicrophone, FaPaperPlane } from "react-icons/fa";
import { onValue, push, remove, ref, serverTimestamp } from "firebase/database";
import { rtdb } from "../firebase";
import { useAuth } from "../auth/AuthProvider";

// Web Speech
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

// Buttons recognized by react-gamepad
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

const RIGHT_STICK_Y_DEADZONE = 0.15; // Ignore small movements near the center
const MESSAGE_SCROLL_SPEED = 15; // Adjust scroll sensitivity as needed

export default function ChatBox() {
  const { currentUser } = useAuth();

  // Basic user info
  const userId = currentUser?.uid || "anon";
  const displayName = currentUser?.displayName || "Anonymous User";
  const photoURL = currentUser?.photoURL || "";

  // Chat state
  const [messages, setMessages] = useState([]);
  const [interimText, setInterimText] = useState("");
  const messagesEndRef = useRef(null);

  // Text area content (typed + recognized text)
  const [inputText, setInputText] = useState("");
  // Is the mic actively recording?
  const [isRecording, setIsRecording] = useState(false);
  // If forcibly stop, skip trailing final results
  const [stopManually, setStopManually] = useState(false);
  // If auto-send is on, we send when we stop
  const [autoSendOnStop, setAutoSendOnStop] = useState(false);
  const [controllerConnected, setControllerConnected] = useState(false);

  // For ignoring repeated button events
  const [buttonStates, setButtonStates] = useState(() => {
    const init = {};
    KNOWN_BUTTONS.forEach((b) => {
      init[b] = false;
    });
    return init;
  });

  // The SpeechRecognition instance
  const recognitionRef = useRef(null);

  // For message selection/deletion
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  // For auto-grow text area
  const textAreaRef = useRef(null);

  const messagesContainerRef = useRef(null);

  const rightStickYRef = useRef(0);
  const scrollAnimationRef = useRef(null);

  const selectedMessageIdRef = useRef(selectedMessageId);

  // Add these refs inside the component function, near other refs
  const yPressTimeoutRef = useRef(null);
  const yPressStartTimeRef = useRef(null);
  const isHoldInitiatedRef = useRef(false); // Track if recording started via HOLD

  // Add this constant near the top
  const Y_HOLD_THRESHOLD = 220; // Milliseconds to distinguish tap vs hold

  useEffect(() => {
    selectedMessageIdRef.current = selectedMessageId;
  }, [selectedMessageId]);

  function handleMicPressStart() {
    console.log("Mic Press Start (Triggered)");
    yPressStartTimeRef.current = Date.now();
    isHoldInitiatedRef.current = false; // Reset hold flag on new press
    clearTimeout(yPressTimeoutRef.current); // Clear any lingering timeout

    yPressTimeoutRef.current = setTimeout(() => {
      // --- HOLD DETECTED ---
      // Check if recording isn't already on (using the ref for latest state)
      if (!isRecordingRef.current) {
        console.log("Mic Hold Detected - Starting Recording");
        isHoldInitiatedRef.current = true; // Mark as hold-initiated
        setIsRecording(true);
      } else {
        console.log("Mic Hold Detected - Already Recording");
      }
      yPressStartTimeRef.current = null; // Clear start time after detection
      // --- End Hold Detected ---
    }, Y_HOLD_THRESHOLD);
  }

  function handleMicPressEnd() {
    console.log("Mic Press End (Triggered)");
    // ALWAYS clear the timeout when the press ends (mouse button up / touch end)
    clearTimeout(yPressTimeoutRef.current);

    const pressStartTime = yPressStartTimeRef.current;
    yPressStartTimeRef.current = null; // Clear start time ref now

    // Check if pressStartTime exists and duration is less than threshold -> TAP
    if (pressStartTime && Date.now() - pressStartTime < Y_HOLD_THRESHOLD) {
      // --- TAP DETECTED ---
      console.log("Mic Tap Detected - Toggling Recording");
      setIsRecording((prev) => {
        const nextState = !prev;
        // Ensure hold flag is false if turning off via tap, or turning on via tap
        isHoldInitiatedRef.current = false;
        console.log("Mic Tap - Setting Recording to:", nextState);
        return nextState;
      });
      // --- End Tap Detected ---
    } else {
      // --- HOLD RELEASE DETECTED ---
      // If the release happens after the threshold, or if pressStartTime was null (meaning hold already detected by timeout)
      // Only stop recording if this specific hold *initiated* the recording
      if (isHoldInitiatedRef.current) {
        console.log("Mic Hold Released - Stopping Recording");
        setIsRecording(false);
        // Optional: Auto-send on hold release (matches Y button behavior)
        if (autoSendOnStop && inputText.trim()) {
          console.log("Mic Hold Released - Auto-sending...");
          handleSend();
        }
      } else {
        console.log(
          "Mic Hold Released - No stop action needed (was tap-initiated or already off)."
        );
      }
      // Always reset hold flag on release
      isHoldInitiatedRef.current = false;
      // --- End Hold Release Detected ---
    }
  }

  // Optional but recommended: Handle mouse leaving the button while pressed down
  function handleMicLeave() {
    // If mouse leaves while button is down, cancel the pending hold detection timer
    if (yPressStartTimeRef.current) {
      console.log("Mic Leave Detected - Cancelling potential hold timer");
      clearTimeout(yPressTimeoutRef.current);
      // Reset start time so releasing outside doesn't trigger tap logic incorrectly
      yPressStartTimeRef.current = null;
      // We don't stop recording here - user must release the button/touch
    }
  }

  // ──────────────────────────────────────────────────────────
  // 1) Load Messages from RTDB
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    const chatRef = ref(rtdb, "/chat/current");
    const unsubscribe = onValue(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() || {};
        const arr = Object.entries(data).map(([id, val]) => ({
          id,
          ...val,
        }));
        arr.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        setMessages(arr);
      } else {
        setMessages([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        150; // Allow some buffer
      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // Fallback if container ref not ready yet
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // Run when messages change

  // ──────────────────────────────────────────────────────────
  // 2) SpeechRecognition Setup
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    // Check for support ONCE
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported in this browser.");
      return;
    }

    // Create the instance ONCE
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    // Assign event listeners
    rec.onresult = (event) => {
      // Use ref or check state for stopManually
      if (stopManuallyRef.current) return;

      let currentInterim = "";
      let currentFinal = "";

      // Iterate through all results received in this event
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          // Accumulate final transcript parts for this event
          currentFinal += transcript;
        } else {
          // Accumulate the latest interim transcript for this event
          currentInterim += transcript;
        }
      }

      // --- *** MODIFICATION IS HERE *** ---
      // If we received final text in this event...
      if (currentFinal) {
        // Trim the newly finalized chunk
        const newFinalChunk = currentFinal.trim();

        // Update the main input text
        setInputText((prev) => {
          if (!newFinalChunk) return prev; // Do nothing if the new chunk is empty

          if (prev) {
            // If there's existing text, ADD A SPACE before the new chunk
            return prev + " " + newFinalChunk;
          } else {
            // If this is the first chunk, just use it directly
            return newFinalChunk;
          }
        });

        // Clear the interim display because we just got a final segment
        setInterimText("");
      }
      // Otherwise (if only interim results were received), update interim display
      else if (currentInterim) {
        // Update the interim text state
        setInterimText(currentInterim);
      }
      // --- *** END OF MODIFICATION *** ---
    };

    rec.onend = () => {
      // Use refs or check state directly for stopManually and isRecording
      // Reading state directly here *should* also be okay
      if (!stopManuallyRef.current && isRecordingRef.current) {
        // Example if using refs
        // Or just: if (!stopManually && isRecording) {
        console.log(
          "Speech recognition ended unexpectedly, attempting restart..."
        );
        try {
          // DO NOT call rec.start() directly here if startRecording handles it
          // This automatic restart might still be tricky.
          // Consider removing the automatic restart or making it more robust.
          // If you keep it, ensure it doesn't conflict with manual starts.
          // Maybe only restart if start() isn't already pending? Difficult to track.
          rec.start(); // Attempt restart on the *single* instance
        } catch (err) {
          console.warn("Speech restart error:", err);
          // Maybe set isRecording to false here if restart fails?
          // setIsRecording(false);
        }
      } else {
        console.log("Speech recognition ended.");
      }
    };

    rec.onerror = (event) => {
      console.error("Speech recognition error:", event.error, event.message);

      // --- Capture final interim text on error ---
      const lastInterimTextOnError = interimText.trim(); // Read state
      if (lastInterimTextOnError) {
        console.log(
          "Appending final interim text on error:",
          lastInterimTextOnError
        );
        // Use functional update to append safely
        setInputText((prevInputText) => {
          return prevInputText
            ? prevInputText + " " + lastInterimTextOnError
            : lastInterimTextOnError;
        });
      }
      // --- End capture ---

      // Stop recording UI state on error
      setIsRecording(false);
      setStopManually(true); // Ensure stop state is set
      stopManuallyRef.current = true; // Update ref too
      setInterimText(""); // Clear interim text state AFTER potentially capturing it
    };

    // Store the single instance in the ref
    recognitionRef.current = rec;

    // Cleanup function: stop the single instance when component unmounts
    return () => {
      if (recognitionRef.current) {
        console.log("ChatBox unmounting, stopping recognition.");
        // Remove listeners maybe? Not strictly necessary if instance is discarded
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      }
    };
  }, []); // <--- Run only ONCE on mount

  // You might need refs for stopManually and isRecording if accessing them in callbacks
  // To ensure the callbacks always get the latest value without dependencies
  const stopManuallyRef = useRef(stopManually);
  const isRecordingRef = useRef(isRecording);
  useEffect(() => {
    stopManuallyRef.current = stopManually;
    isRecordingRef.current = isRecording;
  }, [stopManually, isRecording]);

  // ──────────────────────────────────────────────────────────
  // 3) Start/Stop Recording (Adjusted slightly)
  // ──────────────────────────────────────────────────────────
  function startRecording() {
    if (!recognitionRef.current) {
      console.warn("startRecording: No recognition instance.");
      return;
    }
    // Make sure we're not already trying to start or are started
    // The API might throw an error if start() is called when already started.
    // The 'onerror' handler should catch this and reset state.
    console.log("Attempting to start recognition...");
    setStopManually(false); // Reset manual stop flag
    stopManuallyRef.current = false; // Update ref if using it
    setInterimText("");
    try {
      // Potentially stop just before starting, though this might cause issues too.
      // recognitionRef.current.stop();
      recognitionRef.current.start();
      console.log("Recognition started.");
    } catch (err) {
      console.error("Error calling recognition.start():", err);
      setIsRecording(false); // Failed to start, update state
      setStopManually(true); // Set stop state on failure
      stopManuallyRef.current = true;
    }
  }

  function stopRecording(manual = true) {
    // Assume manual=true if called by user action/toggle effect
    if (!recognitionRef.current) {
      console.log("stopRecording called but recognitionRef is not set.");
      return;
    }
    console.log(`Stopping recognition (initiated manually: ${manual})...`);

    // Set flags first to prevent potential race conditions with async events
    if (manual) {
      setStopManually(true);
      stopManuallyRef.current = true;
    }

    // --- Capture final interim text value BEFORE stopping API ---
    // Read the current value directly from state right before stopping
    const lastInterimText = interimText.trim();

    // --- Attempt to stop the Speech Recognition API ---
    try {
      // Calling stop() might trigger a final 'onresult' event sometimes,
      // but stopManuallyRef should prevent it from being processed by our handler.
      recognitionRef.current.stop();
      console.log("Recognition stopped via API call.");
    } catch (err) {
      // Log error but proceed to process captured text and clear state
      console.error("Error calling recognition.stop():", err);
    }

    // --- AFTER stopping API attempt, process the captured interim text ---
    if (lastInterimText) {
      console.log("Appending final interim text on stop:", lastInterimText);
      // Use functional update to append safely to previous inputText
      setInputText((prevInputText) => {
        // Append with space if needed, same logic as onresult
        return prevInputText
          ? prevInputText + " " + lastInterimText
          : lastInterimText;
      });
    }

    // --- ALWAYS clear the interim text state AFTER stopping and processing ---
    setInterimText("");

    // Note: Auto-send logic is handled in button release handlers now.
  }

  // This effect now just calls the functions
  useEffect(() => {
    // No longer creates instances, just manages the single one
    if (isRecording) {
      startRecording();
    } else {
      // Ensure we distinguish between manual stop via button
      // and potential automatic stop from onend/onerror
      // The stopRecording function now handles the stopManually flag
      if (recognitionRef.current) {
        // && internal state check maybe? API has no easy way
        stopRecording(true); // Assume state change implies manual stop intent
      }
    }
  }, [isRecording]); // Dependency is fine here

  // ----- Rest of your component -----

  // ──────────────────────────────────────────────────────────
  // 4) Send / Delete
  // ──────────────────────────────────────────────────────────
  function sendMessage(text) {
    if (!text.trim()) return;
    push(ref(rtdb, "/chat/current"), {
      text: text.trim(),
      userId,
      displayName,
      photoURL,
      timestamp: serverTimestamp(),
    });
    // Maybe scroll to bottom after sending
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  }

  function handleSend() {
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText("");
    setInterimText("");
    // Reset text area
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
    }
  }

  function handleMessageClick(msg) {
    if (msg.userId !== userId) return; // Can only select/delete own messages
    if (selectedMessageId === msg.id) {
      console.log("Deleting message:", msg.id);
      remove(ref(rtdb, `/chat/current/${msg.id}`));
      setSelectedMessageId(null);
    } else {
      console.log("Selecting message:", msg.id);
      setSelectedMessageId(msg.id);
    }
  }
  // ──────────────────────────────────────────────────────────
  // 5) Gamepad
  // ──────────────────────────────────────────────────────────
  const dpadUpIntervalRef = useRef(null);
  const dpadDownIntervalRef = useRef(null);
  const DPAD_REPEAT_DELAY = 150; // Milliseconds between repeats, adjust as needed

  // Revised navigateMessages function (removed setMessages wrapper)
  // Place this corrected function definition where your navigateMessages function currently is

  function navigateMessages(direction) {
    // Access the 'messages' state directly here.
    // NOTE: If the messages array itself updates extremely rapidly *while*
    // the DPad is held, this 'messages' variable *could* become stale.
    // But let's fix the selection logic first, as this is less common.
    const myMessages = messages.filter((m) => m.userId === userId);
    if (!myMessages.length) return; // Exit if no messages to navigate

    // --- Correction 1: Read the LATEST selected ID from the Ref ---
    let currentIndex = myMessages.findIndex(
      (m) => m.id === selectedMessageIdRef.current // Use the ref here
    );
    // --- End Correction 1 ---

    let nextIndex = currentIndex; // Initialize nextIndex

    // Calculate the next index based on direction
    if (direction === "up") {
      nextIndex = currentIndex <= 0 ? myMessages.length - 1 : currentIndex - 1; // Wraps around
    } else {
      // 'down'
      nextIndex =
        currentIndex === -1 || currentIndex >= myMessages.length - 1
          ? 0
          : currentIndex + 1; // Wraps around
    }

    // Ensure the calculated index is valid
    if (nextIndex >= 0 && nextIndex < myMessages.length) {
      const nextSelectedId = myMessages[nextIndex].id;

      // --- Correction 2: Directly update the selected message ID state (No setMessages wrapper) ---
      setSelectedMessageId(nextSelectedId);
      // --- End Correction 2 ---

      console.log(`DPad ${direction} - Selecting message:`, nextSelectedId);

      // Scroll the newly selected element into view
      const selectedElement = document.getElementById(
        `message-${nextSelectedId}`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      } else {
        console.warn(
          `Element with id message-${nextSelectedId} not found for scrolling.`
        );
      }
    } else {
      console.log(
        `DPad ${direction} - Calculated invalid nextIndex: ${nextIndex}`
      );
    }
  }

  // Replace the ENTIRE handleButtonChange function with this one:
  function handleButtonChange(buttonName, pressed) {
    if (!buttonName || !KNOWN_BUTTONS.includes(buttonName)) return;
    // We only prevent repeats for NON-'Y' buttons now,
    // as Y release needs to be processed even if state didn't change during hold.
    if (buttonName !== "Y" && buttonStates[buttonName] === pressed) return;

    console.log(`Button: ${buttonName}, Pressed: ${pressed}`); // Keep log
    // Update button state tracker
    setButtonStates((prev) => ({ ...prev, [buttonName]: pressed }));

    // --- NEW Y Button Logic (Tap Toggle / Hold Record) ---
    if (buttonName === "Y") {
      if (pressed) {
        handleMicPressStart(); // Call shared press handler
      } else {
        handleMicPressEnd(); // Call shared release handler
      }
    }
    // --- End Y Button Logic ---

    // --- DPad Logic (Hold to Repeat - Uses separate interval refs) ---
    else if (buttonName === "DPadUp") {
      if (pressed) {
        clearInterval(dpadUpIntervalRef.current);
        navigateMessages("up");
        dpadUpIntervalRef.current = setInterval(
          () => navigateMessages("up"),
          DPAD_REPEAT_DELAY
        );
      } else {
        clearInterval(dpadUpIntervalRef.current);
        dpadUpIntervalRef.current = null;
      }
    } else if (buttonName === "DPadDown") {
      if (pressed) {
        clearInterval(dpadDownIntervalRef.current);
        navigateMessages("down");
        dpadDownIntervalRef.current = setInterval(
          () => navigateMessages("down"),
          DPAD_REPEAT_DELAY
        );
      } else {
        clearInterval(dpadDownIntervalRef.current);
        dpadDownIntervalRef.current = null;
      }
    }
    // --- End DPad ---

    // --- Other Buttons (Single press actions) ---
    else if (pressed) {
      // Handle other buttons only on the initial press
      if (buttonName === "X") {
        setAutoSendOnStop((prev) => {
          const newState = !prev;
          console.log("X Pressed - Toggled AutoSend to:", newState);
          return newState;
        });
      } else if (buttonName === "A") {
        console.log("A Pressed - Sending Message");
        handleSend();
      } else if (buttonName === "B") {
        console.log("B Pressed - Clearing Input");
        setInputText("");
        setInterimText("");
        if (textAreaRef.current) {
          textAreaRef.current.style.height = "auto";
        }
      } else if (buttonName === "Back" && selectedMessageId) {
        const msgToDelete = messages.find((m) => m.id === selectedMessageId);
        if (msgToDelete && msgToDelete.userId === userId) {
          console.log(
            "Back Button - Deleting selected message:",
            selectedMessageId
          );
          remove(ref(rtdb, `/chat/current/${selectedMessageId}`));
          setSelectedMessageId(null); // Deselect
        }
      }
    }
    // --- End Other Buttons ---
  }

  // Add useEffect for DPad interval cleanup (runs once on mount)
  useEffect(() => {
    // Clear intervals on unmount
    return () => {
      clearInterval(dpadUpIntervalRef.current);
      clearInterval(dpadDownIntervalRef.current);
    };
  }, []);

  function handleAxisChange(axisName, value, previousValue) {
    // Store the latest stick value when it changes
    if (axisName === "RightStickY") {
      rightStickYRef.current = value;
    }
    // Optional: Log other axes for debugging
    // console.log(`Axis: ${axisName}, Value: ${value.toFixed(2)}`);
  }

  useEffect(() => {
    const container = messagesContainerRef.current;
    // Ensure the container ref is set before starting the loop
    if (!container) {
      console.warn("Messages container ref not available for scroll loop.");
      return;
    }

    let animationFrameId = null;

    const scrollLoop = () => {
      const stickValue = rightStickYRef.current; // Get current value

      // Check deadzone
      if (Math.abs(stickValue) > RIGHT_STICK_Y_DEADZONE) {
        // Calculate scroll amount - INVERTED by subtracting
        const scrollAmount = stickValue * MESSAGE_SCROLL_SPEED;
        container.scrollTop -= scrollAmount; // Subtract to invert direction
      }

      // Request the next frame to continue the loop
      animationFrameId = requestAnimationFrame(scrollLoop);
    };

    // Start the animation loop
    console.log("Starting scroll loop");
    animationFrameId = requestAnimationFrame(scrollLoop);

    // Cleanup function to stop the loop when the component unmounts
    return () => {
      if (animationFrameId) {
        console.log("Stopping scroll loop");
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  // ──────────────────────────────────────────────────────────
  // 6) Auto-Grow Textarea
  // ──────────────────────────────────────────────────────────
  function autoGrow(e) {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }

  // If input changes (like from voice), autoGrow
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height =
        textAreaRef.current.scrollHeight + "px";
    }
  }, [inputText]);

  // ──────────────────────────────────────────────────────────
  // 7) Helpers
  // ──────────────────────────────────────────────────────────
  function getInitials(name) {
    const parts = name.split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("");
  }

  function formatTime(ts) {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function isMine(uid) {
    return uid === userId;
  }

  // Basic pre-wrap for multi-line
  const bubbleTextClass = "text-sm whitespace-pre-wrap break-words"; // Added break-words

  // ──────────────────────────────────────────────────────────
  // 8) Render
  // ──────────────────────────────────────────────────────────
  return (
    <Gamepad
      onConnect={() => setControllerConnected(true)}
      onDisconnect={() => setControllerConnected(false)}
      onButtonChange={handleButtonChange}
      onAxisChange={handleAxisChange}
      gamepadIndex={0}
    >
      <div className="flex h-screen  bg-gray-900 text-white container mx-auto max-w-xl">
        <div className="flex flex-col w-full py-2 ">
          {/* Top row: show isRecording & autoSend */}
          {false && <div className="mb-2 flex items-center justify-between text-sm">
            <div>
              Mic (Y): {/* Added button indicator */}
              <span
                className={`ml-1 font-bold ${
                  isRecording ? "text-green-400 animate-pulse" : "text-red-400" // Pulse when recording
                }`}
              >
                {isRecording ? "Listening..." : "Off"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setAutoSendOnStop((prev) => !prev);
                }}
                className={` flex space-x-2 items-center
                px-3 py-1 rounded text-xs font-bold 
                transition-all duration-300 
                focus:outline-none focus:ring-2 focus:ring-offset-2 
                active:scale-95
                ${
                  autoSendOnStop
                    ? // If ON, show green background
                      "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                    : // If OFF, show gray background
                      "bg-gray-600 text-white hover:bg-gray-500 focus:ring-gray-500"
                }
              `}
              >
                {controllerConnected ? (
                  <span className="bg-black flex items-center justify-center leading-none font-mono rounded-full w-4 h-4 text-xs px-1 py-0  ">
                    x
                  </span>
                ) : (
                  ""
                )}
                <span>Auto Send </span>

                {autoSendOnStop ? <FaCheck /> : ""}
              </button>
            </div>
          </div>}
          {/* Messages */}
          <div
            ref={messagesContainerRef}
            id="message-list-container"
            className="flex-1 overflow-y-auto mb-1"
          >
            {messages.map((msg) => {
              const mine = isMine(msg.userId);
              const selected = msg.id === selectedMessageId;
              const initials = getInitials(msg.displayName || "??");
              return (
                <div
                  key={msg.id}
                  id={`message-${msg.id}`} // Add ID to each message row for potential scrolling target
                  className={`flex items-start my-1 ${
                    mine ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Avatar left if not mine */}
                  {!mine && (
                    <div className="mr-2 flex-shrink-0 w-8 h-8">
                      {msg.photoURL ? (
                        <img
                          src={msg.photoURL}
                          alt={msg.displayName}
                          title={msg.displayName}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-sm"
                          title={msg.displayName}
                        >
                          {initials}
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    onClick={() => {
                      if (mine) {
                        if (selectedMessageId === msg.id) {
                          remove(ref(rtdb, `/chat/current/${msg.id}`));
                          setSelectedMessageId(null);
                        } else {
                          setSelectedMessageId(msg.id);
                        }
                      }
                    }}
                    className={`
                      p-2 rounded-lg max-w-xl cursor-pointer
                      ${mine ? "bg-blue-600" : "bg-gray-700"}
                      ${selected ? "bg-red-700" : ""}
                    `}
                  >
                    <div className={bubbleTextClass}>{msg.text}</div>
                    <div className="text-right text-xs text-gray-300 mt-1">
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>

                  {/* Avatar right if mine */}
                  {mine && (
                    <div className="ml-2 flex-shrink-0 w-8 h-8">
                      {photoURL ? (
                        <img
                          src={photoURL}
                          alt={displayName}
                          title={displayName}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-sm"
                          title={displayName}
                        >
                          {initials}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          {/* Input Row Container - Needs to allow for the relative/absolute positioning */}
          <div className="flex items-end space-x-2 w-full px-2">
            {/* Mic button */}
            <button
              onMouseDown={handleMicPressStart}
              onMouseUp={handleMicPressEnd}
              onMouseLeave={handleMicLeave} // Cancel hold if mouse leaves
              onTouchStart={(e) => {
                e.preventDefault();
                handleMicPressStart();
              }}
              onTouchEnd={handleMicPressEnd}
              onTouchCancel={handleMicPressEnd}
              title="Toggle/Hold Recording (Y)"
              className={`
        relative p-2 rounded-full self-end mb-1 transition-all duration-150 active:scale-95
        ${
          isRecording
            ? "bg-red-600 hover:bg-red-700 animate-pulse"
            : "bg-gray-600 hover:bg-gray-700"
        }
      `}
            >
              <FaMicrophone />
              {controllerConnected && (
                <span className="absolute top-0 right-0 translate-x-1 -translate-y-1 bg-yellow-400 text-black text-xs w-4 h-4 flex items-center justify-center rounded-full border border-black">
                  Y
                </span>
              )}
            </button>

            {/* --- Relative Container for Textarea and Overlay --- */}
            {/* This container establishes the positioning context for the absolute overlay */}
            <div className="relative flex-1">
              {/* --- The Actual Textarea --- */}
              {/* It only contains the 'final' inputText */}
              {/* Be specific and consistent with text/font/padding styles */}
              <textarea
                ref={textAreaRef}
                rows={1}
                className="block w-full px-3 py-2 bg-gray-800 rounded focus:outline-none resize-none overflow-auto max-h-64 align-top font-sans text-base leading-normal" // Example: Define styles clearly
                placeholder={!interimText && "Type or Hold Mic [Y]"}
                value={inputText} // <--- VALUE IS ONLY inputText
                onChange={(e) => {
                  setInputText(e.target.value);
                  setInterimText("");
                }}
                onInput={autoGrow}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              {/* --- End of Textarea --- */}

              {/* --- The Absolute Overlay Div --- */}
              {/* Renders ONLY when interimText exists */}
              {/* Sits on top of the textarea */}
              {interimText && (
                <div
                  // Positioning: Absolute, covering the parent relative container.
                  // Styling: MUST exactly match textarea's internal text area styles.
                  // Interaction: pointer-events-none lets clicks pass through.
                  // Text Handling: Match textarea's wrapping behavior.
                  className="absolute inset-0 px-3 py-2 overflow-hidden pointer-events-none whitespace-pre-wrap break-words align-top font-sans text-base leading-normal" // <-- !!! These classes MUST meticulously match the textarea's font, size, padding, line-height, etc. !!!
                  aria-hidden="true" // Hide from screen readers as it duplicates textarea visually
                >
                  {/* Invisible inputText - renders transparently but takes up space */}
                  <span style={{ color: "transparent" }}>{inputText}</span>

                  {/* Visible, styled interimText - appended after the invisible text */}
                  {/* Apply your desired styling here */}
                  <span className="text-gray-400 opacity-75 animate-pulse">
                    {interimText}
                  </span>
                </div>
              )}
              {/* --- End of Overlay Div --- */}
            </div>
            {/* --- End of Relative Container --- */}

            {/* Send button */}
            <button
              onClick={handleSend}
              // Align button with bottom of input area
              className="p-2 bg-blue-600 rounded-full flex items-center justify-center self-end mb-1"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </Gamepad>
  );
}
