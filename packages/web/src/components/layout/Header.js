// components/Header.js
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CircleUserRound, HelpCircle } from "lucide-react";
import HelpModal from "../common/modals/HelpModal";

const Header = ({ user, isGuest, handleLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const hideHeaderRoutes = ["/login", "/profile-setup"];
  if (hideHeaderRoutes.includes(location.pathname)) return null;

  return (
    <nav className="bg-white shadow-md p-4 relative z-50">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-lg font-semibold text-pink-700 hover:text-pink-900 transition"
          >
            Explore
          </Link>
        </div>

        {/* Right Section (Help first, then Profile dropdown) */}
        <div className="flex items-center gap-4 ml-auto">
          {user && !isGuest ? (
            <div className="relative">
              <button onClick={() => setDropdownOpen((prev) => !prev)}>
                <CircleUserRound className="w-7 h-7 text-pink-700 hover:text-pink-900" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded shadow-md">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : isGuest ? (
            <button
              onClick={() => {
                sessionStorage.removeItem("isGuest");
                navigate("/login");
              }}
              className="text-sm bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700"
            >
              Log In / Sign Up
            </button>
          ) : null}
        </div>
         {/* Help Button */}
         <div className="absolute top-4 right-4">
          <button onClick={() => setShowHelp(true)} title="Help">
            <HelpCircle className="text-gray-600 hover:text-pink-600 w-5 h-5" />
          </button>
          <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
          </div>
      </div>
    </nav>
  );
};

export default Header;