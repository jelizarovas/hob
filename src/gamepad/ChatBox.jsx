import React, { useState, useEffect, useRef } from "react";
import Gamepad from "react-gamepad";
import { FaCheck, FaMicrophone, FaPaperPlane, FaSpinner } from "react-icons/fa";
import { onValue, push, remove, ref, serverTimestamp } from "firebase/database";
import { rtdb } from "../firebase";
import { useAuth } from "../auth/AuthProvider";
import { isMobile, isIOS } from "react-device-detect";
import { useGamepad } from "./gamepadStore";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

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

const RIGHT_STICK_Y_DEADZONE = 0.15;
const MESSAGE_SCROLL_SPEED = 15;
const Y_HOLD_THRESHOLD = 220;

export default function ChatBox() {
  const { currentUser } = useAuth();

  const { gamepad } = useGamepad();

  // Basic user info
  const userId = currentUser?.uid || "anon";
  const displayName = currentUser?.displayName || "Anonymous User";
  const photoURL = currentUser?.photoURL || "";

  // Chat state
  const [messages, setMessages] = useState([]);

  const [inputText, setInputText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [stopManually, setStopManually] = useState(false);
  const [autoSendOnStop, setAutoSendOnStop] = useState(false);
  const [controllerConnected, setControllerConnected] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const textAreaRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const rightStickYRef = useRef(0);
  const selectedMessageIdRef = useRef(selectedMessageId);
  const yPressTimeoutRef = useRef(null);
  const yPressStartTimeRef = useRef(null);
  const isHoldInitiatedRef = useRef(false);
  const lastFinalChunkRef = useRef("");

  const [buttonStates, setButtonStates] = useState(() => {
    const init = {};
    KNOWN_BUTTONS.forEach((b) => {
      init[b] = false;
    });
    return init;
  });

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
    rec.continuous = !isMobile; // When isMobile is true (or isIOS), this is false.
    rec.interimResults = true;
    rec.lang = "en-US";

    if (isMobile) {
      // ---------- Mobile-Specific Setup (including iPhone) ----------
      // In mobile mode, we treat each utterance separately because mobile browsers
      // (especially Safari on iOS) tend to fire duplicate final results.
      // We'll use a local flag to ensure we process a final result only once per utterance.
      let utteranceCompleted = false;

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
            currentFinal += transcript;
          } else {
            currentInterim += transcript;
          }
        }

        // Update the interim text if available
        if (currentInterim) {
          setInterimText(currentInterim);
        }

        // Process final result only once per utterance
        if (currentFinal && !utteranceCompleted) {
          const newFinalChunk = currentFinal.trim();
          utteranceCompleted = true; // Mark this utterance as completed
          // Update the main input text with the new final chunk
          setInputText((prev) =>
            prev ? `${prev} ${newFinalChunk}` : newFinalChunk
          );
          // Clear the interim display because we just got a final segment
          setInterimText("");
          // Stop recognition to prevent duplicate events for this utterance
          try {
            rec.stop();
          } catch (err) {
            console.error("Error stopping recognition on mobile:", err);
          }
        }
      };

      rec.onend = () => {
        // Reset the utterance flag for the next utterance
        utteranceCompleted = false;
        // If the user is still recording, restart recognition
        if (isRecording) {
          try {
            rec.start();
          } catch (err) {
            console.error("Error restarting recognition on mobile:", err);
          }
        }
      };
    } else {
      rec.onresult = (event) => {
        if (stopManuallyRef.current) return; // Use ref or check state for stopManually

        let currentInterim = "";
        let currentFinal = "";

        // Iterate through all results received in this event
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const transcript = result[0].transcript;

          if (result.isFinal) {
            currentFinal += transcript; // Accumulate final transcript parts for this event
          } else {
            currentInterim += transcript; // Accumulate the latest interim transcript for this event
          }
        }

        if (currentFinal) {
          // If we received final text in this event...
          const newFinalChunk = currentFinal.trim(); // Trim the newly finalized chunk
          if (newFinalChunk && newFinalChunk === lastFinalChunkRef.current) {
            return; // Skip updating if this chunk is the same as last time
          }
          lastFinalChunkRef.current = newFinalChunk; // Update the ref with the new final chunk

          setInputText((prev) => {
            // Update the main input text
            if (!newFinalChunk) return prev; // Do nothing if the new chunk is empty

            if (prev) {
              // If there's existing text, ADD A SPACE before the new chunk
              return prev + " " + newFinalChunk;
            } else {
              // If this is the first chunk, just use it directly
              return newFinalChunk;
            }
          });
          setInterimText(""); // Clear the interim display because we just got a final segment
        } else if (currentInterim) {
          // Otherwise (if only interim results were received), update interim display
          setInterimText(currentInterim); // Update the interim text state
        }
      };

      rec.onend = () => {
        if (!stopManuallyRef.current && isRecordingRef.current) {
          console.log("Speech recognition ended unexpectedly, restarting");
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
        setIsRecording(false);
        setStopManually(true); // Ensure stop state is set
        stopManuallyRef.current = true; // Update ref too
        setInterimText(""); // Clear interim text state AFTER potentially capturing it
      };
    }

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
    <div className="flex flex-col h-full justify-between  bg-gray-700 text-white mx-auto  max-w-xl relative ">
    
      {true && (
        <div
          ref={messagesContainerRef}
          id="message-list-container"
          className="   relative    bg-yellow-500  "
        >
          <div className="overflow-y-hidden max-h-full  bg-orange-500  ">
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
        </div>
      )}
      <div className="flex items-center space-x-2 w-full px-2 bg-gray-800 py-2">
        <RoundButton
          onMouseDown={handleMicPressStart}
          onMouseUp={handleMicPressEnd}
          onMouseLeave={handleMicLeave}
          onTouchStart={(e) => {
            e.preventDefault();
            handleMicPressStart();
          }}
          onTouchEnd={handleMicPressEnd}
          onTouchCancel={handleMicPressEnd}
          controllerConnected={true}
          gamepadActionButton="Y"
          title="Toggle/Hold Recording (Y)"
          isActive={isRecording}
          className={""}
          Icon={FaMicrophone}
        />

        <div className="relative flex-1">
          <textarea
            ref={textAreaRef}
            rows={1}
            className="block w-full px-3 py-2 bg-gray-800 rounded focus:outline-none resize-none overflow-auto max-h-64 align-top font-sans text-base leading-normal" // Example: Define styles clearly
            placeholder={!interimText ? "Type or Hold Mic [Y]" : ""}
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
          {interimText && (
            <div
              className="absolute inset-0 px-3 py-2 overflow-hidden pointer-events-none whitespace-pre-wrap break-words align-top font-sans text-base leading-normal" // <-- !!! These classes MUST meticulously match the textarea's font, size, padding, line-height, etc. !!!
              aria-hidden="true"
            >
              <span style={{ color: "transparent" }}>{inputText}</span>
              <span className="text-gray-400 opacity-75 animate-pulse">
                {interimText}
              </span>
            </div>
          )}
        </div>

        <RoundButton
          Icon={FaPaperPlane}
          onClick={handleSend}
          controllerConnected={true}
          gamepadActionButton="A"
          gamepadBadgeBgColor="bg-green-400"
          className="bg-blue-400"
          isLoading={false}
        />
      </div>
    </div>
  );
}

