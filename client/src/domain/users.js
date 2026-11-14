export function validateProfile({ username, personType, location, lat, lng } = {}) {
  if (username == null || String(username).trim() === "") {
    return { ok: false, message: "Username is required." };
  }

  if (personType == null || String(personType).trim() === "") {
    return { ok: false, message: "Please select your allergy type." };
  }

  if (!location || lat == null || lng == null) {
    return { ok: false, message: "Please select your location from the suggestions." };
  }

  return { ok: true, message: "" };
}

export function pickProfileUpdate(profile) {
  return {
    username: profile.username,
    allergens: profile.allergens,
    person_type: profile.person_type,
  };
}

export function hasProfileRow(row) {
  return Boolean(row);
}

export function canPostReview({ user, isGuest }) {
  return Boolean(user) && !isGuest;
}

/**
 * Pure snapshot of the favorites list after one toggle.
 * This does not make the database write atomic. Two overlapping
 * read-modify-write updates can still drop a favorite.
 */
export function nextFavorites(favorites, restaurantId, isFavorited) {
  const current = favorites || [];

  return isFavorited
    ? current.filter((id) => id !== restaurantId)
    : [...current, restaurantId];
}
