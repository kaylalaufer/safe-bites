import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import MapComponent from "../components/MapComponent";
import SearchBox from "../components/SearchBox";
import RestaurantCard from "../components/RestaurantCard";
import FloatingCreateButton from "../components/FloatingCreateButton";

const ALLERGENS = ["Peanut", "Tree Nut", "Gluten", "Wheat", "Eggs", "Milk", "Sesame", "Soy", "Fish", "Shellfish"];
const RESTAURANT_TYPES = ["Bakery", "Ice Cream", "Boba", "Cafe", "Fast Food", "Diner", "Casual Dining", "Fine Dining", "Vegan", "Vegetarian", "Italian", "Seafood", "Pizza", "BBQ", "Mexican", "Indian", "Asian", "Mediterranean"];

const Explore = () => {
    const [markers, setMarkers] = useState([]);
    const [selectedAllergens, setSelectedAllergens] = useState([]);
    const [selectedType, setSelectedType] = useState("");
    const [restaurants, setRestaurants] = useState([]);
    const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.006 });
    const [zoom, setZoom] = useState(12);
    const [mapBounds, setMapBounds] = useState(null);
    const [searchPlace, setSearchPlace] = useState(null);
  
    // Fetch restaurants from Supabase
    useEffect(() => {
        const fetchRestaurants = async () => {
          const { data, error } = await supabase
          .from("restaurants")
          .select(`
            id,
            name,
            location,
            lat,
            lng,
            place_type,
            associated_allergens,
            safe_count,
            accommodating_count,
            unsafe_count,
            restaurant_allergen_summary (
              allergen,
              safe_count,
              accommodating_count,
              unsafe_count
            )
          `);
        
      
          if (error) {
            console.error("Error fetching restaurants:", error.message);
          } else {
            const enrichedData = data.map((restaurant) => {
              const allergenSummary = restaurant.restaurant_allergen_summary || [];
            
              const totalSafe = allergenSummary.reduce((sum, row) => sum + row.safe_count,0);
              const totalAccommodating = allergenSummary.reduce((sum, row) => sum + row.accommodating_count,0);
              const totalUnsafe = allergenSummary.reduce((sum, row) => sum + row.unsafe_count,0);

              return {
                ...restaurant,
                totalSafe,
                totalAccommodating,
                totalUnsafe,
              };
            
            });
            
            // Filter out any without coordinates
            const validMarkers = enrichedData
              .filter((r) => r.lat && r.lng)
              .map((r) => ({
                id: r.id,
                name: r.name,
                location: r.location,
                lat: r.lat,
                lng: r.lng,
                place_type: r.place_type,
                totalSafe: r.totalSafe,
                totalAccommodating: r.totalAccommodating,
                totalUnsafe: r.totalUnsafe,
              }));
      
            setMarkers(validMarkers);       // for your <MapComponent />
            setRestaurants(enrichedData);           // for your listing/filtering UI
          }
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
  
    // Filter restaurants based on selected allergens & type
    const filteredRestaurants = restaurants.filter((restaurant) => {
      const allergens = restaurant.associated_allergens || [];

      const matchesAllergens =
        selectedAllergens.length === 0 ||
        selectedAllergens.every((allergen) => allergens.includes(allergen));
      
      const types = restaurant.place_type || [];
      const matchesType = selectedType === "" || types.includes(selectedType);
  
  
      const withinBounds =
        !mapBounds ||
        (restaurant.lat >= mapBounds.south &&
        restaurant.lat <= mapBounds.north &&
        restaurant.lng >= mapBounds.west &&
        restaurant.lng <= mapBounds.east);

      return matchesAllergens && matchesType && withinBounds;

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
                    {/* Search Bar */}
                    {/*<div className="mb-4">
                    <SearchBox onSelect={(location) => {
                      setMarkers([...markers, location]); // if needed
                      setMapCenter({ lat: location.lat, lng: location.lng });
                      setZoom(16);
                    }} /> 
                     </div>*/}
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
                            console.log("Place not found in DB, adding temporary marker");
                            const tempMarker = {
                              id: "new", // Temporary ID
                              name: place.name,
                              location: place.location,
                              lat: place.lat,
                              lng: place.lng,
                              place_type: [], // Optional default
                              isNew: true,
                            };
                            console.log("Adding temporary marker:", tempMarker);
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
                                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
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