import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Autocomplete } from "@react-google-maps/api";
import { toast } from "react-toastify";
import { pickProfileUpdate, validateProfile } from "../domain";
import { AllergenPicker, PersonTypeField } from "../components";
import { useAuth } from "../components/features/auth/AuthProvider";

const ProfileSetup = () => {
  const { user, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [personType, setPersonType] = useState("");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const [autocomplete, setAutocomplete] = useState(null);

  const [location, setLocation] = useState("");
  const [latLng, setLatLng] = useState({ lat: null, lng: null });


  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    setUserId(user.id);
  }, [loading, navigate, user]);

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
    const validation = validateProfile({
      username,
      personType,
      location,
      lat: latLng.lat,
      lng: latLng.lng,
    });

    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }

    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      toast.error("Error checking existing user: " + fetchError.message);
      return;
    }

    // Location stays on this page. updateProfile does not write it.
    const profileFields = {
      ...pickProfileUpdate({
        username,
        allergens: selectedAllergens,
        person_type: personType,
      }),
      location,
      lat: latLng.lat,
      lng: latLng.lng,
    };

    const result = existingUser
      ? await supabase.from("users").update(profileFields).eq("id", userId)
      : await supabase.from("users").insert({ id: userId, ...profileFields });

    if (result.error) {
      toast.error("Error saving profile: " + result.error.message);
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

      <div className="mb-4">
        <AllergenPicker selected={selectedAllergens} onToggle={toggleAllergen} />
      </div>

      <PersonTypeField value={personType} onChange={setPersonType} />
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