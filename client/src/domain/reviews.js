export function buildAllergenFeedback({
  experience,
  allAllergensAffected,
  userAllergens = [],
  customAllergenFeedback = {},
}) {
  if (
    experience === "safe" ||
    allAllergensAffected === "yes" ||
    allAllergensAffected === "unsure"
  ) {
    return userAllergens.map((allergen) => ({
      allergen,
      category: experience,
    }));
  }

  if (allAllergensAffected === "no") {
    return Object.entries(customAllergenFeedback).map(([allergen, category]) => ({
      allergen,
      category,
    }));
  }

  return [];
}
