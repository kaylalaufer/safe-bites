import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import MapComponent from "../components/MapComponent";
import SearchBox from "../components/SearchBox";
import RestaurantCard from "../components/RestaurantCard";

const ALLERGENS = ["Peanut", "Tree Nut", "Gluten", "Wheat", "Eggs", "Milk", "Sesame", "Soy", "Fish", "Shellfish"];
const RESTAURANT_TYPES = ["Bakery", "Ice Cream", "Cafe", "Fast Food", "Diner", "Casual Dining", "Fine Dining", "Vegan", "Vegetarian", "Italian", "Seafood", "Pizza", "BBQ", "Mexican", "Indian", "Asian", "Mediterranean"];

const Explore = () => {
    const [markers, setMarkers] = useState([]);
    const [selectedAllergens, setSelectedAllergens] = useState([]);
    const [selectedType, setSelectedType] = useState("");
    const [restaurants, setRestaurants] = useState([]);
  
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
            
              const totalSafe = allergenSummary.reduce(
                (sum, row) => sum + row.safe_count,
                0
              );
              const totalAccommodating = allergenSummary.reduce(
                (sum, row) => sum + row.accommodating_count,
                0
              );
              const totalUnsafe = allergenSummary.reduce(
                (sum, row) => sum + row.unsafe_count,
                0
              );
              console.log(restaurant.name);
              console.log(totalSafe);
              console.log(totalAccommodating);
              console.log(totalUnsafe);
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
      const type = restaurant.place_type || "";
  
      const matchesAllergens =
        selectedAllergens.length === 0 ||
        selectedAllergens.every((allergen) => allergens.includes(allergen));
  
      const matchesType =
        selectedType === "" || type === selectedType;
  
      return matchesAllergens && matchesType;
    });

    return (
        <div className="h-screen w-full flex flex-col">
            {/* Title Section */}
            <div className="text-center py-4 bg-white shadow-md w-full">
                <h2 className="text-2xl font-bold text-gray-800">Explore Allergy-Friendly Restaurants</h2>
            </div>

            {/* Main Content - Full-Width Map & Listings */}
            <div className="flex flex-grow w-full absolute top-40 left-0">
                {/* Left Side - Full-Height Map */}
                <div className="w-1/2 h-screen flex flex-col">
                    <div className="p-4">
                        <SearchBox onSelect={(location) => setMarkers([...markers, location])} />
                    </div>
                    <div className="h-auto">
                        <MapComponent markers={markers} />
                    </div>
                </div>

                {/* Right Side - Full-Height Restaurant Listings + Filters */}
                <div className="w-1/2 h-screen bg-white p-6 overflow-y-auto">
                    <h3 className="text-xl font-semibold mb-4">Filter Restaurants</h3>

                    {/* Allergen Filter */}
                    <div className="mb-4">
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
                    <div className="mb-4">
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
    );
};

export default Explore;