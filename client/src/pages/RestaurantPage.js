import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import ReviewCard from "../components/ReviewCard";
import AllergenSummary from "../components/AllergenSummary";
import { toast } from "react-toastify";
import StickyHeader from "../components/StickyHeader";
import HeartButton from "../components/HeartButton";

const RestaurantPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user + favorites
  useEffect(() => {
    const fetchUserAndFavorites = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);

      const { data, error } = await supabase
        .from("users")
        .select("favorites")
        .eq("id", user.id)
        .single();

      if (!error && data?.favorites) {
        setFavorites(data.favorites);
      }
    };

    fetchUserAndFavorites();
  }, []);

  // Fetch restaurant + reviews
  useEffect(() => {
    const fetchRestaurantData = async () => {
      setLoading(true);

      try {
        const [{ data: restaurantData, error: restaurantError }, { data: allergenData, error: allergenError }] = await Promise.all([
          supabase
            .from("restaurants")
            .select("id, name, location, place_type, hidden_allergens, associated_allergens")
            .eq("id", id)
            .single(),

          supabase
            .from("restaurant_allergen_summary")
            .select("allergen, safe_count, accommodating_count, unsafe_count")
            .eq("restaurant_id", id),
        ]);

        if (restaurantError || allergenError) {
          throw new Error(restaurantError?.message || allergenError?.message);
        }

        setRestaurant({
          ...restaurantData,
          allergenSummary: allergenData || [],
        });

        const { data: reviewData, error: reviewError } = await supabase
          .from("reviews")
          .select("*, users (username)")
          .eq("restaurant_id", id)
          .order("created_at", { ascending: false });

        if (reviewError) throw new Error(reviewError.message);

        setReviews(reviewData);
      } catch (err) {
        console.error("Error loading data:", err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRestaurantData();
  }, [id]);

  // Handle allergen tag click
  const toggleAllergen = (allergen) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen]
    );
  };

  // Derived data
  const isFavorited = useMemo(
    () => Array.isArray(favorites) && favorites.includes(id),
    [favorites, id]
  );

  const filteredSummary =
    selectedAllergens.length === 0
      ? restaurant?.allergenSummary
      : restaurant?.allergenSummary.filter((entry) =>
          selectedAllergens.includes(entry.allergen)
        );

  const filteredReviews =
    selectedAllergens.length === 0
      ? reviews
      : reviews.filter((review) =>
          (review.allergen_feedback || []).some((feedback) =>
            selectedAllergens.includes(feedback.allergen)
          )
        );

  // Render logic
  if (loading) return <p className="text-center p-4">Loading...</p>;
  if (!restaurant) return <p className="text-center p-4">Restaurant not found.</p>;

  return (
    <main className="w-full min-h-screen max-w-4xl mx-auto p-6">
      <StickyHeader title="Explore" />

      {/* Header */}
      <section className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-pink-800">{restaurant.name}</h1>
          <HeartButton
            restaurantId={restaurant.id}
            userId={user?.id}
            isFavorited={isFavorited}
            setFavorites={setFavorites}
          />
        </div>
        <p className="text-gray-700">{restaurant.location}</p>
        <p className="text-sm italic text-gray-500">{(restaurant.place_type || []).join(", ")}</p>
      </section>

      {/* Hidden Allergens */}
      <section className="mb-8">
        <p className="text-gray-700">{(restaurant.hidden_allergens || []).join(", ")}</p>
      </section>

      {/* Allergen Filter */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Filter by Allergen</h2>
        <div className="flex flex-wrap gap-3">
          {restaurant.associated_allergens?.map((allergen) => {
            const isSelected = selectedAllergens.includes(allergen);
            return (
              <button
                key={allergen}
                onClick={() => toggleAllergen(allergen)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                  isSelected
                    ? "bg-pink-300 text-emerald-700"
                    : "bg-pink-100 text-emerald-600 hover:bg-pink-200"
                }`}
              >
                {allergen}
              </button>
            );
          })}
        </div>
      </section>

      {/* Safety Summary */}
      {filteredSummary?.length > 0 && (
        <section className="mb-10">
          <AllergenSummary summary={filteredSummary} />
        </section>
      )}

      {/* Reviews */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">User Reviews</h2>
          <button
            onClick={() =>
              user
                ? navigate(
                    `/create?restaurantId=${restaurant.id}&name=${encodeURIComponent(
                      restaurant.name
                    )}&location=${encodeURIComponent(
                      restaurant.location
                    )}&place_type=${encodeURIComponent(
                      restaurant.place_type
                    )}`
                  )
                : toast.info("Please log in to add a review!")
            }
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            + Add Review
          </button>
        </div>

        {filteredReviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet matching this filter.</p>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default RestaurantPage;
