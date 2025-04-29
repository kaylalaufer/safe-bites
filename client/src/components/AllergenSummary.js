import { useState, useEffect } from "react";

const safetyCategories = ["safe", "accommodating", "unsafe"];
const categoryLabels = {
  safe: { label: "✅ Safe", color: "text-green-600" },
  accommodating: { label: "🟡 Accommodating", color: "text-yellow-500" },
  unsafe: { label: "❌ Unsafe", color: "text-red-600" },
};

const AllergenSummary = ({ summary }) => {
  const [expanded, setExpanded] = useState({
    safe: false,
    accommodating: false,
    unsafe: false,
  });

  useEffect(() => {
    // Auto-expand if very few allergens (like <3)
    const voteData = getVotes(summary);
    const totalItems = Object.values(voteData).reduce((acc, allergens) => acc + Object.keys(allergens || {}).length, 0);

    if (totalItems <= 3) {
      setExpanded({ safe: true, accommodating: true, unsafe: true });
    }
  }, [summary]);

  const toggle = (category) =>
    setExpanded((prev) => ({ ...prev, [category]: !prev[category] }));

  const getVotes = (summary = []) => {
    const voteMap = {};
  
    for (const entry of summary) {
      const { allergen, safe_count, accommodating_count, unsafe_count } = entry;
  
      if (safe_count > 0) {
        voteMap.safe = voteMap.safe || {};
        voteMap.safe[allergen] = safe_count;
      }
      if (accommodating_count > 0) {
        voteMap.accommodating = voteMap.accommodating || {};
        voteMap.accommodating[allergen] = accommodating_count;
      }
      if (unsafe_count > 0) {
        voteMap.unsafe = voteMap.unsafe || {};
        voteMap.unsafe[allergen] = unsafe_count;
      }
    }
  
    return voteMap;
  };

  const voteData = getVotes(summary);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Allergen Safety Summary</h3>

      {safetyCategories.map((category) => {
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
