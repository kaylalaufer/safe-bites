// components/Header.js
import React from "react";
import { Link, useLocation } from "react-router-dom";

const Header = ({ user, isGuest, handleLogout }) => {
  const location = useLocation();
  const hideHeaderRoutes = ["/login", "/profile-setup"];

  if (hideHeaderRoutes.includes(location.pathname)) return null;

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="flex gap-4">
          <Link
            to="/"
            className="text-lg font-semibold text-pink-700 hover:text-pink-900 transition"
          >
            Explore
          </Link>
          <Link
            to="/create"
            className="text-lg font-semibold text-pink-700 hover:text-pink-900 transition"
          >
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
  );
};

export default Header;