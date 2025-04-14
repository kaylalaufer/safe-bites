import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const allergenOptions = [
  "Peanut", "Tree Nut", "Gluten", "Wheat", "Eggs", "Milk", "Sesame", "Soy", "Fish", "Shellfish"
];

const personTypes = ["adult", "parent", "college_student", "child"];

const ProfileSetup = () => {
  const [username, setUsername] = useState("");
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [personType, setPersonType] = useState("");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setUserId(user.id);
    };
    fetchUser();
  }, [navigate]);

  const handleSubmit = async () => {
    const { error } = await supabase
      .from("users")
      .update({
        username,
        allergens: selectedAllergens,
        person_type: personType,
      })
      .eq("id", userId);

    if (error) {
      alert("Error saving profile: " + error.message);
    } else {
      navigate("/"); // Redirect to Explore page
    }
  };

  const toggleAllergen = (allergen) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen]
    );
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Complete Your Profile</h2>

      <input
        type="text"
        className="border p-2 w-full mb-4"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <h3 className="font-medium mb-2">Select Allergens:</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {allergenOptions.map((allergen) => (
          <button
            key={allergen}
            onClick={() => toggleAllergen(allergen)}
            className={`px-3 py-1 rounded-full border ${
              selectedAllergens.includes(allergen)
                ? "bg-pink-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            {allergen}
          </button>
        ))}
      </div>

      <h3 className="font-medium mb-2">I am a:</h3>
      <select
        className="border p-2 w-full mb-6"
        value={personType}
        onChange={(e) => setPersonType(e.target.value)}
      >
        <option value="">Select</option>
        {personTypes.map((type) => (
          <option key={type} value={type}>
            {type.replace("_", " ")}
          </option>
        ))}
      </select>

      <button
        className="bg-pink-600 text-white px-4 py-2 rounded w-full"
        onClick={handleSubmit}
      >
        Save & Continue
      </button>
    </div>
  );
};

export default ProfileSetup;
