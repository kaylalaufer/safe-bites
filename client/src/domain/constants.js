export const ALLERGENS = [
  "Peanut",
  "Tree Nut",
  "Gluten",
  "Wheat",
  "Eggs",
  "Milk",
  "Sesame",
  "Soy",
  "Fish",
  "Shellfish",
];

export const RESTAURANT_TYPES = [
  "Bakery",
  "Ice Cream",
  "Boba",
  "Cafe",
  "Fast Food",
  "Diner",
  "Casual Dining",
  "Fine Dining",
  "Vegan",
  "Vegetarian",
  "Italian",
  "Seafood",
  "Pizza",
  "BBQ",
  "Mexican",
  "Indian",
  "Asian",
  "Mediterranean",
];

export const PERSON_TYPES = [
  { value: "adult", label: "Adult with allergies" },
  { value: "parent", label: "Parent of child with allergies" },
  { value: "college_student", label: "College student with allergies" },
  { value: "child", label: "Child with allergies" },
];

export const PERSON_TYPE_LABELS = PERSON_TYPES.reduce((labels, type) => {
  labels[type.value] = type.label;
  return labels;
}, {});

export const SAFETY_CATEGORIES = ["safe", "accommodating", "unsafe"];

export const SAFETY_LABELS = {
  safe: "Safe",
  accommodating: "Accommodating",
  unsafe: "Unsafe",
};
