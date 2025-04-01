import React from "react";

const RestaurantCard = ({ restaurant }) => {
    return (
        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
            {/* Restaurant Name & Location */}
            <h3 className="text-lg font-semibold">{restaurant.name}</h3>
            <p className="text-gray-600">{restaurant.location}</p>

            {/* Allergen Info */}
            <p className="text-sm text-gray-700">
                <strong>Allergens:</strong> {(restaurant.associated_allergens || []).join(", ")}
            </p>

            {/* Safety Ratings (Safe / Accommodating / Unsafe Votes) */}
            <div className="flex items-center gap-4 mt-3">
                <div className="text-green-600 font-semibold flex items-center">
                    🟢 Safe: {restaurant.safe_count ?? 0}
                </div>
                <div className="text-yellow-600 font-semibold flex items-center">
                    🟡 Accommodating: {restaurant.accommodating_count ?? 0}
                </div>
                <div className="text-red-600 font-semibold flex items-center">
                    🔴 Unsafe: {restaurant.unsafe_count ?? 0}
                </div>
            </div>
        </div>
    );
};

export default RestaurantCard;