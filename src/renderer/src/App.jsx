import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';

import { useSettingsStore } from './stores/settingsStore';
import AppUpdater from './components/AppUpdater';

const Welcome = lazy(() => import('./pages/Welcome'));
const Home = lazy(() => import('./pages/Home.tsx'));
const SeriesManagement = lazy(() => import('./pages/SeriesManagement'));
const Book = lazy(() => import('./pages/Book'));
const Settings = lazy(() => import('./pages/Settings'));

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

  if (isCheckingWelcome) {
    return (
      <div className="App">
        <AppUpdater />
      </div>
    );
  }

  return (
    <div className="App">
      <AppUpdater />

      <Suspense fallback={null}>
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
      </Suspense>
    </div>
  );
}

export default App;
