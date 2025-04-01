import React from "react";
import { supabase } from "../supabaseClient";

const TestDataInsert = () => {
  const insertTestData = async () => {
    const { error } = await supabase.from("restaurants").insert([
      {
        name: "Safe Haven Cafe",
        location: "New York, NY",
        place_type: "Cafe",
        hidden_allergens: ["Peanuts"],
        associated_allergens: ["Peanuts", "Dairy"],
        safe_count: 7,
        accommodating_count: 3,
        unsafe_count: 0,
      },
      {
        name: "Allergy-Free Eats",
        location: "Queens, NY",
        place_type: "Bakery",
        hidden_allergens: ["Gluten", "Milk"],
        associated_allergens: ["Milk", "Eggs"],
        safe_count: 5,
        accommodating_count: 2,
        unsafe_count: 1,
      },
    ]);

    if (error) {
      console.error("Insert failed:", error.message);
    } else {
      alert("Test data inserted successfully!");
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={insertTestData}
        className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
      >
        Insert Test Restaurant Data
      </button>
    </div>
  );
};

export default TestDataInsert;
