// src/App.jsx
import React, { useState, useEffect } from 'react';
import ReminderCard from './components/ReminderCard';
import ReminderForm from './components/ReminderForm';
// AlertPopup is no longer needed as we rely on system notifications
// import AlertPopup from './components/AlertPopup'; 

// --- Helper Functions for Background Notifications ---

// Asks the user for permission to show notifications.
const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission not granted.');
  }
  return true;
};

// Schedules a notification with the browser/OS to be shown at a future time.
const scheduleNotification = async (reminder) => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const timestamp = Date.now() + reminder.interval * 60 * 1000;

    await registration.showNotification(reminder.label, {
      body: `It's time for your "${reminder.label}" break!`,
      icon: 'logo192.png', // Ensure this icon is in your public folder
      tag: `reminder-${reminder.id}`, // A unique ID for this notification
      showTrigger: new window.TimestampTrigger(timestamp),
    });
    
    console.log(`✅ Notification for "${reminder.label}" scheduled for ${new Date(timestamp).toLocaleTimeString()}`);
    return timestamp; // Return the time it's scheduled for
  } catch (error) {
    console.error(`Failed to schedule notification for "${reminder.label}":`, error);
    // Fallback if scheduling fails: just calculate the next due time for in-app display.
    return Date.now() + reminder.interval * 60 * 1000;
  }
};

// Cancels a previously scheduled notification.
const cancelNotification = async (reminderId) => {
    try {
        const registration = await navigator.serviceWorker.ready;
        const notifications = await registration.getNotifications({ tag: `reminder-${reminderId}` });
        notifications.forEach(notification => notification.close());
        console.log(`✅ Canceled scheduled notification for reminder ID: ${reminderId}`);
    } catch(error) {
        console.error('Failed to cancel notification:', error);
    }
};


// --- The Main App Component ---

export default function App() {
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('reminders');
    return saved ? JSON.parse(saved) : [];
  });
  
  // State for UI elements
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [installPromptEvent, setInstallPromptEvent] = useState(null);

  // This useEffect handles saving to localStorage whenever reminders change.
  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
  }, [reminders]);

  // This useEffect handles the PWA installation prompt.
  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPromptEvent(event);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // When the app loads, ask for permission.
  useEffect(() => {
    // We only need to ask for permission; scheduling is handled on save/edit.
    if ('Notification' in window && 'serviceWorker' in navigator && 'showTrigger' in window.Notification.prototype) {
        requestNotificationPermission().catch(err => console.warn(err.message));
    } else {
        alert("This browser does not support background notifications. Reminders will only work when the app is open.");
    }
  }, []);

  // --- Core Reminder Logic ---

  const handleSaveReminder = async (reminderData) => {
    setIsFormVisible(false);
    setEditingReminder(null);
    
    let reminderToSave;
    if (editingReminder) {
      // Find the existing reminder and update its properties
      reminderToSave = { ...reminders.find(r => r.id === editingReminder.id), ...reminderData };
      // Cancel any old notification before scheduling a new one
      await cancelNotification(reminderToSave.id);
    } else {
      // Create a new reminder object
      reminderToSave = { ...reminderData, id: Date.now(), isPaused: false };
    }

    // Schedule the notification with the OS and get the exact time it's due
    const newNextDue = await scheduleNotification(reminderToSave);
    reminderToSave.nextDue = newNextDue;

    if (editingReminder) {
      setReminders(prev => prev.map(r => r.id === editingReminder.id ? reminderToSave : r));
    } else {
      setReminders(prev => [...prev, reminderToSave]);
    }
  };

  const handleDeleteReminder = async (idToDelete) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      // First, cancel any notification that was scheduled for it
      await cancelNotification(idToDelete);
      // Then, remove it from our list
      setReminders(prev => prev.filter(r => r.id !== idToDelete));
    }
  };

  const handleInstallClick = () => {
    if (!installPromptEvent) return;
    installPromptEvent.prompt();
    installPromptEvent.userChoice.then(() => {
      setInstallPromptEvent(null);
    });
  };

  const handleCreateNew = () => {
    setEditingReminder(null);
    setIsFormVisible(true);
  };
  
  const handleEditReminder = (reminderToEdit) => {
    setEditingReminder(reminderToEdit);
    setIsFormVisible(true);
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans p-4">
      <div className="max-w-md mx-auto">
        <header className="text-center my-8">
          <h4 className="text-3xl font-bold text-sky-400">Task Reminder</h4>
          <p className="text-slate-400 text-[13px] mt-2">Follow the 20-20-20 rule. Save your eyes. <br /> Developed by <a href="https://shahrukh-react.netlify.app/ms-tools-hub.html" target='_blank' className='text-sky-400'>Mohd Shahrukh</a></p>
        </header>

        <div className="text-center mb-8 space-x-4">
          <button onClick={handleCreateNew} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg">
            ✨ Add Reminder
          </button>
          {/* Pause button removed for this new architecture */}
        </div>
        
        {installPromptEvent && (
          <div className="text-center mb-8 p-4 bg-slate-800 rounded-lg">
            <p className="mb-3 text-slate-300">Get the best experience by installing this app on your device!</p>
            <button onClick={handleInstallClick} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg">
              🚀 Install App
            </button>
          </div>
        )}
        
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
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500">No reminders yet. Add one to get started!</p>
          )}
        </main>

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