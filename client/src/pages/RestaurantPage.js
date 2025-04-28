import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import ReviewCard from "../components/ReviewCard";
import AllergenSummary from "../components/AllergenSummary";

const RestaurantPage = () => {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [reviews, setReviews] = useState([]); // ✅ instead of null
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRestaurant = async () => {
            const { data, error } = await supabase
            .from("restaurants")
            .select(`
                id, name, location, place_type, hidden_allergens, associated_allergens,
                restaurant_allergen_summary (
                  allergen,
                  safe_count,
                  accommodating_count,
                  unsafe_count
                )
              `)
              .eq("id", id)
              .single();

            if (error) {
                console.error("Error fetching restaurant:", error.message);
            } else {
                setRestaurant(data);
            }
            setLoading(false);
        };

        const fetchReviews = async () => {
          const { data, error } = await supabase
          .from("reviews")
          .select(`*,
            users (
            username)
            `)
            .eq("restaurant_id", id)
            .order("created_at", { ascending: false });
      
          if (error) {
            console.error("Error fetching reviews:", error.message);
          } else {
            setReviews(data); // You'll need to define `reviews` state
          }
        };
        

        if (id) {
          fetchRestaurant();
          fetchReviews();
        }
      }, [id]);

    if (loading) return<p className="text-center p-4">Loading...</p>;
    if (!restaurant) return <p className="text-center p-4">Restaurant not found.</p>;
  
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold text-pink-800 mb-1">{restaurant.name}</h1>
          <p className="text-gray-600">{restaurant.location}</p>
          <p className="text-sm text-gray-500 italic">{(restaurant.place_type || []).join(", ")}</p>
        </div>
    
        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Hidden Allergens</h2>
            <p className="text-sm text-gray-700">
              {restaurant.hidden_allergens?.length > 0
                ? restaurant.hidden_allergens.join(", ")
                : "None reported"}
            </p>
          </div>
    
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Associated Allergens</h2>
            <p className="text-sm text-gray-700">
              {restaurant.associated_allergens?.length > 0
                ? restaurant.associated_allergens.join(", ")
                : "Not available"}
            </p>
          </div>
        </div>
    
        {/* Allergen Safety Breakdown */}
        <AllergenSummary summary={restaurant.restaurant_allergen_summary_by_allergen} />

        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">User Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet for this restaurant.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </div>
    );    
  };
  
  export default RestaurantPage;  