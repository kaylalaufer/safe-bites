const RESTAURANT_LIST_COLUMNS = `
  id,
  name,
  location,
  lat,
  lng,
  place_type,
  associated_allergens,
  restaurant_allergen_summary (
    allergen,
    safe_count,
    accommodating_count,
    unsafe_count
  )
`;

export async function listRestaurants(supabase) {
  const { data, error } = await supabase.from("restaurants").select(RESTAURANT_LIST_COLUMNS);

  if (error) return { data: null, error };

  return { data: data ?? [], error: null };
}
