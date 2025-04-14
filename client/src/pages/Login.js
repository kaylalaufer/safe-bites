import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  //const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  const handleAuth = async () => {
    if (!email || !password) {
      toast.error("Please fill in both email and password.");
      return;
    }
  
    if (isSignUp) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
  
      if (signUpError) {
        toast.error(signUpError.message);
        return;
      }
  
      const user = signUpData.user;
  
      if (user) {
        const { error: insertError } = await supabase.from("users").insert({
          id: user.id,
          username: email.split("@")[0],
          allergens: [],
          favorites: [],
          person_type: "adult",
        });
  
        if (insertError) {
          toast.error("Error creating user profile: " + insertError.message);
          return;
        }
  
        window.location.href = "/profile-setup";
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
  
      if (error) {
        if (error.status === 400) {
          toast.error("Incorrect email or password. Please try again.");
        } else {
          toast.error(error.message);
        }
        return;
      }
  
      window.location.href = "/";
    }
  };
  
  const handleGuestLogin = () => {
    console.log("Guest login clicked");
    sessionStorage.setItem("isGuest", "true");
    setTimeout(() => {
      window.location.href = "/";
    }, 150);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-pink-600">
          {isSignUp ? "Create an Account" : "Welcome To Safe Bites!"}
        </h2>

        <input
          className="border border-gray-300 p-2 rounded w-full mb-4"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border border-gray-300 p-2 rounded w-full mb-4"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleAuth}
          className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition"
        >
          {isSignUp ? "Sign Up" : "Log In"}
        </button>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-3 text-sm text-gray-500 hover:underline"
        >
          {isSignUp ? "Already have an account? Log in" : "Don't have an account? Sign up"}
        </button>

        <div className="mt-6 border-t pt-4 text-center">
          <p className="text-sm text-gray-500 mb-2">Just browsing?</p>
          <button
            onClick={handleGuestLogin}
            className="text-pink-600 hover:underline text-sm"
          >
            Continue as Guest
          </button>
        </div>

        {errorMessage && (
        <div className="bg-red-100 text-red-700 p-2 rounded text-sm mb-4 text-center">
          {errorMessage}
        </div>
)}
      </div>
    </div>
  );
};

export default Login;