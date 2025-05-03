import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const Profile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("username, allergens, person_type")
        .eq("id", user.id)
        .single();

      if (!error) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, []);

  if (!profile) {
    return <div className="text-center mt-10">Loading profile...</div>;
  }

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-green-800">My Profile</h1>

      {/* User Info */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">User Info</h2>
        <p><strong>Username:</strong> {profile.username}</p>
        <div className="mt-2">
          <strong>Allergens:</strong>
          <ul className="list-disc ml-6">
            {profile.allergens?.map((allergen) => (
              <li key={allergen}>{allergen}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Saved Restaurants */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Saved Restaurants</h2>
        <p className="text-gray-600">Coming soon...</p>
      </section>

      {/* My Reviews */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">My Reviews</h2>
        <p className="text-gray-600">Coming soon...</p>
      </section>
    </main>
  );
};

export default Profile;
