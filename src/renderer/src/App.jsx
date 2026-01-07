import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import SeriesManagement from './pages/SeriesManagement';

function App() {
  const [hasSeenWelcome] = useState(() => {
    try {
      return localStorage.getItem('hasSeenWelcome') === 'true';
    } catch {
      return false;
    }
  });

  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={hasSeenWelcome ? <Home /> : <Welcome />}
        />
        <Route
          path="/series"
          element={<SeriesManagement />}
        />
      </Routes>
    </div>
  );
}

export default App;