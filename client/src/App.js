import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { LoadScript } from "@react-google-maps/api";
import { supabase } from "./supabaseClient";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Explore from "./pages/Explore";
import CreatePost from "./pages/CreatePost";
import Login from "./pages/Login";
import ProfileSetup from "./pages/ProfileSetup";
import AuthWrapper from "./components/AuthWrapper";
import TestDataInsert from "./components/TestDataInsert";

const GOOGLE_MAPS_LIBRARIES = ["places"];

function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const isGuest = sessionStorage.getItem("isGuest") === "true";

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user || null);
      setLoadingAuth(false);
      console.log("IN APP")
    };
  
    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
        setLoadingAuth(false);
      });
    
      return () => listener?.subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        sessionStorage.removeItem("isGuest");
        setUser(null);
        window.location.href = "/login";
      };
    
    if (loadingAuth) return null;

    

  return (
    <Router>
      <ToastContainer position="top-center" autoClose={4000} />
      <div className="bg-gray-100 min-h-screen">
        <nav className="bg-white shadow-md p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex gap-4">
              <Link to="/" className="text-lg font-semibold text-pink-700 hover:text-pink-900 transition">
                Explore
              </Link>
              <Link to="/create" className="text-lg font-semibold text-pink-700 hover:text-pink-900 transition">
                Create Post
              </Link>
            </div>
            {user || isGuest ? (
                isGuest ? (
                    <button
                    onClick={() => {
                        sessionStorage.removeItem("isGuest");
                        window.location.href = "/login";
                    }}
                    className="text-sm bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700"
                    >
                    Log In / Sign Up
                    </button>
                ) : (
                    <button
                    onClick={handleLogout}
                    className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                    Logout
                    </button>
                )
                ) : null}
          </div>
        </nav>

        <main className="max-w-4xl mx-auto p-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/test-insert" element={<TestDataInsert />} />

            <Route
              path="/"
              element={
                <AuthWrapper>
                  <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={GOOGLE_MAPS_LIBRARIES}>
                    <Explore />
                  </LoadScript>
                </AuthWrapper>
              }
            />

            <Route
              path="/create"
              element={
                <AuthWrapper>
                  <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={GOOGLE_MAPS_LIBRARIES}>
                    <CreatePost />
                  </LoadScript>
                </AuthWrapper>
              }
            />
            
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;