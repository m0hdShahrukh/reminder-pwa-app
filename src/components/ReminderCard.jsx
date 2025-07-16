// src/components/ReminderCard.jsx
import React from 'react';

// Receive onTogglePause function
export default function ReminderCard({ reminder, onEdit, onDelete, onTogglePause }) {
  const getCountdown = () => {
    if (reminder.isPaused) return 'Paused';
    const secondsLeft = Math.round((reminder.nextDue - Date.now()) / 1000);
    if (secondsLeft <= 0) return "It's time!";
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${minutes}m ${seconds}s`;
  };

  return (
    // Add a class to dim the card when paused
    <div className={`bg-slate-800 p-4 rounded-lg shadow-md transition-opacity ${reminder.isPaused ? 'opacity-50' : 'opacity-100'}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-sky-300">{reminder.label}</h3>
          <p className="text-slate-400">Every {reminder.interval} minutes</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono bg-slate-700 px-3 py-1 rounded">
            {getCountdown()}
          </div>
          <p className="text-xs text-slate-500 mt-1">Next break</p>
        </div>
      </div>
      <div className="flex justify-end items-center space-x-2 mt-3 pt-3 border-t border-slate-700/50">
        {/* 👇 PAUSE/RESUME BUTTON 👇 */}
        <button
          onClick={() => onTogglePause(reminder.id)}
          className="text-xs text-amber-400 hover:text-white px-2 py-1 rounded hover:bg-amber-500"
        >
          {reminder.isPaused ? 'Resume' : 'Pause'}
        </button>
        <button
          onClick={() => onEdit(reminder)}
          className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(reminder.id)}
          className="text-xs text-red-400 hover:text-white px-2 py-1 rounded hover:bg-red-500"
        >
          Delete
        </button>
      </div>
    </div>
  );
}