import { useState } from "react";
import { SAFETY_CATEGORIES, groupAllergenVotes } from "../../../domain";

const categoryLabels = {
  safe: { label: "✅ Safe", color: "text-green-600" },
  accommodating: { label: "🟡 Accommodating", color: "text-yellow-500" },
  unsafe: { label: "❌ Unsafe", color: "text-red-600" },
};

function voteKey(votes) {
  return JSON.stringify(votes);
}

function openSections(totalItems) {
  const open = totalItems <= 3;
  return { safe: open, accommodating: open, unsafe: open };
}

function voteItemCount(votes) {
  return Object.values(votes).reduce((count, allergens) => count + Object.keys(allergens).length, 0);
}

const AllergenSummary = ({ summary }) => {
  const voteData = groupAllergenVotes(summary);
  const nextKey = voteKey(voteData);
  const totalItems = voteItemCount(voteData);
  const [expanded, setExpanded] = useState(() => openSections(totalItems));
  const [seenKey, setSeenKey] = useState(nextKey);

  // A new array with the same votes is not a new summary. Re-open short
  // summaries only when the grouped contents change, so a parent render
  // cannot retrigger this update.
  if (seenKey !== nextKey) {
    setSeenKey(nextKey);
    if (totalItems <= 3) {
      setExpanded(openSections(totalItems));
    }
  }

  const toggle = (category) =>
    setExpanded((prev) => ({ ...prev, [category]: !prev[category] }));

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Allergen Safety Summary</h3>

      {SAFETY_CATEGORIES.map((category) => {
        const votes = voteData[category];
        if (!votes || Object.keys(votes).length === 0) return null;

        const total = Object.values(votes).reduce((sum, n) => sum + n, 0);

        return (
          <div key={category} className="mb-3">
            <button
              className={`font-semibold ${categoryLabels[category].color} hover:underline`}
              onClick={() => toggle(category)}
            >
              {categoryLabels[category].label}: {total}
            </button>

            {expanded[category] && (
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(votes).map(([allergen, count]) => (
                  <div
                    key={allergen}
                    className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm"
                  >
                    {allergen} ({count})
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AllergenSummary;
