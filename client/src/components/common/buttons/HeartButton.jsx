import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { supabase } from "../../../supabaseClient";
import { updateFavorite } from "../../../data";

const HeartButton = ({ restaurantId, userId, isFavorited, setFavorites }) => {
  const [localFavorited, setLocalFavorited] = useState(isFavorited);

  // Sync with parent prop if it changes
  useEffect(() => {
    setLocalFavorited(isFavorited);
  }, [isFavorited]);

  const toggleFavorite = async () => {
    const { data, error } = await updateFavorite(supabase, userId, restaurantId);

    if (error || !data) return;

    setLocalFavorited(data.includes(restaurantId));
    setFavorites?.(data);
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
