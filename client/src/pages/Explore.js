import React, { useState } from "react";
import MapComponent from "../components/MapComponent";
import SearchBox from "../components/SearchBox";
import RestaurantCard from "../components/RestaurantCard";

const ALLERGENS = ["Peanuts", "Tree Nuts", "Gluten", "Wheat", "Eggs", "Milk", "Sesame", "Soy", "Fish", "Shellfish"];
const RESTAURANT_TYPES = ["Bakery", "Ice Cream", "Cafe", "Fast Food", "Diner", "Casual Dining", "Fine Dining", "Vegan", "Vegetarian", "Italian", "Seafood", "Pizza", "BBQ", "Mexican", "Indian", "Asian", "Mediterranean"];


// Temporary Restaurant Data (To Be Replaced with Database)
const RESTAURANTS = [
  { id: 1, name: "Joe's Diner", location: "New York, NY", allergens: ["Peanuts", "Gluten"], type: "Diner", safe: 10, accommodating: 5, unsafe: 2 },
  { id: 2, name: "Green Bites", location: "Brooklyn, NY", allergens: ["Tree Nut", "Milk"], type: "Vegan", safe: 15, accommodating: 3, unsafe: 1 },
  { id: 3, name: "Safe Eats", location: "Queens, NY", allergens: ["Dairy", "Gluten"], type: "Cafe", safe: 7, accommodating: 8, unsafe: 0 },
  { id: 4, name: "Donut Pub", location: "New York, NY", allergens: ["Peanuts", "Tree Nuts"], type: "Bakery", safe: 10, accommodating: 2, unsafe: 2 },
  { id: 5, name: "A la Mode", location: "New York, NY", allergens: ["Tree Nut", "Peanuts"], type: "Ice Cream", safe: 11, accommodating: 3, unsafe: 1 },
  { id: 6, name: "Pasta Louisa", location: "Brooklyn, NY", allergens: ["Dairy", "Gluten", "Peanuts"], type: "Italian", safe: 7, accommodating: 10, unsafe: 0 },
];

const Explore = () => {
    const [markers, setMarkers] = useState([]);
    const [selectedAllergens, setSelectedAllergens] = useState([]);
    const [selectedType, setSelectedType] = useState("");

    // Handle selecting allergens (add/remove)
    const handleAllergenSelect = (e) => {
        const allergen = e.target.value;
        if (!selectedAllergens.includes(allergen)) {
            setSelectedAllergens([...selectedAllergens, allergen]);
        }
    };

    // Handle removing an allergen
    const removeAllergen = (allergen) => {
        setSelectedAllergens(selectedAllergens.filter((item) => item !== allergen));
    };

    // Filter restaurants based on selected allergens & type
    const filteredRestaurants = RESTAURANTS.filter((restaurant) => {
      const matchesAllergens =
          selectedAllergens.length === 0 || selectedAllergens.every((allergen) => restaurant.allergens.includes(allergen));
      const matchesType = selectedType === "" || restaurant.type === selectedType;
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