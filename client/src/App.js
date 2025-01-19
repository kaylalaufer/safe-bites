import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Explore from './pages/Explore';

function App() {
  return (
    <Router>
        <div className="bg-gray-100 min-h-screen">
          <Routes>
            <Route path="/" element={<Explore />} />
          </Routes>
        </div>
    </Router>
  );
}

export default App;