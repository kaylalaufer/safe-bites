import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Autocomplete } from "@react-google-maps/api";
import { supabase } from "../supabaseClient";
import { useLocation, useNavigate } from "react-router-dom";
import { StickyHeader } from "../components";
import { RESTAURANT_TYPES, SAFETY_LABELS, buildAllergenFeedback, canPostReview } from "../domain";
import { submitReview } from "../data";
import { useAuth } from "../components/features/auth/AuthProvider";

function CreatePost() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  //const prefillRestaurantId = params.get("restaurantId");
  const prefillName = params.get("name") || "";
  const prefillLocation = params.get("location") || "";
  const prefillType = params.get("place_type") || "";

  const [formData, setFormData] = useState({
    restaurant: "" || prefillName,
    location: "" || prefillLocation,
    place_type: prefillType,
    google_place_id: "",
    hidden_allergens: "",
    allergens: [],
    experience: "",
    user: "",
    review: "",
    lat: null,
    lng: null,
  });

  const { user, isGuest } = useAuth();

  const [autocomplete, setAutocomplete] = useState(null);

  //const [safetyCategory, setSafetyCategory] = useState("");
  const [allAllergensAffected, setAllAllergensAffected] = useState("yes");
  const [customAllergenFeedback, setCustomAllergenFeedback] = useState({});
  

  const [profile, setProfile] = useState({
    username: "",
    allergens: [],
  });

  useEffect(() => {
    if (!canPostReview({ user, isGuest })) return;

    const loadProfile = async () => {
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

    loadProfile();
  }, [isGuest, user]);  

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      if (prefillName && prefillLocation) {
        try {
          const service = new window.google.maps.places.PlacesService(
            document.createElement("div")
          );
  
          const request = {
            query: `${prefillName}, ${prefillLocation}`,
            fields: ["place_id", "geometry", "name", "formatted_address", "types"],
          };
  
          service.findPlaceFromQuery(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results[0]) {
              const place = results[0];
  
              const lat = place.geometry?.location?.lat();
              const lng = place.geometry?.location?.lng();
              const placeId = place.place_id;

              setFormData((prev) => ({
                ...prev,
                restaurant: prefillName,
                location: prefillLocation,
                google_place_id: placeId,
                lat,
                lng,
                place_type: prefillType || "",
              }));
            }
          });
        } catch (err) {
          console.error("Error fetching place details:", err);
        }
      }
    };
  
    fetchPlaceDetails();
  }, [prefillName, prefillLocation, prefillType]);

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
  
    if (!canPostReview({ user, isGuest })) {
      toast.error("You must be logged in to post a review.");
      return;
    }
  
    const allergen_feedback = buildAllergenFeedback({
      experience: formData.experience,
      allAllergensAffected,
      userAllergens,
      customAllergenFeedback,
    });

    const { data, error, summaryError } = await submitReview(supabase, {
      name: formData.restaurant,
      location: formData.location,
      place_type: formData.place_type,
      google_place_id: formData.google_place_id,
      hidden_allergens: formData.hidden_allergens,
      associated_allergens: profile.allergens || [],
      lat: formData.lat,
      lng: formData.lng,
      userId: user.id,
      allergen_feedback,
      review_text: formData.review,
    });

    if (error) {
      toast.error("Failed to post review.");
      return;
    }

    if (summaryError) {
      toast.error("Review posted, but the allergen summary could not be updated.");
    } else {
      toast.success("Review posted! 🎉");
    }

    navigate(`/restaurant/${data.restaurantId}`);

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
  };  

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
      <StickyHeader title="Explore" />
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
                className={`w-full p-3 border rounded-lg ${
                  prefillName ? "bg-gray-100" : ""
                }`}
                placeholder="Search for a restaurant..."
                required
                disabled={!!prefillName}
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
                className={`w-full p-3 border rounded-lg`}

            >
                <option value="">Select type</option>
                {RESTAURANT_TYPES.map((type) => (
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
                    <option value="safe">{SAFETY_LABELS.safe}</option>
                    <option value="accommodating">{SAFETY_LABELS.accommodating}</option>
                    <option value="unsafe">{SAFETY_LABELS.unsafe}</option>
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

          {!canPostReview({ user, isGuest }) ? (
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