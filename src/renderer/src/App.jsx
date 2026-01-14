import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Welcome from './pages/Welcome';
import Home from './pages/Home';
import SeriesManagement from './pages/SeriesManagement';
import Book from './pages/Book';
import Settings from './pages/Settings';

import { useSettingsStore } from './stores/settingsStore';
import AppUpdater from './components/AppUpdater';

const getInitialWelcomeState = () => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('hasSeenWelcome') === 'true';
  } catch {
    return false;
  }
};

function App() {
  const [hasSeenWelcome] = useState(getInitialWelcomeState);
  const { loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <div className="App">
      <AppUpdater />

      <Routes>
        <Route
          path="/"
          element={hasSeenWelcome ? <Home /> : <Welcome />}
        />
        <Route
          path="/series"
          element={<SeriesManagement />}
        />
        <Route
          path="/book"
          element={<Book />}
        />
        <Route
          path="/settings"
          element={<Settings />}
        />
      </Routes>
    </div>
  );
}

export default App;