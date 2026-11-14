import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";

const AuthContext = createContext(null);
const GUEST_KEY = "isGuest";

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(() => sessionStorage.getItem(GUEST_KEY) === "true");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let initialResolved = false;

    const applyUser = (sessionUser) => {
      if (sessionUser) {
        sessionStorage.removeItem(GUEST_KEY);
        setIsGuest(false);
      }
      setUser(sessionUser || null);
    };

    const loadSession = async () => {
      const { data: { user: sessionUser } } = await supabase.auth.getUser();
      if (!active) return;
      initialResolved = true;
      applyUser(sessionUser);
      setLoading(false);
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active || !initialResolved) return;

      if (event === "SIGNED_OUT") {
        setUser(null);
        return;
      }

      if (session?.user) {
        applyUser(session.user);
      }
    });

    return () => {
      active = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }

    sessionStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
    setUser(null);
    navigate("/login");
  }, [navigate]);

  const continueAsGuest = useCallback(() => {
    sessionStorage.setItem(GUEST_KEY, "true");
    setIsGuest(true);
    navigate("/");
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, isGuest, loading, logout, continueAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
