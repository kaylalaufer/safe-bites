import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const AuthWrapper = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const isGuest = sessionStorage.getItem("isGuest") === "true";

      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          console.warn("Supabase auth error:", error.message);
        }

        if (!user && !isGuest) {
          navigate("/login");
        }
      } catch (e) {
        console.error("AuthWrapper error:", e);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) return null;

  return <>{children}</>;
};

export default AuthWrapper;