import { nextFavorites } from "../domain";

/**
 * Read-modify-write of users.favorites.
 * The database write is still last-write-wins. Two overlapping updates
 * can each read the same array, and the later write drops the other
 * favorite. This does not lock the row or append inside Postgres.
 */
export async function updateFavorite(supabase, userId, restaurantId) {
  const { data, error } = await supabase
    .from("users")
    .select("favorites")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return { data: null, error: error || { message: "Could not read favorites." } };
  }

  const favorites = data.favorites || [];
  const next = nextFavorites(favorites, restaurantId, favorites.includes(restaurantId));

  const { error: updateError } = await supabase
    .from("users")
    .update({ favorites: next })
    .eq("id", userId);

  if (updateError) return { data: null, error: updateError };

  return { data: next, error: null };
}
