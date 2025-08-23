import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const FloatingCreateButton = () => {
  const navigate = useNavigate();
  const isGuest = sessionStorage.getItem("isGuest") === "true";
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
  
    getUser();
  }, [isGuest]); 

  const handleClick = () => {
    if (user || !isGuest) {
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
