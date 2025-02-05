import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Explore from './pages/Explore';
import CreatePost from './pages/CreatePost';

function App() {
    return (
        <Router>
            <div className="bg-gray-100 min-h-screen">
                {/* Header with navigation links */}
                <nav className="bg-white shadow p-4">
                    <div className="max-w-4xl mx-auto flex justify-between">
                        <Link to="/" className="text-pink-900 font-bold hover:underline">
                            Explore
                        </Link>
                        <Link to="/create" className="text-pink-900 font-bold hover:underline">
                            Create Post
                        </Link>
                    </div>
                </nav>

                {/* Routes */}
                <Routes>
                    <Route path="/" element={<Explore />} />
                    <Route path="/create" element={<CreatePost />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
