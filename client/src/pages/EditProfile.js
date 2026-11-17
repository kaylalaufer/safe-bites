import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AllergenPicker, PersonTypeField, StickyHeader } from "../components";
import { pickProfileUpdate, validateProfile } from "../domain";
import { updateProfile } from "../data";
import { useAuth } from "../components/features/auth/AuthProvider";

const EditProfile = () => {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState({
        username: "",
        allergens: [],
        person_type: "",
    });
      
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("username, allergens, person_type")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAllergen = (allergen) => {
    setProfile((prev) => ({
      ...prev,
      allergens: (prev.allergens || []).includes(allergen)
        ? prev.allergens.filter((a) => a !== allergen)
        : [...(prev.allergens || []), allergen],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const validation = validateProfile({
      username: profile.username,
      personType: profile.person_type,
      requireLocation: false,
    });

    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }

    const { error } = await updateProfile(
      supabase,
      user.id,
      pickProfileUpdate(profile)
    );

    if (error) {
      toast.error("Failed to update profile.");
    } else {
      toast.success("Profile updated!");
      navigate("/profile");
    }
  };

  if (!user) {
    return (
      <div className="text-center mt-10">
        <p className="text-gray-700 mb-4">Sign in to edit your profile.</p>
        <button
          type="button"
          onClick={logout}
          className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
        >
          Log in
        </button>
      </div>
    );
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
      <StickyHeader title="Explore" />
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="username"
          value={profile.username || ""}
          onChange={handleChange}
          placeholder="Username *"
          className="w-full p-2 border rounded"
          required
        />

        <PersonTypeField
          value={profile.person_type || ""}
          onChange={(personType) =>
            setProfile((prev) => ({ ...prev, person_type: personType }))
          }
        />

        <AllergenPicker
          selected={profile.allergens || []}
          onToggle={toggleAllergen}
        />

        <button type="submit" className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
