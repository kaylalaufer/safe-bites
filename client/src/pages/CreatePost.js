import React, { useState, useEffect } from "react";
//import { createPost } from "../utils/api";
import { toast } from "react-toastify";
import { Autocomplete } from "@react-google-maps/api";
import { supabase } from "../supabaseClient";

function CreatePost() {
  const [formData, setFormData] = useState({
    restaurant: "",
    location: "",
    place_type: "",
    google_place_id: "",
    hidden_allergens: "",
    allergens: [],
    //restrictions: [],
    experience: "",
    user: "",
    review: "",
    lat: null,
    lng: null,
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
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
  
      if (!isGuest && user) {
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
      }
    };
  
    getUser();
  }, [isGuest]); // ✅ Add isGuest to the dependency array  

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
        const placeId = place.place_id;

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

        // 📍 Get lat/lng from place geometry
        const lat = place.geometry?.location?.lat();
        const lng = place.geometry?.location?.lng();

        setFormData({
            ...formData,
            restaurant: place.name || "",
            location: place.formatted_address || "",
            place_type: mappedType ? [mappedType] : [],
            google_place_id: placeId || "",
            lat,
            lng,
        });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!user || isGuest) {
      toast.error("You must be logged in to post a review.");
      return;
    }
  
    // Build allergen_feedback array
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
  
    try {
      // 1. Check if restaurant exists
      const { data: existingRestaurant, error } = await supabase
        .from("restaurants")
        .select("id,hidden_allergens,associated_allergens")
        .eq("name", formData.restaurant)
        .eq("location", formData.location)
        .eq("google_place_id", formData.google_place_id)
        .maybeSingle();

      if (error) {
        console.error("Select restaurant failed:", error.message);
        //throw error;
      }
  
      let restaurantId;
  
      if (existingRestaurant) {
        restaurantId = existingRestaurant.id;
  
        // 2. Append hidden allergens if needed
        if (formData.hidden_allergens) {
          const current = existingRestaurant.hidden_allergens || [];
          if (!current.includes(formData.hidden_allergens)) {
            await supabase
              .from("restaurants")
              .update({
                hidden_allergens: [...current, formData.hidden_allergens],
              })
              .eq("id", restaurantId);
          }
        }
  
        // 3. Append associated allergens
        const existingAssociated = existingRestaurant.associated_allergens || [];
        const merged = Array.from(
          new Set([...existingAssociated, ...profile.allergens])
        );
        await supabase
          .from("restaurants")
          .update({ associated_allergens: merged })
          .eq("id", restaurantId);

          // 4. Append new place_type if not already in the array
          const currentTypes = existingRestaurant.place_type || [];
          if (
            formData.place_type &&
            !currentTypes.includes(formData.place_type)
          ) {
            await supabase
              .from("restaurants")
              .update({
                place_type: [...currentTypes, formData.place_type],
              })
              .eq("id", restaurantId);
          }

      } else {
        // 4. Insert new restaurant
        const { data: newRestaurant, error: insertError } = await supabase
          .from("restaurants")
          .insert([
            {
              name: formData.restaurant,
              location: formData.location,
              place_type: formData.place_type ? [formData.place_type] : [],
              google_place_id: formData.google_place_id,
              hidden_allergens: formData.hidden_allergens
                ? [formData.hidden_allergens]
                : [],
              associated_allergens: profile.allergens,
              lat: formData.lat,
              lng: formData.lng,
            },
          ])
          .select()
          .single();
  
        if (insertError) throw insertError;
        restaurantId = newRestaurant.id;
      }
  
      // 5. Insert review
      const { error: reviewError } = await supabase.from("reviews").insert([
        {
          user_id: user.id,
          restaurant_id: restaurantId,
          allergen_feedback,
          review_text: formData.review,
        },
      ]);
  
      if (reviewError) throw reviewError;
  
      toast.success("Review posted! 🎉");

      // Increment the appropriate safety count
      const safetyCounts = {
        safe: 0,
        accommodating: 0,
        unsafe: 0,
      };
      
      allergen_feedback.forEach(({ category }) => {
        if (safetyCounts[category] !== undefined) {
          safetyCounts[category]++;
        }
      });
      
      // Update each count using Supabase RPC
      for (const { allergen, category } of allergen_feedback) {
        const column = `${category}_count`;
      
        const { error } = await supabase.rpc("increment_allergen_summary", {
          rest_id: restaurantId,
          allergen_name: allergen,
          column_name: column,
        });
      
        if (error) console.error("Error updating allergen summary:", error);
      }      

  
      // 6. Reset form
      setFormData({
        restaurant: "",
        location: "",
        place_type: "",
        hidden_allergens: "",
        allergens: [],
        experience: "",
        user: "",
        review: "",
      });
      setAllAllergensAffected("yes");
      setCustomAllergenFeedback({});
    } catch (error) {
      console.error("❌ Error submitting review:", error);
      toast.error("Failed to post review.");
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
                "Bakery", "Ice Cream", "Boba", "Cafe", "Fast Food", "Diner", 
                "Casual Dining", "Fine Dining", "Vegan", "Vegetarian", "Italian", 
                "Seafood", "Pizza", "BBQ", "Mexican", "Indian", "Asian", "Mediterranean"
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