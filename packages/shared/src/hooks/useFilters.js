import { useState, useMemo } from 'react';

export const useFilters = (restaurants, mapBounds) => {
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [selectedType, setSelectedType] = useState("");

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
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
  }, [restaurants, selectedAllergens, selectedType, mapBounds]);

  const handleAllergenSelect = (allergen) => {
    if (!selectedAllergens.includes(allergen)) {
      setSelectedAllergens([...selectedAllergens, allergen]);
    }
  };

  const removeAllergen = (allergen) => {
    setSelectedAllergens(selectedAllergens.filter((item) => item !== allergen));
  };

  const clearFilters = () => {
    setSelectedAllergens([]);
    setSelectedType("");
  };

  return {
    selectedAllergens,
    selectedType,
    setSelectedType,
    filteredRestaurants,
    handleAllergenSelect,
    removeAllergen,
    clearFilters
  };
};
