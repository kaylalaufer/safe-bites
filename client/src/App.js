import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { LoadScript } from "@react-google-maps/api";
import Explore from "./pages/Explore";
import CreatePost from "./pages/CreatePost";

const GOOGLE_MAPS_LIBRARIES = ["places"]; // Needed for Places Autocomplete

function App() {
    return (
        <Router>
            <div className="bg-gray-100 min-h-screen">
                {/* Navbar */}
                <nav className="bg-white shadow-md p-4">
                    <div className="max-w-4xl mx-auto flex justify-between items-center">
                        <Link to="/" className="text-lg font-semibold text-pink-700 hover:text-pink-900 transition">
                            Explore
                        </Link>
                        <Link to="/create" className="text-lg font-semibold text-pink-700 hover:text-pink-900 transition">
                            Create Post
                        </Link>
                    </div>
                </nav>

                {/* Page Routes */}
                <main className="max-w-4xl mx-auto p-4">
                    <Routes>
                        {/* Explore Page - Needs Full Google Maps */}
                        <Route
                            path="/"
                            element={
                                <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={GOOGLE_MAPS_LIBRARIES}>
                                    <Explore />
                                </LoadScript>
                            }
                        />

                        {/* Create Post Page - Needs Google Places Autocomplete */}
                        <Route
                            path="/create"
                            element={
                                <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={GOOGLE_MAPS_LIBRARIES}>
                                    <CreatePost />
                                </LoadScript>
                            }
                        />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