const RoundButton = ({
  Icon,
  onClick,
  controllerConnected,
  gamepadActionButton,
  // New optional props for gamepad badge colors:
  gamepadBadgeBgColor = "bg-yellow-400",
  gamepadBadgeTextColor = "text-black",
  // Other props:
  isLoading = false,
  isActive = false,
  disabled = false,
  title = "",
  className = "",
  // Animation event handlers
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
  ...rest
}) => {
  return (
    <button
      {...rest}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
      title={title}
      disabled={disabled || isLoading}
      className={`
        relative p-2 rounded-full transition-all duration-150 active:scale-95
        ${
          isActive
            ? "bg-red-600 hover:bg-red-700 animate-pulse"
            : "bg-gray-600 hover:bg-gray-700 "
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {/* Render a spinner if loading; otherwise, render the Icon */}
      {isLoading ? <FaSpinner className="animate-spin" /> : Icon && <Icon />}

      {/* Gamepad action button badge */}
      {controllerConnected && !isLoading && (
        <span
          className={`
            absolute top-0 right-0 translate-x-1 -translate-y-1
            ${gamepadBadgeBgColor} ${gamepadBadgeTextColor} 
            text-xs w-4 h-4 flex items-center justify-center 
            rounded-full border border-black
          `}
        >
          {gamepadActionButton}
        </span>
      )}
    </button>
  );
};

const TopRow = ({
  isRecording,
  autoSendOnStop,
  setAutoSendOnStop,
  controllerConnected,
  props,
}) => {
  return (
    <div className="mb-2 flex items-center justify-between text-sm">
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
    </div>
  );
};
