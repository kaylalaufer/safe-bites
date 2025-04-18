import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

const RestaurantPage = () => {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
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

        fetchRestaurant();
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
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Allergen Safety Breakdown</h2>
          <div className="space-y-3">
            {restaurant.restaurant_allergen_summary?.map((item) => (
              <div key={item.allergen} className="flex items-center justify-between bg-gray-50 p-3 rounded shadow-sm">
                <span className="font-medium text-gray-800">{item.allergen}</span>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600">✅ {item.safe_count}</span>
                  <span className="text-yellow-600">🟡 {item.accommodating_count}</span>
                  <span className="text-red-600">❌ {item.unsafe_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );    
  };
  
  export default RestaurantPage;  