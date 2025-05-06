import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { supabase } from "../supabaseClient";

const HeartButton = ({ restaurantId, userId, isFavorited, setFavorites }) => {
  const [localFavorited, setLocalFavorited] = useState(isFavorited);

  // Sync with parent prop if it changes
  useEffect(() => {
    setLocalFavorited(isFavorited);
  }, [isFavorited]);

  const toggleFavorite = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("favorites")
      .eq("id", userId)
      .single();

    if (error || !data) return;

    const currentFavs = data.favorites || [];
    const updatedFavs = localFavorited
      ? currentFavs.filter((id) => id !== restaurantId)
      : [...currentFavs, restaurantId];

    const { error: updateError } = await supabase
      .from("users")
      .update({ favorites: updatedFavs })
      .eq("id", userId);

    if (!updateError) {
      setLocalFavorited(!localFavorited);
      setFavorites?.(updatedFavs); // Update parent state if provided
    }
  };

  if (!userId) return null;

  return (
    <button onClick={toggleFavorite} title={localFavorited ? "Unfavorite" : "Favorite"}>
      <Heart
        className={`w-5 h-5 transition-all duration-150 ${
          localFavorited ? "fill-pink-500 text-pink-500" : "text-gray-400"
        } hover:scale-110`}
      />
    </button>
  );
};

export default HeartButton;
