import React, { useState, useEffect } from "react";
import { signInWithGoogle, logout, auth } from "../services/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const Login = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="p-4 text-center">
            {user ? (
                <div>
                    <p>Welcome, {user.displayName}</p>
                    <img src={user.photoURL} alt="Profile" className="w-16 h-16 rounded-full mx-auto" />
                    <button onClick={logout} className="bg-red-500 text-white px-4 py-2 mt-2 rounded">
                        Logout
                    </button>
                </div>
            ) : (
                <button onClick={signInWithGoogle} className="bg-blue-500 text-white px-4 py-2 rounded">
                    Sign in with Google
                </button>
            )}
        </div>
    );
};

export default Login;
