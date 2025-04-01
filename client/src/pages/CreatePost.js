import React, { useState, useEffect } from "react";
import { createPost } from "../utils/api";
import { toast } from "react-toastify";
import { Autocomplete } from "@react-google-maps/api";
import { supabase } from "../supabaseClient";

function CreatePost() {
  const [formData, setFormData] = useState({
    restaurant: "",
    location: "",
    place_type: "",
    hidden_allergens: "",
    allergens: [],
    restrictions: [],
    experience: "",
    user: "",
    review: "",
  });

  const isGuest = sessionStorage.getItem("isGuest") === "true";

  const [autocomplete, setAutocomplete] = useState(null);
  const [user, setUser] = useState(null);

  //const [safetyCategory, setSafetyCategory] = useState("");
  const [allAllergensAffected, setAllAllergensAffected] = useState("yes");
  const [customAllergenFeedback, setCustomAllergenFeedback] = useState({});
  

  const [profile, setProfile] = useState({
    username: "",
    allergens: [],
  });

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (!isGuest && user) {
        const fetchProfile = async () => {
          const { data, error } = await supabase
            .from("users")
            .select("username, allergens")
            .eq("id", user.id)
            .single();
      
          if (error) {
            console.error("Error fetching profile:", error.message);
          } else {
            setProfile(data);
          }
        };
      
        fetchProfile();
      }
      
    };
    getUser();
  }, []);

  const userAllergens = profile.allergens || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePlaceSelect = () => {
    if (autocomplete) {
        const place = autocomplete.getPlace();
        // Extract the raw Google type (e.g., "cafe", "bakery")
        const rawType = place.types?.[0] || "";

        // Map rawType to your custom list
        const typeMapping = {
        cafe: "Cafe",
        bakery: "Bakery",
        restaurant: "Casual Dining",
        meal_delivery: "Fast Food",
        meal_takeaway: "Fast Food",
        ice_cream_shop: "Ice Cream",
        };

        const mappedType = typeMapping[rawType] || "";
        setFormData({
            ...formData,
            restaurant: place.name || "",
            location: place.formatted_address || "",
            place_type: mappedType,
        });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let allergen_feedback = [];

    if (
      formData.experience === "safe" ||
      allAllergensAffected === "yes" ||
      allAllergensAffected === "unsure"
    ) {
      allergen_feedback = userAllergens.map((a) => ({
        allergen: a,
        category: formData.experience,
      }));
    } else if (allAllergensAffected === "no") {
      allergen_feedback = Object.entries(customAllergenFeedback).map(
        ([allergen, category]) => ({ allergen, category })
      );
    }

    const fullData = {
      ...formData,
      allergen_feedback,
      user: user?.id || "",
    };

    try {
      const response = await createPost(fullData);
      console.log("Post created:", response.data);
      toast.success("Post Created! 🎉");

      setFormData({
        restaurant: "",
        location: "",
        hidden_allergens: "",
        allergens: [],
        restrictions: [],
        experience: "",
        user: "",
        review: "",
      });
    } catch (error) {
      console.error("⚠️ Error creating post: ", error);
      toast.error("Error creating post. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-pink-900 mb-4 text-center">
        Post a Review
      </h1>

      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
        <form onSubmit={handleSubmit} className="space-y-7">
          <div>
            <label className="block font-bold mb-2">Restaurant Name *</label>
            <Autocomplete
              onLoad={(auto) => setAutocomplete(auto)}
              onPlaceChanged={handlePlaceSelect}
            >
              <input
                type="text"
                name="restaurant"
                value={formData.restaurant}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                placeholder="Search for a restaurant..."
                required
              />
            </Autocomplete>
          </div>

          <div>
            <label className="block font-bold mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              className="w-full p-3 border rounded-lg bg-gray-100"
              disabled
            />
          </div>
          
          {/* Place Type */}
          <div>
            <label className="block font-bold mb-2">Type of Place</label>
            <select
                name="place_type"
                value={formData.place_type}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
            >
                <option value="">Select type</option>
                {[
                "Bakery", "Cafe", "Ice Cream", "Diner", "Breakfast", "Fast Food", "Casual Dining",
                "Fine Dining", "Vegan-Friendly", "Vegetarian-Options", "Italian", "Seafood", "Pizza",
                "BBQ", "Mexican", "Indian", "Asian", "Mediterranean"
                ].map((type) => (
                <option key={type} value={type}>{type}</option>
                ))}
            </select>
          </div>
                
          { /* Hidden Allergens */}
          <div>
            <label className="block font-bold mb-2">
              Were there any hidden allergens?
            </label>
            <input
              type="text"
              name="hidden_allergens"
              value={formData.hidden_allergens}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              placeholder="Cross-contamination, allergens not listed on menu, etc."
            />
          </div>

          { /* Experience rating */}
          <div>
            <label className="block font-bold mb-2">
              How was your experience? *
            </label>
            <div className="flex gap-6">
              {[
                {
                  value: "safe",
                  label: "✅ Safe",
                  tooltip:
                    "No cross-contamination, restaurant fully understands allergies.",
                },
                {
                  value: "accommodating",
                  label: "🟡 Accommodating",
                  tooltip:
                    "Staff was aware but some minor risks (e.g., shared kitchen).",
                },
                {
                  value: "unsafe",
                  label: "❌ Unsafe",
                  tooltip:
                    "Restaurant was not allergy-friendly, high risk of contamination.",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className="relative flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="experience"
                    value={option.value}
                    checked={formData.experience === option.value}
                    onChange={(e) => {
                        const newExperience = e.target.value;
                        setFormData({ ...formData, experience: newExperience });
                      
                        // Reset allergen-specific logic when switching
                        setAllAllergensAffected("yes");
                        setCustomAllergenFeedback({});
                        
                    }}
                    required
                  />
                  {option.label}
                  <span className="absolute left-0 top-8 w-48 text-xs text-gray-700 bg-gray-100 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {option.tooltip}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {["accommodating", "unsafe"].includes(formData.experience) && (
            <div className="mt-4">
              <label className="block font-medium mb-1">
                Were all of your allergens {formData.experience}?
              </label>
              <select
                value={allAllergensAffected}
                onChange={(e) => setAllAllergensAffected(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="yes">Yes</option>
                <option value="no">No, only some</option>
                <option value="unsure">Not sure</option>
              </select>
            </div>
          )}

          {allAllergensAffected === "no" && (
            <div className="space-y-2 mt-4">
              <p className="font-medium">Tag each allergen:</p>
              {userAllergens.map((allergen) => (
                <div key={allergen} className="flex gap-2 items-center">
                  <span className="w-24">{allergen}</span>
                  <select
                    value={customAllergenFeedback[allergen] || ""}
                    onChange={(e) =>
                      setCustomAllergenFeedback((prev) => ({
                        ...prev,
                        [allergen]: e.target.value,
                      }))
                    }
                    className="p-1 border rounded"
                  >
                    <option value="">Select</option>
                    <option value="safe">Safe</option>
                    <option value="accommodating">Accommodating</option>
                    <option value="unsafe">Unsafe</option>
                  </select>
                </div>
              ))}
            </div>
          )}

          { /* Review */}
          <div>
            <label className="block font-bold mb-2">Review *</label>
            <textarea
              name="review"
              value={formData.review}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg h-24"
              placeholder="Write your review"
              required
            />
          </div>

          {isGuest ? (
            <div
              onClick={() => toast.info("Please log in to post a review.")}
              className="w-full"
            >
              <button
                type="button"
                className="w-full p-3 rounded text-white bg-gray-400 cursor-not-allowed"
              >
                Share Post!
              </button>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full p-3 rounded text-white bg-pink-600 hover:bg-pink-700 transition"
            >
              Share Post!
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default CreatePost;