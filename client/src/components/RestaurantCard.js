import React from "react";
import { Link } from "react-router-dom";

const RestaurantCard = ({ restaurant }) => {
  const summary = restaurant.restaurant_allergen_summary || [];

  const safeAllergens = summary
    .filter((r) => r.safe_count > 0)
    .map((r) => r.allergen);

  const accommodatingAllergens = summary
    .filter((r) => r.accommodating_count > 0)
    .map((r) => r.allergen);

  const unsafeAllergens = summary
    .filter((r) => r.unsafe_count > 0)
    .map((r) => r.allergen);

  const formatTooltip = (list) => (list.length ? list.join(", ") : "");

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">

      <Link to={`/restaurant/${restaurant.id}`}>
        {/* Name & Location */}
        <h3 className="text-lg font-semibold">{restaurant.name}</h3>
        <p className="text-gray-600">{restaurant.location}</p>
      </Link>
      
      {/* Allergens */}
      <p className="text-sm text-gray-700">
        <strong>Allergens:</strong>{" "}
        {(restaurant.associated_allergens || []).join(", ")}
      </p>

      {/* Safety Ratings with Hover Tooltips */}
      <div className="flex items-center gap-4 mt-3">
        <div className="text-green-600 font-semibold flex items-center relative group">
            🟢 Safe:{" "}
            {
                summary.reduce((sum, r) => sum + (r.safe_count || 0), 0)
            }
            {safeAllergens.length > 0 && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white text-sm text-gray-700 border rounded shadow-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                {formatTooltip(safeAllergens)}
                </div>
            )}
        </div>

        <div className="text-yellow-600 font-semibold flex items-center relative group">
          🟡 Accommodating:{" "}
          {
            summary.reduce((sum, r) => sum + (r.accommodating_count || 0), 0)
          }
          {accommodatingAllergens.length > 0 && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white text-sm text-gray-700 border rounded shadow-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                {formatTooltip(accommodatingAllergens)}
                </div>
            )}
        </div>

        <div className="text-red-600 font-semibold flex items-center relative group">
          🔴 Unsafe:{" "}
          {
            summary.reduce((sum, r) => sum + (r.unsafe_count || 0), 0)
          }
          {unsafeAllergens.length > 0 && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white text-sm text-gray-700 border rounded shadow-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                {formatTooltip(unsafeAllergens)}
                </div>
            )}
        </div>
      </div>
    </div>
    
  );
};

export default RestaurantCard;
