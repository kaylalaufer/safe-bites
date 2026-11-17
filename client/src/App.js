import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoadScript } from "@react-google-maps/api";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Explore from "./pages/Explore";
import CreatePost from "./pages/CreatePost";
import Login from "./pages/Login";
import RestaurantPage from "./pages/RestaurantPage";
import ProfileSetup from "./pages/ProfileSetup";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";

import AuthWrapper from "./components/features/auth/AuthWrapper";
import ProfileCheckWrapper from "./components/features/auth/ProfileCheckWrapper";
import { AuthProvider, useAuth } from "./components/features/auth/AuthProvider";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

const GOOGLE_MAPS_LIBRARIES = ["places"];

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </Router>
  );
}

function AppShell() {
  const { loading } = useAuth();

  if (loading) return null;

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={GOOGLE_MAPS_LIBRARIES}>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <ToastContainer position="top-center" autoClose={4000} />

        <Header />

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
                  <RestaurantPage />
                </AuthWrapper>
              }
            />

            <Route
              path="/profile"
              element={
                <AuthWrapper>
                  <Profile />
                </AuthWrapper>
              }
            />

            <Route
              path="/edit-profile"
              element={
                <AuthWrapper>
                  <EditProfile />
                </AuthWrapper>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </LoadScript>
  );
}

export default App;
