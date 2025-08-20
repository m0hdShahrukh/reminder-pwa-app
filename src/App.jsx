// src/App.jsx

function App() {
  // This component will render an iframe that fills the entire viewport
  // and loads the static HTML file from your public folder.
  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <iframe
        src="/reminder.html"
        title="Custom Reminder App"
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  );
}

export default App;