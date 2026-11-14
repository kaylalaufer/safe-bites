import { useNavigate } from "react-router-dom";
import React from "react";
import { toast } from "react-toastify";
import { canPostReview } from "../../../domain";
import { useAuth } from "../../features/auth/AuthProvider";

const FloatingCreateButton = () => {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();

  const handleClick = () => {
    if (canPostReview({ user, isGuest })) {
      navigate("/create");
    } else {
      toast.info("Please log in to post a review.");
      navigate("/");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 bg-pink-600 hover:bg-pink-700 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl shadow-lg transition-transform transform hover:scale-110"
      aria-label="Create Post"
    >
      +
    </button>
  );
};

export default FloatingCreateButton;
