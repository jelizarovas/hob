import React, { useState, useEffect, useRef } from 'react';
import Gamepad from 'react-gamepad';
import { FaMicrophone, FaPaperPlane } from 'react-icons/fa';
import {
  onValue,
  push,
  remove,
  ref,
  serverTimestamp,
} from 'firebase/database';
import { rtdb } from '../firebase';
import { useAuth } from '../auth/AuthProvider';

// Web Speech
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

// Buttons recognized by react-gamepad
const KNOWN_BUTTONS = [
  'A', 'B', 'X', 'Y',
  'LB', 'RB', 'LT', 'RT',
  'LS', 'RS', 'Start', 'Back', 'Home',
  'DPadUp', 'DPadDown', 'DPadLeft', 'DPadRight',
];

export default function ChatBox() {
  const { currentUser } = useAuth();

  // Basic user info
  const userId = currentUser?.uid || 'anon';
  const displayName = currentUser?.displayName || 'Anonymous User';
  const photoURL = currentUser?.photoURL || '';

  // Chat state
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Text area content (typed + recognized text)
  const [inputText, setInputText] = useState('');
  // Is the mic actively recording?
  const [isRecording, setIsRecording] = useState(false);
  // If forcibly stop, skip trailing final results
  const [stopManually, setStopManually] = useState(false);
  // If auto-send is on, we send when we stop
  const [autoSendOnStop, setAutoSendOnStop] = useState(false);

  // For ignoring repeated button events
  const [buttonStates, setButtonStates] = useState(() => {
    const init = {};
    KNOWN_BUTTONS.forEach((b) => { init[b] = false; });
    return init;
  });

  // The SpeechRecognition instance
  const recognitionRef = useRef(null);

  // For message selection/deletion
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  // For auto-grow text area
  const textAreaRef = useRef(null);

  // ──────────────────────────────────────────────────────────
  // 1) Load Messages from RTDB
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    const chatRef = ref(rtdb, '/chat/current');
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ──────────────────────────────────────────────────────────
  // 2) SpeechRecognition Setup
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition not supported in this browser.');
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (event) => {
      if (stopManually) return; // skip trailing results
      let finalBits = '';
      let interimBits = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) {
          finalBits += r[0].transcript;
        } else {
          interimBits += r[0].transcript;
        }
      }
      // Append final text to the input
      if (finalBits) {
        setInputText((prev) => prev + finalBits);
      }
      // For this simplified approach, we don't show partial text separately – 
      // but you could if you want. We'll just update the input with final text.
    };

    rec.onend = () => {
      // If not forcibly stopped, but isRecording is still true, we try to restart
      if (!stopManually && isRecording) {
        try {
          rec.start();
        } catch (err) {
          console.warn('Speech restart error:', err);
        }
      }
    };

    recognitionRef.current = rec;
  }, [isRecording, stopManually]);

  // If unmount, stop
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // ──────────────────────────────────────────────────────────
  // 3) Start/Stop Recording
  // ──────────────────────────────────────────────────────────
  function startRecording() {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop(); // ensure fresh start
    setStopManually(false);
    recognitionRef.current.start();
  }

  function stopRecording() {
    if (!recognitionRef.current) return;
    setStopManually(true);
    recognitionRef.current.stop();
    // If auto-send, do handleSend
    if (autoSendOnStop) {
      handleSend();
    }
  }

  // Whenever isRecording changes, we start/stop
  useEffect(() => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [isRecording]);

  // ──────────────────────────────────────────────────────────
  // 4) Send / Delete
  // ──────────────────────────────────────────────────────────
  function sendMessage(text) {
    if (!text.trim()) return;
    push(ref(rtdb, '/chat/current'), {
      text: text.trim(),
      userId,
      displayName,
      photoURL,
      timestamp: serverTimestamp(),
    });
  }

  function handleSend() {
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText('');
    // Reset text area
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
    }
  }

  function handleMessageClick(msg) {
    if (msg.userId !== userId) return;
    if (selectedMessageId === msg.id) {
      remove(ref(rtdb, `/chat/current/${msg.id}`));
      setSelectedMessageId(null);
    } else {
      setSelectedMessageId(msg.id);
    }
  }

  // ──────────────────────────────────────────────────────────
  // 5) Gamepad
  // ──────────────────────────────────────────────────────────
  function handleButtonChange(buttonName, pressed) {
    // Skip unknown or repeated
    if (!buttonName) return;
    if (!KNOWN_BUTTONS.includes(buttonName)) return;
    if (buttonStates[buttonName] === pressed) return;

    setButtonStates((prev) => ({ ...prev, [buttonName]: pressed }));

    if (buttonName === 'Y' && pressed) {
      // Toggle isRecording
      setIsRecording((prev) => !prev);
    }

    if (buttonName === 'X' && pressed) {
      setAutoSendOnStop((prev) => !prev);
    }

    if (buttonName === 'A' && pressed) {
      handleSend();
    }

    if (buttonName === 'B' && pressed) {
      setInputText('');
      if (textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
      }
    }
  }

  function handleAxisChange() {
    // not used here
  }

  // ──────────────────────────────────────────────────────────
  // 6) Auto-Grow Textarea
  // ──────────────────────────────────────────────────────────
  function autoGrow(e) {
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  // If input changes (like from voice), autoGrow
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
    }
  }, [inputText]);

  // ──────────────────────────────────────────────────────────
  // 7) Helpers
  // ──────────────────────────────────────────────────────────
  function getInitials(name) {
    const parts = name.split(/\s+/);
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
  }

  function formatTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function isMine(uid) {
    return uid === userId;
  }

  // Basic pre-wrap for multi-line
  const bubbleTextClass = 'text-sm whitespace-pre-wrap';

  // ──────────────────────────────────────────────────────────
  // 8) Render
  // ──────────────────────────────────────────────────────────
  return (
    <Gamepad
      onButtonChange={handleButtonChange}
      onAxisChange={handleAxisChange}
      gamepadIndex={0}
    >
      <div className="flex h-screen w-screen bg-gray-900 text-white">
        <div className="flex flex-col w-full p-4">
          {/* Top row: show isRecording & autoSend */}
          <div className="mb-2 flex items-center justify-between text-sm">
            <div>
              Recording:
              <span
                className={`ml-1 font-bold ${
                  isRecording ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {isRecording ? 'On' : 'Off'}
              </span>
            </div>
            <div>
              Auto-Send:
              <span
                className={`ml-1 font-bold ${
                  autoSendOnStop ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {autoSendOnStop ? 'On' : 'Off'}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto mb-4">
            {messages.map((msg) => {
              const mine = isMine(msg.userId);
              const selected = (msg.id === selectedMessageId);
              const initials = getInitials(msg.displayName || '??');
              return (
                <div
                  key={msg.id}
                  className={`flex items-start my-1 ${mine ? 'justify-end' : 'justify-start'}`}
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
                      ${mine ? 'bg-blue-600' : 'bg-gray-700'}
                      ${selected ? 'bg-red-700' : ''}
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

          {/* Input row */}
          <div className="flex items-center space-x-2 w-full">
            {/* Mic button => toggles isRecording */}
            <button
              onClick={() => {
                setIsRecording((prev) => !prev);
              }}
              className={`
                p-2 rounded-full
                ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-gray-700'}
              `}
            >
              <FaMicrophone />
            </button>

            <textarea
              ref={textAreaRef}
              rows={1}
              className="flex-1 px-3 py-2 bg-gray-800 rounded focus:outline-none resize-none overflow-auto max-h-64"
              placeholder="Type a Message"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
              }}
              onInput={autoGrow}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            <button
              onClick={handleSend}
              className="p-2 bg-blue-600 rounded-full flex items-center justify-center"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </Gamepad>
  );
}

/**
 * Auto-grow the <textarea> up to its scrollHeight. 
 * "max-h-64" ensures it won't exceed 16rem in height.
 */
function autoGrow(e) {
  const el = e.target;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}
