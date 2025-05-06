//bg-[#23443D]

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import StickyHeader from "../components/StickyHeader";
import FloatingCreateButton from "../components/FloatingCreateButton";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
  const navigate = useNavigate();
  const [myReviews, setmyReviews] = useState([]);
  const [openSections, setOpenSections] = useState({});


  const toggleSection = (restaurantId) => {
    setOpenSections((prev) => ({
      ...prev,
      [restaurantId]: !prev[restaurantId],
    }));
  };    

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("username, allergens, favorites, person_type")
        .eq("id", user.id)
        .single();

      if (!error) {
        setProfile(data);

        // Fetch restaurants from the favorites array
        if (data.favorites && data.favorites.length > 0) {
          const { data: restaurants, error: restError } = await supabase
            .from("restaurants")
            .select("id, name, location")
            .in("id", data.favorites);

          if (!restError) {
            setFavoriteRestaurants(restaurants);
          }
        }
      }

      const { data: reviews, error: review_error } = await supabase
        .from("reviews")
        .select(`
          id,
          user_id,
          restaurant_id,
          review_text,
          allergen_feedback,
          restaurant:restaurant_id (
            id,
            name,
            location
          )
        `)
        .eq("user_id", user.id);

        if (reviews && !review_error) {
          const grouped = {};
        
          for (const review of reviews) {
            const restId = review.restaurant.id;
        
            if (!grouped[restId]) {
              grouped[restId] = {
                restaurant: review.restaurant,
                reviews: []
              };
            }
        
            grouped[restId].reviews.push(review);
          }
        
          setmyReviews(grouped); // This becomes an object grouped by restaurant

 
      } else {
        setmyReviews([]); // fallback to prevent undefined
      }
        
    };

    fetchProfile();
  }, []);

  if (!profile) {
    return <div className="text-center mt-10">Loading profile...</div>;
  }
  

  return (
    <main className="w-full min-h-screen max-w-4xl mx-auto p-6">
      <StickyHeader title="Explore" />
      {/* Profile Header */}
      <div className="text-center mt-6">
        <div className="bg-[#8e445c] w-28 h-28 rounded-full mx-auto flex items-center justify-center text-white font-bold text-sm">
          User<br />profile<br />pic
        </div>
        <h2 className="mt-4 text-xl font-bold">@{profile.username}</h2>
        <p className="mt-2 text-sm text-gray-600">Allergies: {profile.allergens?.join(", ") || "None"}</p>
        <p className="text-sm text-gray-500">Person Type: {profile.person_type}</p>
      </div>

      {/* Favorites + Reviews */}
      <div className="flex flex-col md:flex-row justify-center gap-8 mt-10 px-4">
        {/* Favorites Section */}
        <div className="bg-white text-black p-4 rounded-xl shadow-md w-full md:w-1/2 border-4 border-[#f1d1d8] max-h-80 overflow-y-auto">
          <h3 className="font-semibold text-lg mb-2 text-center">Favorites</h3>
          {favoriteRestaurants.length > 0 ? (
            <ul className="space-y-2">
              {favoriteRestaurants.map((fav) => (
                <li key={fav.id}>
                  <button
                    onClick={() => navigate(`/restaurant/${fav.id}`)}
                    className="text-pink-700 hover:underline text-left w-full"
                  >
                    {fav.name} — <span className="text-sm text-gray-500">{fav.location}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 text-center">No favorites yet.</p>
          )}
        </div>

        {/* My Reviews Section */}
        <div className="bg-white text-black p-4 rounded-xl shadow-md w-full md:w-1/2 border-4 border-[#f1d1d8] max-h-80 overflow-y-auto">
          <h3 className="font-semibold text-lg mb-2 text-center">My Reviews</h3>

          {Object.keys(myReviews).length > 0 ? (
            <div className="space-y-4">
              {Object.values(myReviews).map((group) => {
                const isOpen = openSections[group.restaurant.id];

                return (
                  <div key={group.restaurant.id} className="mb-4 border rounded-md shadow-sm">
                    {/* Header */}
                    <div
                      className="flex justify-between items-center bg-[#fdf3f5] px-4 py-3 cursor-pointer"
                      onClick={() => toggleSection(group.restaurant.id)}
                    >
                      <div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // prevent toggle
                            navigate(`/restaurant/${group.restaurant.id}`);
                          }}
                          className="text-pink-700 font-semibold hover:underline text-left"
                        >
                          {group.restaurant.name}
                        </button>
                        <p className="text-sm text-gray-500">{group.restaurant.location}</p>
                      </div>
                      <span className="text-xl">{isOpen ? "▲" : "▼"}</span>
                    </div>

                    {/* Collapsible Content */}
                    {isOpen && (
                      <div className="px-4 py-3 space-y-2 bg-white">
                        {group.reviews.map((r) => (
                          <div key={r.id} className="bg-gray-50 p-3 rounded-md border">
                            <p className="text-sm text-gray-700 mb-1">{r.review_text}</p>
                            {/*<div className="flex flex-wrap gap-2">
                              {r.allergen_feedback.map((f, idx) => {
                                console.log(f);
                                let emoji = "⚠";
                                let color = "text-yellow-600";

                                if (f.rating === "safe") {
                                  emoji = "✅";
                                  color = "text-green-600";
                                } else if (f.rating === "unsafe") {
                                  emoji = "❌";
                                  color = "text-red-600";
                                }

                                return (
                                  <span
                                    key={idx}
                                    className={`px-2 py-1 text-xs font-medium rounded-full bg-gray-200 ${color}`}
                                  >
                                    {emoji} {f.allergen}
                                  </span>
                                );
                              })}
                            </div> */}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-600 text-center">
              None yet,{" "}
              <button className="text-blue-600 underline" onClick={() => navigate("/create")}>
                click here
              </button>{" "}
              to post your first review!
            </p>
          )}
        </div>
      </div>
      <FloatingCreateButton />
      {/* Logout Button */}
    </main>
  );
};

export default Profile;