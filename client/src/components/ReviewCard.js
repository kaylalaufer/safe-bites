import React from "react";

const ReviewCard = ({ review }) => {
  return (
    <div className="border p-4 rounded shadow-sm bg-white">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-pink-700">
          {review.users?.username || "Anonymous"}
        </span>
        <span className="text-sm text-gray-500">
          {new Date(review.created_at).toLocaleDateString()}
        </span>
      </div>

      <p className="text-gray-800">{review.review_text}</p>

      {review.allergen_feedback?.length > 0 && (
        <div className="text-sm mt-2 flex flex-wrap gap-2">
          {review.allergen_feedback.map((item, index) => (
            <span
              key={index}
              className={`inline-block px-2 py-1 rounded-full text-white text-xs ${
                item.category === "safe"
                  ? "bg-green-600"
                  : item.category === "accommodating"
                  ? "bg-yellow-500"
                  : "bg-red-600"
              }`}
            >
              {item.allergen}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
