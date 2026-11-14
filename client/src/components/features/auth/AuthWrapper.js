import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const AuthWrapper = ({ children }) => {
  const { user, isGuest, loading } = useAuth();
  const navigate = useNavigate();
  const allowed = isGuest || Boolean(user);

  useEffect(() => {
    if (loading || allowed) return;
    navigate("/login");
  }, [allowed, loading, navigate]);

  if (loading || !allowed) return null;

  return <>{children}</>;
};

export default AuthWrapper;
