export function isWithinBounds(restaurant, bounds) {
  if (!bounds) return true;

  return (
    restaurant.lat >= bounds.south &&
    restaurant.lat <= bounds.north &&
    restaurant.lng >= bounds.west &&
    restaurant.lng <= bounds.east
  );
}

export function filterRestaurants(
  restaurants,
  { selectedAllergens = [], selectedType = "", mapBounds = null } = {}
) {
  return restaurants.filter((restaurant) => {
    const allergens = restaurant.associated_allergens || [];

    const matchesAllergens =
      selectedAllergens.length === 0 ||
      selectedAllergens.every((allergen) => allergens.includes(allergen));

    const types = restaurant.place_type || [];
    const matchesType = selectedType === "" || types.includes(selectedType);

    return matchesAllergens && matchesType && isWithinBounds(restaurant, mapBounds);
  });
}

export function safetyTotals(summary = []) {
  return {
    totalSafe: summary.reduce((sum, row) => sum + row.safe_count, 0),
    totalAccommodating: summary.reduce((sum, row) => sum + row.accommodating_count, 0),
    totalUnsafe: summary.reduce((sum, row) => sum + row.unsafe_count, 0),
  };
}

export function groupAllergenVotes(summary = []) {
  const votes = {};

  for (const entry of summary) {
    const { allergen, safe_count, accommodating_count, unsafe_count } = entry;

    if (safe_count > 0) {
      votes.safe = votes.safe || {};
      votes.safe[allergen] = safe_count;
    }
    if (accommodating_count > 0) {
      votes.accommodating = votes.accommodating || {};
      votes.accommodating[allergen] = accommodating_count;
    }
    if (unsafe_count > 0) {
      votes.unsafe = votes.unsafe || {};
      votes.unsafe[allergen] = unsafe_count;
    }
  }

  return votes;
}

export function withFavoriteFlag(restaurant, favorites) {
  return {
    ...restaurant,
    isFavorited: Array.isArray(favorites) && favorites.includes(restaurant.id),
  };
}

export function enrichRestaurant(restaurant, favorites) {
  const totals = safetyTotals(restaurant.restaurant_allergen_summary || []);
  return withFavoriteFlag({ ...restaurant, ...totals }, favorites);
}

export function normalizePlaceType(placeType) {
  if (placeType == null || placeType === "") return [];

  const values = Array.isArray(placeType) ? placeType : [placeType];

  return values.flat(Infinity).filter((value) => typeof value === "string" && value !== "");
}
