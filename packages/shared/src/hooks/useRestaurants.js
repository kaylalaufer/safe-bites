import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export const useRestaurants = (userId) => {
  const [restaurants, setRestaurants] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user favorites
  useEffect(() => {
    const fetchUserFavorites = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from("users")
        .select("favorites")
        .eq("id", userId)
        .single();

      if (!error && data?.favorites) {
        setFavorites(data.favorites);
      } else {
        setFavorites([]);
      }
    };

    fetchUserFavorites();
  }, [userId]);

  // Fetch restaurants after favorites are loaded
  useEffect(() => {
    if (!Array.isArray(favorites)) return;

    const fetchRestaurants = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("restaurants")
        .select(`
          id,
          name,
          location,
          lat,
          lng,
          place_type,
          associated_allergens,
          restaurant_allergen_summary (
            allergen,
            safe_count,
            accommodating_count,
            unsafe_count
          )
        `);

      if (error) {
        console.error("Error fetching restaurants:", error.message);
        return;
      }

      const enrichedData = data.map((restaurant) => {
        const allergenSummary = restaurant.restaurant_allergen_summary || [];

        const totalSafe = allergenSummary.reduce((sum, row) => sum + row.safe_count, 0);
        const totalAccommodating = allergenSummary.reduce((sum, row) => sum + row.accommodating_count, 0);
        const totalUnsafe = allergenSummary.reduce((sum, row) => sum + row.unsafe_count, 0);

        return {
          ...restaurant,
          totalSafe,
          totalAccommodating,
          totalUnsafe,
          isFavorited: Array.isArray(favorites) && favorites.includes(restaurant.id),
        };
      });

      const validMarkers = enrichedData.filter((r) => r.lat && r.lng);

      setMarkers(validMarkers);
      setRestaurants(enrichedData);
      setLoading(false);
    };

    fetchRestaurants();
  }, [favorites]);

  const toggleFavorite = async (restaurantId) => {
    if (!userId) return;

    const newFavorites = favorites.includes(restaurantId)
      ? favorites.filter(id => id !== restaurantId)
      : [...favorites, restaurantId];

    setFavorites(newFavorites);

    // Update in database
    const { error } = await supabase
      .from("users")
      .update({ favorites: newFavorites })
      .eq("id", userId);

    if (error) {
      console.error("Error updating favorites:", error);
      // Revert on error
      setFavorites(favorites);
    }
  };

  return {
    restaurants,
    markers,
    favorites,
    loading,
    toggleFavorite,
    setRestaurants,
    setMarkers
  };
};
