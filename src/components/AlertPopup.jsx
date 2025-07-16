// src/components/AlertPopup.jsx
import React, { useState, useEffect, useRef } from 'react';

export default function AlertPopup({ reminder, onClose }) {
  // Store the exact time when the popup should close
  const endTime = useRef(Date.now() + reminder.duration * 1000);
  const [timeLeft, setTimeLeft] = useState(reminder.duration);

  useEffect(() => {
    // Play sound immediately when the popup appears
    new Audio('/alert.mp3').play().catch(e => console.error("Error playing sound:", e));

    // Countdown timer
    const timer = setInterval(() => {
      const newTimeLeft = Math.ceil((endTime.current - Date.now()) / 1000);
      if (newTimeLeft <= 0) {
        clearInterval(timer);
        onClose(); // Close the popup
      } else {
        setTimeLeft(newTimeLeft);
      }
    }, 250); // Check 4 times a second for better accuracy

    return () => clearInterval(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-sky-900/90 backdrop-blur-md flex flex-col items-center justify-center p-4 z-50 text-white animate-fade-in">
      <h2 className="text-4xl md:text-6xl font-bold text-sky-300">Time for a break!</h2>
      <p className="text-2xl mt-2 text-slate-200">"{reminder.label}"</p>
      
      <div className="mt-12 text-center">
        <p className="text-lg text-slate-400">Popup will close in</p>
        <p className="text-8xl font-mono font-bold text-white">{timeLeft}</p>
        <p className="text-lg text-slate-400">seconds</p>
      </div>
      
      <button 
        onClick={onClose} 
        className="mt-12 px-6 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg"
      >
        Close Now
      </button>
    </div>
  );
}