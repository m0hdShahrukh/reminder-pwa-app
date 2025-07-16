// src/components/ReminderForm.jsx
import React, { useState, useEffect } from 'react';

export default function ReminderForm({ onSave, onCancel, initialData }) {
  const [label, setLabel] = useState('');
  const [interval, setInterval] = useState(20);
  const [hasDuration, setHasDuration] = useState(false);

  // Replaced single duration state with minutes and seconds
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(20);

  useEffect(() => {
    if (initialData) {
      setLabel(initialData.label);
      setInterval(initialData.interval);
      setHasDuration(initialData.hasDuration || false);
      
      // Calculate minutes and seconds from the total duration when editing
      const totalSeconds = initialData.duration || 20;
      setDurationMinutes(Math.floor(totalSeconds / 60));
      setDurationSeconds(totalSeconds % 60);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!label || !interval) {
      alert('Please fill in all required fields.');
      return;
    }
    
    // Calculate total duration in seconds from the two fields before saving
    const totalDurationInSeconds = (parseInt(durationMinutes || 0, 10) * 60) + parseInt(durationSeconds || 0, 10);
    
    onSave({
      id: initialData?.id,
      label,
      interval: parseInt(interval),
      hasDuration,
      duration: totalDurationInSeconds,
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

          {/* 👇 UPDATED DURATION INPUTS 👇 */}
          {hasDuration && (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Close popup after
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  min="0"
                  placeholder="min"
                />
                <span className="text-slate-400">min</span>
                <input
                  type="number"
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  min="0"
                  max="59"
                  placeholder="sec"
                />
                <span className="text-slate-400">sec</span>
              </div>
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