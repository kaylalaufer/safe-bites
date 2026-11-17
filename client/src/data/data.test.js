import fs from "fs";
import path from "path";
import { nextFavorites } from "../domain";
import { listRestaurants, submitReview, updateFavorite, updateProfile } from "./index";

describe("data modules stay free of web imports", () => {
  const files = ["restaurants.js", "reviews.js", "users.js", "index.js"];

  test.each(files)("%s does not import React, the app Supabase client, or browser APIs", (file) => {
    const source = fs.readFileSync(path.join(__dirname, file), "utf8");

    expect(source).not.toMatch(/from ["']react/);
    expect(source).not.toMatch(/supabaseClient/);
    expect(source).not.toMatch(/from ["'].*\/(components|pages)\//);
    expect(source).not.toMatch(/\bwindow\b/);
    expect(source).not.toMatch(/sessionStorage/);
    expect(source).not.toMatch(/\bdocument\b/);
  });
});

function restaurantClient(result) {
  return {
    from(table) {
      if (table !== "restaurants") {
        throw new Error(`Unexpected table ${table}`);
      }

      return {
        select: () => Promise.resolve(result),
      };
    },
  };
}

function favoritesClient({ read, updateResult }) {
  const calls = { updates: [] };

  return {
    calls,
    from(table) {
      if (table !== "users") {
        throw new Error(`Unexpected table ${table}`);
      }

      return {
        select() {
          return {
            eq() {
              return {
                single: () => Promise.resolve(read),
              };
            },
          };
        },
        update(payload) {
          calls.updates.push(payload);
          return {
            eq: () => Promise.resolve(updateResult),
          };
        },
      };
    },
  };
}

describe("listRestaurants", () => {
  test("returns rows on success", async () => {
    const rows = [{ id: "r1", name: "The Donut Pub" }];
    const result = await listRestaurants(restaurantClient({ data: rows, error: null }));

    expect(result).toEqual({ data: rows, error: null });
  });

  test("returns a null list and the error when the database fails", async () => {
    const error = { message: "connection failed" };

    await expect(
      listRestaurants(restaurantClient({ data: null, error }))
    ).resolves.toEqual({ data: null, error });
  });
});

describe("updateFavorite", () => {
  test("does not write when the favorites read fails", async () => {
    const error = { message: "read failed" };
    const client = favoritesClient({
      read: { data: null, error },
      updateResult: { error: null },
    });

    const result = await updateFavorite(client, "user-1", "r1");

    expect(result).toEqual({ data: null, error });
    expect(client.calls.updates).toEqual([]);
  });

  test("returns the update error and does not report a new list", async () => {
    const updateError = { message: "write failed" };
    const client = favoritesClient({
      read: { data: { favorites: ["r1"] }, error: null },
      updateResult: { error: updateError },
    });

    const result = await updateFavorite(client, "user-1", "r2");

    expect(result).toEqual({ data: null, error: updateError });
    expect(result.data).toBeNull();
  });

  test("adds a favorite and returns the list from nextFavorites", async () => {
    const current = ["r1"];
    const client = favoritesClient({
      read: { data: { favorites: current }, error: null },
      updateResult: { error: null },
    });

    const result = await updateFavorite(client, "user-1", "r2");
    const expected = nextFavorites(current, "r2", false);

    expect(result).toEqual({ data: expected, error: null });
    expect(client.calls.updates).toEqual([{ favorites: expected }]);
  });

  test("removes a favorite and returns the list from nextFavorites", async () => {
    const current = ["r1", "r2"];
    const client = favoritesClient({
      read: { data: { favorites: current }, error: null },
      updateResult: { error: null },
    });

    const result = await updateFavorite(client, "user-1", "r2");
    const expected = nextFavorites(current, "r2", true);

    expect(result).toEqual({ data: expected, error: null });
    expect(client.calls.updates).toEqual([{ favorites: expected }]);
  });
});

function profileClient(updateResult) {
  const calls = { updates: [], ids: [] };

  return {
    calls,
    from(table) {
      if (table !== "users") {
        throw new Error(`Unexpected table ${table}`);
      }

      return {
        update(payload) {
          calls.updates.push(payload);
          return {
            eq(_column, id) {
              calls.ids.push(id);
              return Promise.resolve(updateResult);
            },
          };
        },
      };
    },
  };
}

describe("updateProfile", () => {
  const payload = {
    id: "user-1",
    username: "kayla",
    allergens: ["Peanut"],
    person_type: "adult",
    favorites: ["r1"],
    location: "New York",
    lat: 40.7,
    lng: -74,
  };

  test("writes only username, allergens, and person_type", async () => {
    const client = profileClient({ error: null });

    const result = await updateProfile(client, "user-1", payload);

    expect(client.calls.updates).toEqual([
      { username: "kayla", allergens: ["Peanut"], person_type: "adult" },
    ]);
    expect(client.calls.ids).toEqual(["user-1"]);
    expect(result).toEqual({
      data: { username: "kayla", allergens: ["Peanut"], person_type: "adult" },
      error: null,
    });
  });

  test("returns a null result and the error when the update fails", async () => {
    const error = { message: "write failed" };
    const client = profileClient({ error });

    const result = await updateProfile(client, "user-1", payload);

    expect(result).toEqual({ data: null, error });
  });
});

function reviewClient({
  restaurantSelect,
  restaurantInsert = { data: { id: "r-new" }, error: null },
  reviewInsert = { error: null },
  rpcResults = [],
} = {}) {
  const calls = {
    restaurantInserts: [],
    restaurantUpdates: [],
    reviewInserts: [],
    rpcs: [],
  };
  let rpcIndex = 0;

  return {
    calls,
    from(table) {
      return {
        select() {
          return {
            eq() {
              return this;
            },
            maybeSingle: () => Promise.resolve(restaurantSelect),
          };
        },
        update(payload) {
          calls.restaurantUpdates.push(payload);
          return {
            eq: () => Promise.resolve({ error: null }),
          };
        },
        insert(payload) {
          if (table === "restaurants") {
            calls.restaurantInserts.push(payload);
            return {
              select() {
                return {
                  single: () => Promise.resolve(restaurantInsert),
                };
              },
            };
          }

          if (table === "reviews") {
            calls.reviewInserts.push(payload);
            return Promise.resolve(reviewInsert);
          }

          throw new Error(`Unexpected insert ${table}`);
        },
      };
    },
    rpc(name, args) {
      calls.rpcs.push({ name, args });
      const result = rpcResults[rpcIndex] ?? { error: null };
      rpcIndex += 1;
      return Promise.resolve(result);
    },
  };
}

const reviewInput = {
  name: "The Donut Pub",
  location: "New York",
  google_place_id: "place-1",
  place_type: [["Cafe"]],
  hidden_allergens: "",
  associated_allergens: ["Peanut"],
  lat: 40.7,
  lng: -74,
  userId: "user-1",
  allergen_feedback: [
    { allergen: "Peanut", category: "safe" },
    { allergen: "Milk", category: "unsafe" },
    { allergen: "Soy", category: "accommodating" },
  ],
  review_text: "Careful with the fryer.",
};

describe("submitReview", () => {
  test("does not insert a restaurant when the lookup fails", async () => {
    const error = { message: "select failed" };
    const client = reviewClient({
      restaurantSelect: { data: null, error },
    });

    const result = await submitReview(client, reviewInput);

    expect(result).toEqual({ data: null, error, summaryError: null });
    expect(client.calls.restaurantInserts).toEqual([]);
    expect(client.calls.reviewInserts).toEqual([]);
    expect(client.calls.rpcs).toEqual([]);
  });

  test("returns a review insert error and does not increment the summary", async () => {
    const error = { message: "review failed" };
    const client = reviewClient({
      restaurantSelect: { data: null, error: null },
      reviewInsert: { error },
    });

    const result = await submitReview(client, reviewInput);

    expect(result).toEqual({ data: null, error, summaryError: null });
    expect(client.calls.restaurantInserts).toHaveLength(1);
    expect(client.calls.reviewInserts).toHaveLength(1);
    expect(client.calls.rpcs).toEqual([]);
  });

  test("writes a flat place_type array for a new restaurant", async () => {
    const client = reviewClient({
      restaurantSelect: { data: null, error: null },
    });

    await submitReview(client, reviewInput);

    expect(client.calls.restaurantInserts[0][0].place_type).toEqual(["Cafe"]);
  });

  test("returns the saved review and a separate summary error", async () => {
    const summaryError = { message: "rpc failed" };
    const client = reviewClient({
      restaurantSelect: {
        data: {
          id: "r1",
          hidden_allergens: [],
          associated_allergens: ["Peanut"],
          place_type: ["Cafe"],
        },
        error: null,
      },
      rpcResults: [{ error: null }, { error: summaryError }, { error: null }],
    });

    const result = await submitReview(client, reviewInput);

    expect(result).toEqual({
      data: { restaurantId: "r1" },
      error: null,
      summaryError,
    });
    expect(client.calls.restaurantInserts).toEqual([]);
    expect(client.calls.rpcs.map((call) => call.args.allergen_name)).toEqual([
      "Peanut",
      "Milk",
      "Soy",
    ]);
    expect(client.calls.rpcs[0]).toEqual({
      name: "increment_allergen_summary",
      args: {
        rest_id: "r1",
        allergen_name: "Peanut",
        column_name: "safe_count",
      },
    });
    expect(client.calls.rpcs[2].args).toEqual({
      rest_id: "r1",
      allergen_name: "Soy",
      column_name: "accommodating_count",
    });
  });
});
