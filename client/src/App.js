import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoadScript } from "@react-google-maps/api";
import { supabase } from "./supabaseClient";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Explore from "./pages/Explore";
import CreatePost from "./pages/CreatePost";
import Login from "./pages/Login";
import RestaurantPage from "./pages/RestaurantPage";
import ProfileSetup from "./pages/ProfileSetup";
import AuthWrapper from "./components/AuthWrapper";
import TestDataInsert from "./components/TestDataInsert";
import ProfileCheckWrapper from "./components/ProfileCheckWrapper";
import Header from "./components/Header";
import Footer from "./components/Footer";

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
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={GOOGLE_MAPS_LIBRARIES}>

      <div className="flex flex-col min-h-screen bg-gray-100">

        <ToastContainer position="top-center" autoClose={4000} />

        <Header user={user} isGuest={isGuest} handleLogout={handleLogout} />  

        <main className="flex-grow flex items-center justify-center">
          <Routes>
            <Route
              path="/login"
              element={
                <div className="flex flex-grow items-center justify-center bg-gray-100">
                  <Login />
                </div>
              }
            />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/test-insert" element={<TestDataInsert />} />

            <Route
              path="/"
              element={
                <AuthWrapper>
                  <ProfileCheckWrapper>
                  
                    <Explore />
                 
                  </ProfileCheckWrapper>
                </AuthWrapper>
              }
            />

            <Route
              path="/create"
              element={
                <AuthWrapper>
                  <ProfileCheckWrapper>
                  
                    <CreatePost />
                 
                  </ProfileCheckWrapper>
                </AuthWrapper>
              }
            />

            <Route
              path="/restaurant/:id"
              element={
                <AuthWrapper>
                    <RestaurantPage/>
                </AuthWrapper>
              }
            />
            
          </Routes>
        </main>
        <Footer />
        
      </div>
      </LoadScript>
    </Router>
  );
}

export default App;