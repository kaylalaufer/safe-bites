import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import { hasProfileRow } from "../../../domain";
import { useAuth } from "./AuthProvider";

const ProfileCheckWrapper = ({ children }) => {
  const { user, isGuest, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [validProfile, setValidProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    const checkProfile = async () => {
      if (isGuest) {
        if (cancelled) return;
        setValidProfile(true);
        setLoading(false);
        return;
      }

      if (!user) {
        navigate("/login");
        if (!cancelled) setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (cancelled) return;

      if (error || !hasProfileRow(data)) {
        navigate("/profile-setup");
      } else {
        setValidProfile(true);
      }

      setLoading(false);
    };

    checkProfile();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isGuest, navigate, user]);

  if (authLoading || loading || !validProfile) return null;

  return children;
};

export default ProfileCheckWrapper;
