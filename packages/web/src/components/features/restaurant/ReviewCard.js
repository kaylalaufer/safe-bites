import React from "react";

const PERSON_TYPE_LABELS = {
  adult: "Adult with allergies",
  parent: "Parent of child with allergies",
  college_student: "College student with allergies",
  child: "Child with allergies",
};

const ReviewCard = ({ review }) => {
  const username = review.users?.username || "Anonymous";
  const rawType = review.users?.person_type;
  const personType = PERSON_TYPE_LABELS[rawType] || rawType;

  return (
    <div className="border p-4 rounded shadow-sm bg-white">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-pink-700">{username}</span>
        <span className="text-sm text-gray-500">
          {new Date(review.created_at).toLocaleDateString()}
        </span>
      </div>

      {personType && (
        <p className="text-sm italic text-gray-500 mb-2">{personType}</p>
      )}

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