// src/App.jsx
import React, { useState, useEffect } from 'react';
import ReminderCard from './components/ReminderCard';
import ReminderForm from './components/ReminderForm';
import AlertPopup from './components/AlertPopup';

let flashingTitleInterval = null;

export default function App() {
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('reminders');
    return saved ? JSON.parse(saved) : [];
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [activeAlert, setActiveAlert] = useState(null);
  const [allPaused, setAllPaused] = useState(false);

  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (allPaused) return;

      setReminders(prevReminders =>
        prevReminders.map(r => {
          if (r.isPaused || r.nextDue > Date.now()) {
            return r;
          }
          // ✅ BUG FIX #2: Base the next due time on the PREVIOUS due time.
          // This ensures a 1-minute reminder is always 1 minute apart,
          // regardless of popup duration or system lag.
          const newNextDue = r.nextDue + r.interval * 60 * 1000;
          triggerAlert(r);
          return { ...r, nextDue: newNextDue };
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [allPaused]);

  const handleTogglePauseReminder = (id) => {
    setReminders(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        if (r.isPaused) {
          const newNextDue = Date.now() + (r.remainingOnPause || 0);
          return { ...r, isPaused: false, nextDue: newNextDue, remainingOnPause: null };
        } else {
          const remainingOnPause = r.nextDue - Date.now();
          return { ...r, isPaused: true, remainingOnPause };
        }
      })
    );
  };
  
  // ✅ BUG FIX #1: The "Pause All" function now correctly calculates
  // remaining time for every single reminder.
  const handleTogglePauseAll = () => {
    const isPausing = !allPaused;
    setAllPaused(isPausing);

    setReminders(prev =>
      prev.map(r => {
        if (isPausing) {
          // Pausing All
          if (r.isPaused) return r; // Already paused individually, leave it.
          const remainingOnPause = r.nextDue - Date.now();
          return { ...r, isPaused: true, remainingOnPause };
        } else {
          // Resuming All
          if(r.remainingOnPause === null || r.remainingOnPause === undefined) return r; // Was never paused, leave it.
          const newNextDue = Date.now() + (r.remainingOnPause || 0);
          return { ...r, isPaused: false, nextDue: newNextDue, remainingOnPause: null };
        }
      })
    );
  };

  const startFlashingTitle = () => {
    if (flashingTitleInterval) return;
    const originalTitle = document.title;
    let isToggled = false;
    flashingTitleInterval = setInterval(() => {
      document.title = isToggled ? originalTitle : "‼️ TIME FOR A BREAK ‼️";
      isToggled = !isToggled;
    }, 1000);
  };

  const stopFlashingTitle = () => {
    clearInterval(flashingTitleInterval);
    flashingTitleInterval = null;
    document.title = "Twenty";
  };

  const triggerAlert = (reminder) => {
    startFlashingTitle();
    if (reminder.hasDuration) {
      setActiveAlert(reminder);
    } else {
      new Audio('/alert.mp3').play().catch(e => console.error("Error playing sound:", e));
    }
    
    if (Notification.permission === 'granted') {
      new Notification('Time for a break!', {
        body: `It's time for your "${reminder.label}" break.`,
        icon: '/favicon.ico',
        requireInteraction: true,
      });
    }
  };
  
  const closeAlert = () => {
      setActiveAlert(null);
      stopFlashingTitle();
  }

  const handleDeleteReminder = (idToDelete) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      setReminders(prev => prev.filter(r => r.id !== idToDelete));
    }
  };

  const handleEditReminder = (reminderToEdit) => {
    setEditingReminder(reminderToEdit);
    setIsFormVisible(true);
  };
  
  const handleCreateNew = () => {
    setEditingReminder(null);
    setIsFormVisible(true);
  };

  const handleSaveReminder = (reminderData) => {
    if (editingReminder) {
      setReminders(prev => prev.map(r => r.id === editingReminder.id ? { ...r, ...reminderData } : r));
    } else {
      const newReminder = {
        ...reminderData,
        id: Date.now(),
        isPaused: false,
        nextDue: Date.now() + reminderData.interval * 60 * 1000,
      };
      setReminders(prev => [...prev, newReminder]);
    }
    setIsFormVisible(false);
    setEditingReminder(null);
  };

  useEffect(() => {
    if (Notification.permission !== 'granted') Notification.requestPermission();
  }, []);

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans p-4">
      <div className="max-w-md mx-auto">
        <header className="text-center my-8">
          <h1 className="text-5xl font-bold text-sky-400">Twenty</h1>
          <p className="text-slate-400 mt-2">Follow the 20-20-20 rule. Save your eyes.</p>
        </header>

        <div className="text-center mb-8 space-x-4">
          <button onClick={handleCreateNew} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg">
            ✨ Add Reminder
          </button>
          <button onClick={handleTogglePauseAll} className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg">
            {allPaused ? '▶️ Resume All' : '⏸️ Pause All'}
          </button>
        </div>

        <main>
          <h2 className="text-xl font-semibold mb-4 text-slate-300">Active Reminders</h2>
          {reminders.length > 0 ? (
            <div className="space-y-4">
              {reminders.map(reminder => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  onEdit={handleEditReminder}
                  onDelete={handleDeleteReminder}
                  onTogglePause={handleTogglePauseReminder}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500">No reminders yet. Add one to get started!</p>
          )}
        </main>

        {activeAlert && <AlertPopup reminder={activeAlert} onClose={closeAlert} />}
        
        {isFormVisible && (
          <ReminderForm
            onSave={handleSaveReminder}
            onCancel={() => { setIsFormVisible(false); setEditingReminder(null); }}
            initialData={editingReminder}
          />
        )}
      </div>
    </div>
  );
}