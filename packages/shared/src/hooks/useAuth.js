import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const guestStatus = sessionStorage.getItem("isGuest") === "true";
      setIsGuest(guestStatus);
      
      if (!guestStatus) {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      }
      setLoading(false);
    };

    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem("isGuest");
    setUser(null);
    setIsGuest(false);
  };

  const setGuestMode = (isGuestMode) => {
    setIsGuest(isGuestMode);
    if (isGuestMode) {
      sessionStorage.setItem("isGuest", "true");
    } else {
      sessionStorage.removeItem("isGuest");
    }
  };

  return {
    user,
    loading,
    isGuest,
    logout,
    setGuestMode,
    isAuthenticated: !!user || isGuest
  };
};
