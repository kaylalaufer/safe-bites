import { normalizePlaceType } from "../domain";

/**
 * Posts a review as a sequence of separate Supabase calls, not one transaction.
 *
 * A restaurant lookup error is returned and no restaurant is inserted.
 * For an existing restaurant, hidden allergens, associated allergens, and
 * place_type are three separate updates. Those errors are not checked, so
 * one can fail and the later writes, including the review, still run. Those
 * array updates are last-write-wins, same as favorites.
 * A new restaurant insert can succeed and the review insert can then fail.
 * The restaurant row stays, the summary RPC is not called, and the restaurant
 * is not deleted.
 * If the review insert succeeds and increment_allergen_summary fails, the
 * review stays. The RPC error is returned as summaryError. Earlier RPC calls
 * are not undone, and later allergen rows are still attempted.
 */
export async function submitReview(supabase, input) {
  const {
    name,
    location,
    google_place_id,
    place_type,
    hidden_allergens,
    associated_allergens = [],
    lat,
    lng,
    userId,
    allergen_feedback = [],
    review_text,
  } = input;

  const { data: existingRestaurant, error: selectError } = await supabase
    .from("restaurants")
    .select("id, hidden_allergens, associated_allergens, place_type")
    .eq("name", name)
    .eq("location", location)
    .eq("google_place_id", google_place_id)
    .maybeSingle();

  if (selectError) {
    return { data: null, error: selectError, summaryError: null };
  }

  let restaurantId;

  if (existingRestaurant) {
    restaurantId = existingRestaurant.id;

    if (hidden_allergens) {
      const current = existingRestaurant.hidden_allergens || [];
      if (!current.includes(hidden_allergens)) {
        await supabase
          .from("restaurants")
          .update({ hidden_allergens: [...current, hidden_allergens] })
          .eq("id", restaurantId);
      }
    }

    const existingAssociated = existingRestaurant.associated_allergens || [];
    const mergedAllergens = Array.from(
      new Set([...existingAssociated, ...associated_allergens])
    );

    await supabase
      .from("restaurants")
      .update({ associated_allergens: mergedAllergens })
      .eq("id", restaurantId);

    const currentTypes = normalizePlaceType(existingRestaurant.place_type);
    const updatedTypes = Array.from(
      new Set([...currentTypes, ...normalizePlaceType(place_type)])
    );
    const typesChanged =
      updatedTypes.length !== currentTypes.length ||
      updatedTypes.some((type, index) => type !== currentTypes[index]);

    if (typesChanged) {
      await supabase
        .from("restaurants")
        .update({ place_type: updatedTypes })
        .eq("id", restaurantId);
    }
  } else {
    const { data: newRestaurant, error: insertError } = await supabase
      .from("restaurants")
      .insert([
        {
          name,
          location,
          place_type: normalizePlaceType(place_type),
          google_place_id,
          hidden_allergens: hidden_allergens ? [hidden_allergens] : [],
          associated_allergens,
          lat,
          lng,
        },
      ])
      .select()
      .single();

    if (insertError || !newRestaurant) {
      return {
        data: null,
        error: insertError || { message: "Restaurant insert did not return a row." },
        summaryError: null,
      };
    }

    restaurantId = newRestaurant.id;
  }

  const { error: reviewError } = await supabase.from("reviews").insert([
    {
      user_id: userId,
      restaurant_id: restaurantId,
      allergen_feedback,
      review_text,
    },
  ]);

  if (reviewError) {
    return { data: null, error: reviewError, summaryError: null };
  }

  let summaryError = null;

  for (const { allergen, category } of allergen_feedback) {
    const { error } = await supabase.rpc("increment_allergen_summary", {
      rest_id: restaurantId,
      allergen_name: allergen,
      column_name: `${category}_count`,
    });

    if (error && !summaryError) summaryError = error;
  }

  return { data: { restaurantId }, error: null, summaryError };
}
