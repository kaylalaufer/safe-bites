import fs from "fs";
import path from "path";
import {
  ALLERGENS,
  PERSON_TYPE_LABELS,
  RESTAURANT_TYPES,
  SAFETY_LABELS,
} from "./constants";
import {
  enrichRestaurant,
  filterRestaurants,
  isWithinBounds,
  normalizePlaceType,
  safetyTotals,
} from "./restaurants";
import { buildAllergenFeedback } from "./reviews";
import {
  canPostReview,
  hasProfileRow,
  nextFavorites,
  pickProfileUpdate,
  validateProfile,
} from "./users";

const bounds = { north: 41, south: 40, east: -73, west: -75 };

function restaurant(overrides = {}) {
  return {
    id: "r1",
    associated_allergens: ["Peanut"],
    place_type: ["Cafe"],
    lat: 40.7,
    lng: -74,
    ...overrides,
  };
}

describe("domain modules stay free of platform imports", () => {
  const files = ["constants.js", "restaurants.js", "reviews.js", "users.js", "index.js"];

  test.each(files)("%s does not import React, Supabase, or browser APIs", (file) => {
    const source = fs.readFileSync(path.join(__dirname, file), "utf8");

    expect(source).not.toMatch(/from ["']react/);
    expect(source).not.toMatch(/supabase/i);
    expect(source).not.toMatch(/\bwindow\b/);
    expect(source).not.toMatch(/sessionStorage/);
    expect(source).not.toMatch(/document/);
  });
});

describe("filterRestaurants", () => {
  const restaurants = [
    restaurant(),
    restaurant({
      id: "r2",
      associated_allergens: ["Peanut", "Milk"],
      place_type: ["Bakery"],
      lat: 40.2,
      lng: -74.2,
    }),
    restaurant({
      id: "r3",
      associated_allergens: [],
      place_type: ["Cafe"],
      lat: 42,
      lng: -74,
    }),
  ];

  test("returns every restaurant when no filters or bounds are set", () => {
    expect(filterRestaurants(restaurants)).toHaveLength(3);
  });

  test("requires every selected allergen", () => {
    const matches = filterRestaurants(restaurants, { selectedAllergens: ["Peanut", "Milk"] });

    expect(matches.map((item) => item.id)).toEqual(["r2"]);
  });

  test("treats a missing allergen list as empty", () => {
    const matches = filterRestaurants(
      [restaurant({ associated_allergens: undefined })],
      { selectedAllergens: ["Peanut"] }
    );

    expect(matches).toEqual([]);
  });

  test("matches the selected restaurant type", () => {
    const matches = filterRestaurants(restaurants, { selectedType: "Bakery" });

    expect(matches.map((item) => item.id)).toEqual(["r2"]);
  });

  test("treats a missing place type list as empty", () => {
    const matches = filterRestaurants(
      [restaurant({ place_type: undefined })],
      { selectedType: "Cafe" }
    );

    expect(matches).toEqual([]);
  });

  test("keeps restaurants inside the bounds, including the edges", () => {
    const onEdge = restaurant({ id: "edge", lat: 40, lng: -73 });
    const outside = restaurant({ id: "out", lat: 39.9, lng: -74 });
    const matches = filterRestaurants([onEdge, outside], { mapBounds: bounds });

    expect(matches.map((item) => item.id)).toEqual(["edge"]);
  });

  test("combines allergen, type, and bounds checks", () => {
    const matches = filterRestaurants(restaurants, {
      selectedAllergens: ["Peanut"],
      selectedType: "Cafe",
      mapBounds: bounds,
    });

    expect(matches.map((item) => item.id)).toEqual(["r1"]);
  });
});

describe("isWithinBounds", () => {
  test("matches everything when bounds are missing", () => {
    expect(isWithinBounds(restaurant({ lat: undefined, lng: undefined }), null)).toBe(true);
  });

  test("rejects a restaurant outside the box", () => {
    expect(isWithinBounds(restaurant({ lng: -70 }), bounds)).toBe(false);
  });
});

describe("safetyTotals", () => {
  test("sums each safety column", () => {
    expect(
      safetyTotals([
        { safe_count: 2, accommodating_count: 1, unsafe_count: 0 },
        { safe_count: 1, accommodating_count: 0, unsafe_count: 4 },
      ])
    ).toEqual({
      totalSafe: 3,
      totalAccommodating: 1,
      totalUnsafe: 4,
    });
  });

  test("returns zeros for an empty summary", () => {
    expect(safetyTotals()).toEqual({
      totalSafe: 0,
      totalAccommodating: 0,
      totalUnsafe: 0,
    });
  });
});

describe("enrichRestaurant", () => {
  test("adds totals and the favorite flag", () => {
    const enriched = enrichRestaurant(
      restaurant({
        restaurant_allergen_summary: [{ safe_count: 2, accommodating_count: 0, unsafe_count: 1 }],
      }),
      ["r1"]
    );

    expect(enriched.totalSafe).toBe(2);
    expect(enriched.totalUnsafe).toBe(1);
    expect(enriched.isFavorited).toBe(true);
  });

  test("leaves a restaurant unfavorited when the list is missing", () => {
    expect(enrichRestaurant(restaurant(), null).isFavorited).toBe(false);
  });
});

describe("normalizePlaceType", () => {
  test.each([
    [null, []],
    ["", []],
    ["Cafe", ["Cafe"]],
    [["Cafe"], ["Cafe"]],
    [[["Cafe"]], ["Cafe"]],
    [["Cafe", "Bakery"], ["Cafe", "Bakery"]],
    [["Cafe", ""], ["Cafe"]],
  ])("flattens %j to %j", (input, expected) => {
    expect(normalizePlaceType(input)).toEqual(expected);
  });
});

describe("buildAllergenFeedback", () => {
  const userAllergens = ["Peanut", "Milk"];

  test("uses every profile allergen when the experience is safe", () => {
    expect(
      buildAllergenFeedback({
        experience: "safe",
        allAllergensAffected: "no",
        userAllergens,
        customAllergenFeedback: { Peanut: "unsafe" },
      })
    ).toEqual([
      { allergen: "Peanut", category: "safe" },
      { allergen: "Milk", category: "safe" },
    ]);
  });

  test("uses the experience category when all allergens were affected", () => {
    expect(
      buildAllergenFeedback({
        experience: "accommodating",
        allAllergensAffected: "yes",
        userAllergens,
      })
    ).toEqual([
      { allergen: "Peanut", category: "accommodating" },
      { allergen: "Milk", category: "accommodating" },
    ]);
  });

  test("uses the experience category when the answer is unsure", () => {
    expect(
      buildAllergenFeedback({
        experience: "unsafe",
        allAllergensAffected: "unsure",
        userAllergens: ["Soy"],
      })
    ).toEqual([{ allergen: "Soy", category: "unsafe" }]);
  });

  test("uses the custom per-allergen categories when only some were affected", () => {
    expect(
      buildAllergenFeedback({
        experience: "unsafe",
        allAllergensAffected: "no",
        userAllergens,
        customAllergenFeedback: { Peanut: "unsafe", Milk: "safe" },
      })
    ).toEqual([
      { allergen: "Peanut", category: "unsafe" },
      { allergen: "Milk", category: "safe" },
    ]);
  });
});

describe("pickProfileUpdate", () => {
  test("keeps only username, allergens, and person type", () => {
    expect(
      pickProfileUpdate({
        id: "user-1",
        username: "kayla",
        allergens: ["Peanut"],
        person_type: "adult",
        favorites: ["r1"],
        lat: 40.7,
        lng: -74,
        location: "New York",
      })
    ).toEqual({
      username: "kayla",
      allergens: ["Peanut"],
      person_type: "adult",
    });
  });
});

describe("validateProfile", () => {
  const valid = {
    username: "kayla",
    personType: "adult",
    location: "New York",
    lat: 40.7,
    lng: -74,
  };

  test("accepts a complete profile, including a zero coordinate", () => {
    expect(validateProfile({ ...valid, lat: 0, lng: 0 })).toEqual({ ok: true, message: "" });
  });

  test("requires a username", () => {
    expect(validateProfile({ ...valid, username: "   " })).toEqual({
      ok: false,
      message: "Username is required.",
    });
  });

  test("requires an allergy type", () => {
    expect(validateProfile({ ...valid, personType: "" })).toEqual({
      ok: false,
      message: "Please select your allergy type.",
    });
  });

  test("requires a suggested location", () => {
    expect(validateProfile({ ...valid, lat: null })).toEqual({
      ok: false,
      message: "Please select your location from the suggestions.",
    });
  });
});

describe("canPostReview", () => {
  test("allows a signed-in user", () => {
    expect(canPostReview({ user: { id: "user-1" }, isGuest: false })).toBe(true);
  });

  test("blocks a guest", () => {
    expect(canPostReview({ user: null, isGuest: true })).toBe(false);
  });

  test("blocks an anonymous visitor", () => {
    expect(canPostReview({ user: null, isGuest: false })).toBe(false);
  });
});

describe("hasProfileRow", () => {
  test("treats a stub users row as a profile", () => {
    expect(hasProfileRow({ id: "user-1", username: "kayla", allergens: [], person_type: "adult" })).toBe(
      true
    );
  });

  test("treats a missing row as incomplete", () => {
    expect(hasProfileRow(null)).toBe(false);
    expect(hasProfileRow(undefined)).toBe(false);
  });
});

describe("nextFavorites", () => {
  test("adds a restaurant id", () => {
    expect(nextFavorites(["r1"], "r2", false)).toEqual(["r1", "r2"]);
  });

  test("removes a restaurant id", () => {
    expect(nextFavorites(["r1", "r2"], "r1", true)).toEqual(["r2"]);
  });

  test("treats a missing list as empty", () => {
    expect(nextFavorites(null, "r1", false)).toEqual(["r1"]);
  });
});

describe("shared lists", () => {
  test("keeps the stored allergen, type, and safety strings", () => {
    expect(ALLERGENS).toContain("Tree Nut");
    expect(RESTAURANT_TYPES).toContain("Casual Dining");
    expect(PERSON_TYPE_LABELS.college_student).toBe("College student with allergies");
    expect(SAFETY_LABELS).toEqual({
      safe: "Safe",
      accommodating: "Accommodating",
      unsafe: "Unsafe",
    });
  });
});
