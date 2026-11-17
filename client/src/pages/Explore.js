import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { MapComponent, SearchBox, RestaurantCard, FloatingCreateButton } from "../components";
import { ALLERGENS, RESTAURANT_TYPES, enrichRestaurant, filterRestaurants } from "../domain";
import { listRestaurants } from "../data";
import { useAuth } from "../components/features/auth/AuthProvider";

const Explore = () => {
    const { user } = useAuth();
    const [markers, setMarkers] = useState([]);
    const [selectedAllergens, setSelectedAllergens] = useState([]);
    const [selectedType, setSelectedType] = useState("");
    const [restaurants, setRestaurants] = useState([]);
    // Null until a search sets the camera, so saved-home centering still wins.
    const [mapCenter, setMapCenter] = useState(null);
    const [zoom, setZoom] = useState(12);
    const [mapBounds, setMapBounds] = useState(null);
    const [searchPlace, setSearchPlace] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [userId, setUserId] = useState(null);
  
    useEffect(() => {
      if (!user) return;

      const fetchUserFavorites = async () => {
        setUserId(user.id);
    
        const { data, error } = await supabase
          .from("users")
          .select("favorites")
          .eq("id", user.id)
          .single();
    
        if (!error && data?.favorites) {
          setFavorites(data.favorites);
        } else {
          setFavorites([]);
        }
      };
    
      fetchUserFavorites();
    }, [user]);
    
    useEffect(() => {
      const fetchRestaurants = async () => {
        const { data, error } = await listRestaurants(supabase);
    
        if (error) {
          console.error("Error fetching restaurants:", error.message);
          return;
        }
    
        const validMarkers = data.filter((restaurant) => restaurant.lat && restaurant.lng);
    
        setMarkers(validMarkers);
        setRestaurants(data);
      };
    
      fetchRestaurants();
    }, []);
    
      
    
    // Handle selecting allergens (add/remove)
    const handleAllergenSelect = (e) => {
      const allergen = e.target.value;
      if (!selectedAllergens.includes(allergen)) {
        setSelectedAllergens([...selectedAllergens, allergen]);
      }
    };
  
    const removeAllergen = (allergen) => {
      setSelectedAllergens(selectedAllergens.filter((item) => item !== allergen));
    };

    const visibleRestaurants = restaurants.map((restaurant) =>
      enrichRestaurant(restaurant, favorites)
    );

    const filteredRestaurants = filterRestaurants(visibleRestaurants, {
      selectedAllergens,
      selectedType,
      mapBounds,
    });


    // <div className="text-center py-4 bg-white shadow-md w-full">
    return (
        <main className="h-screen w-full items-center flex flex-col p-4">

            {/* Title Section */}  
            <h2 className="text-2xl font-bold text-green-800">Explore Allergy-Friendly Restaurants</h2>
            
            {/* Main Content - Full-Width Map & Listings */}
            <div className="flex-grow flex w-full bg-gray-100 p-4">

                {/* Left Side - Full-Height Map */}
                <div className="w-1/2 flex flex-col p-4">
                    <div className="mb-4">
                      <SearchBox
                        onSelect={async (place) => {
                          setMapCenter({ lat: place.lat, lng: place.lng });
                          setSearchPlace(place);
                          setZoom(16);

                          // Step 3: Check Supabase for the place
                          const { data: match, error } = await supabase
                            .from("restaurants")
                            .select("id")
                            .eq("google_place_id", place.place_id)
                            .maybeSingle();

                          // Step 4: Add temporary marker if not in DB
                          if (!match && !error) {
                            const tempMarker = {
                              id: "new", // Temporary ID
                              name: place.name,
                              location: place.location,
                              lat: place.lat,
                              lng: place.lng,
                              place_type: [], // Optional default
                              isNew: true,
                            };
                            setMarkers((prev) => [...prev, tempMarker]);
                            const exists = restaurants.some(r => r.id === "new");
                            if (!exists) {
                              setRestaurants((prev) => [...prev, tempMarker]);
                            }
                          }
                        }}
                      />
                    </div>

                    {/* Map Component */}
                    <div className="flex-grow rounded-md overflow-hidden">
                      <MapComponent
                        markers={filteredRestaurants}
                        mapCenter={mapCenter}
                        zoom={zoom}
                        onBoundsChange={(bounds) => setMapBounds(bounds)}
                      />
                    </div>
                </div>

                {/* Right Side - Full-Height Restaurant Listings + Filters */}
                <div className="w-1/2 flex flex-col p-4 gap-4">

                  {/* Sticky Filter Section */}
                  <div className="sticky top-1 bg-gray-100 z-10 p-4 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-4">Filter Restaurants</h3>

                    {/* Allergen Filter */}
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700">Select Allergen</label>
                        <select 
                            className="w-full p-2 border rounded-md mt-1" 
                            onChange={handleAllergenSelect} 
                            value="">

                            <option value="" disabled>Select an allergen</option>
                            {ALLERGENS.map((allergen) => (
                                <option key={allergen} value={allergen}>{allergen}</option>
                            ))}
                        </select>

                        {/* Allergen Bubbles */}
                        <div className="flex flex-wrap gap-2 mt-3">
                            {selectedAllergens.map((allergen) => (
                                <div 
                                    key={allergen} 
                                    className="bg-pink-100 text-emerald-600 px-3 py-1 rounded-full flex items-center cursor-pointer hover:bg-pink-200"
                                    onClick={() => removeAllergen(allergen)}>
                                    {allergen} ✕
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Restaurant Type Filter */}
                    <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700">Select Restaurant Type</label>
                        <select 
                            className="w-full p-2 border rounded-md mt-1" 
                            onChange={(e) => setSelectedType(e.target.value)} 
                            value={selectedType}>

                            <option value="">All Types</option>
                            {RESTAURANT_TYPES.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {/* Scrollable Restaurant Cards */}
                    <div className="flex flex-col gap-4 overflow-y-auto flex-grow" style={{ maxHeight: '400px' }}>
                    {/* Filtered Restaurant Listings */}
                    {filteredRestaurants.length > 0 ? (
                        <div className="space-y-4">
                            {filteredRestaurants.map((restaurant) => (
                                <RestaurantCard
                                key={restaurant.id}
                                restaurant={restaurant}
                                isFavorited={restaurant.isFavorited}
                                userId={userId}
                                setFavorites={setFavorites} // optional if HeartIcon will update Supabase
                              />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600">No restaurants match your filters.</p>
                    )}
                </div>
              </div>
            </div>
            <FloatingCreateButton />
        </main>
        
    );
};

export default Explore;