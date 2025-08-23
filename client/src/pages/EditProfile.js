import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { StickyHeader } from "../components";

const EditProfile = () => {
    const [profile, setProfile] = useState({
        username: "",
        allergens: [],
        person_type: "",
    });
      
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const ALLERGENS = [
    "Peanut", "Tree Nut", "Gluten", "Wheat", "Eggs", "Milk", "Sesame", "Soy", "Fish", "Shellfish"
  ];

  const PERSON_TYPES = [
    { value: "adult", label: "Adult with allergies" },
    { value: "parent", label: "Parent of child with allergies" },
    { value: "college_student", label: "College student with allergies" },
    { value: "child", label: "Child with allergies" },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAllergen = (allergen) => {
    setProfile((prev) => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter((a) => a !== allergen)
        : [...prev.allergens, allergen],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (!profile.username.trim()) {
      toast.error("Username is required.");
      return;
    }


    const { error } = await supabase
        .from("users")
        .update(profile)
        .eq("id", user.id);

    if (error) {
      toast.error("Failed to update profile.");
    } else {
      toast.success("Profile updated!");
      navigate("/profile");
    }
  };

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

        <div>
          <label className="font-semibold block mb-1">Allergy Type *</label>
            <select
                name="person_type"
                value={profile.person_type || ""}
                onChange={(e) => setProfile(prev => ({ ...prev, person_type: e.target.value }))}
                className="w-full p-2 border rounded"
                >
                <option value="">Select Type</option>
                {PERSON_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                    {type.label}
                    </option>
                ))}
            </select>
        </div>

        <div>
          <label className="font-semibold block mb-1">Allergens</label>
          <div className="flex flex-wrap gap-2">
            {ALLERGENS.map((a) => (
              <button
                key={a}
                type="button"
                className={`px-3 py-1 rounded-full border ${
                  profile.allergens?.includes(a)
                    ? "bg-pink-300 text-white"
                    : "bg-gray-100"
                }`}
                onClick={() => toggleAllergen(a)}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
