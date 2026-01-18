import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Welcome from './pages/Welcome';
import Home from './pages/Home.tsx';
import SeriesManagement from './pages/SeriesManagement';
import Book from './pages/Book';
import Settings from './pages/Settings';

import { useSettingsStore } from './stores/settingsStore';
import AppUpdater from './components/AppUpdater';

function App() {
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [isCheckingWelcome, setIsCheckingWelcome] = useState(true);
  const { loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();

    const checkWelcomeState = async () => {
      try {
        const hasSeen = await window.storeAPI.get('welcome.hasSeen', false);
        const seenVersion = await window.storeAPI.get('welcome.version', null);
        const currentVersion = await window.generalAPI.getVersion();

        const shouldShowWelcome = !hasSeen || seenVersion !== currentVersion;
        setHasSeenWelcome(!shouldShowWelcome);
      } catch (error) {
        console.error('Failed to check welcome state:', error);
        setHasSeenWelcome(false);
      } finally {
        setIsCheckingWelcome(false);
      }
    };

    checkWelcomeState();
  }, [loadSettings]);

  if (isCheckingWelcome) return;

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