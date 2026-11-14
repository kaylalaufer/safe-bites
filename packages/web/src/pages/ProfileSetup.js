import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Autocomplete } from "@react-google-maps/api";
import { useLocation } from "react-router-dom";


const allergenOptions = [
  "Peanut", "Tree Nut", "Gluten", "Wheat", "Eggs", "Milk", "Sesame", "Soy", "Fish", "Shellfish"
];

const PERSON_TYPES = [
  { value: "adult", label: "Adult with allergies" },
  { value: "parent", label: "Parent of child with allergies" },
  { value: "college_student", label: "College student with allergies" },
  { value: "child", label: "Child with allergies" },
];

const ProfileSetup = () => {
  const [username, setUsername] = useState("");
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [personType, setPersonType] = useState("");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const [autocomplete, setAutocomplete] = useState(null);

  const [location, setLocation] = useState("");
  const [latLng, setLatLng] = useState({ lat: null, lng: null });


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

  const handlePlaceSelect = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      const location = place.formatted_address;
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
  
      setLocation(location);
      setLatLng({ lat, lng });
    }
  };

  const handleSubmit = async () => {

    if (!username.trim()) {
      alert("Username is required.");
      return;
    }
    
    if (!personType.trim()) {
      alert("Please select your allergy type.");
      return;
    }

    if (!location || latLng.lat == null || latLng.lng == null) {
      alert("Please select your location from the suggestions.");
      return;
    }

    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      alert("Error checking existing user: " + fetchError.message);
      return;
    }

    const updateData = {
      id: userId,
      username,
      allergens: selectedAllergens,
      person_type: personType,
      location,
      lat: latLng.lat,
      lng: latLng.lng,
    };

    let result;
    if (!existingUser) {
      result = await supabase.from("users").insert(updateData);
    } else {
      result = await supabase.from("users").update(updateData).eq("id", userId);
    }

    if (result.error) {
      alert("Error saving profile: " + result.error.message);
    } else {
      navigate("/");
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
      <h3 className="font-medium mb-2">Username: *</h3>
      <input
        type="text"
        required
        className="border p-2 w-full mb-4"
        placeholder="@username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        
      />

      <h3 className="font-medium mb-2">Your Location: *</h3>
      <Autocomplete
        onLoad={(auto) => setAutocomplete(auto)}
        onPlaceChanged={handlePlaceSelect}
      >
        <input
          type="text"
          placeholder="Enter your city, zip code, or address"
          className="border p-2 w-full mb-4"
          required
        />
      </Autocomplete>

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

      <h3 className="font-medium mb-2">I am a(n): *</h3>
        <select
          name="person_type"
          value={personType}
          onChange={(e) => setPersonType(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Type</option>
          {PERSON_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      <button
        className="bg-pink-600 text-white px-4 py-2 rounded w-full mt-6"
        onClick={handleSubmit}
      >
        Save & Continue
      </button>
    </div>
  );
};

export default ProfileSetup;