// components/ProfileCheckWrapper.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const ProfileCheckWrapper = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [validProfile, setValidProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkProfile = async () => {
      const isGuest = sessionStorage.getItem("isGuest") === "true";
  
      if (isGuest) {
        setValidProfile(true); // Allow guest to pass
        setLoading(false);
        return;
      }
  
      const { data: { user } } = await supabase.auth.getUser();
  
      if (!user) {
        navigate("/login");
        return;
      }
  
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
  
      if (error || !data) {
        navigate("/profile-setup");
      } else {
        setValidProfile(true);
      }
  
      setLoading(false);
    };
  
    checkProfile();
  }, [navigate]);
  

  if (loading || !validProfile) return null;

  return children;
};

export default ProfileCheckWrapper;
