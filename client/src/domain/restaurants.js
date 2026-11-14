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
