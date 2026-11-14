import fs from "fs";
import path from "path";
import { nextFavorites } from "../domain";
import { listRestaurants, updateFavorite } from "./index";

describe("data modules stay free of web imports", () => {
  const files = ["restaurants.js", "users.js", "index.js"];

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
