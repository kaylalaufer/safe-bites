import { ALLERGENS } from "../../../domain";

const AllergenPicker = ({ selected = [], onToggle }) => {
  return (
    <div>
      <h3 className="font-medium mb-2">Select Allergens:</h3>
      <div className="flex flex-wrap gap-2">
        {ALLERGENS.map((allergen) => (
          <button
            key={allergen}
            type="button"
            onClick={() => onToggle(allergen)}
            className={`px-3 py-1 rounded-full border ${
              selected.includes(allergen)
                ? "bg-pink-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            {allergen}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AllergenPicker;
