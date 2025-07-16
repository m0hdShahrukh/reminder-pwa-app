// src/components/ReminderForm.jsx
import React, { useState, useEffect } from 'react';

export default function ReminderForm({ onSave, onCancel, initialData }) {
  const [label, setLabel] = useState('');
  const [interval, setInterval] = useState(20);
  // 👇 New state for the duration feature
  const [hasDuration, setHasDuration] = useState(false);
  const [duration, setDuration] = useState(20); // Default 20 seconds

  useEffect(() => {
    if (initialData) {
      setLabel(initialData.label);
      setInterval(initialData.interval);
      // Set duration fields if they exist on the reminder being edited
      setHasDuration(initialData.hasDuration || false);
      setDuration(initialData.duration || 20);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!label || !interval || (hasDuration && !duration)) {
      alert('Please fill in all required fields.');
      return;
    }
    onSave({
      id: initialData?.id,
      label,
      interval: parseInt(interval),
      hasDuration, // Pass the new data
      duration: parseInt(duration), // Pass the new data
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-20">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-sky-300">
          {initialData ? 'Edit Reminder' : 'New Reminder'}
        </h2>
        <div className="space-y-4">
          {/* Label and Interval inputs remain the same */}
          <div>
            <label htmlFor="label" className="block text-sm font-medium text-slate-400 mb-1">
              Label
            </label>
            <input
              type="text"
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              placeholder="e.g., Drink Water"
            />
          </div>
          <div>
            <label htmlFor="interval" className="block text-sm font-medium text-slate-400 mb-1">
              Interval (in minutes)
            </label>
            <input
              type="number"
              id="interval"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              min="1"
            />
          </div>
          {/* 👇 NEW DURATION FIELDS 👇 */}
          <div className="pt-2 border-t border-slate-700">
            <label htmlFor="hasDuration" className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                id="hasDuration"
                checked={hasDuration}
                onChange={(e) => setHasDuration(e.target.checked)}
                className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-sky-500 focus:ring-sky-500"
              />
              <span className="text-slate-300">Enable auto-close timer</span>
            </label>
          </div>

          {hasDuration && (
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-slate-400 mb-1">
                Close popup after (seconds)
              </label>
              <input
                type="number"
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                min="1"
              />
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-sky-500 hover:bg-sky-600 font-semibold text-white"
          >
            Save Reminder
          </button>
        </div>
      </form>
    </div>
  );
}