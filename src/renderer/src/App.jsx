import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import SeriesManagement from './pages/SeriesManagement';
import Book from './pages/Book';

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
        <Route
          path="/book"
          element={<Book />}
        />
      </Routes>
    </div>
  );
}

export default App;