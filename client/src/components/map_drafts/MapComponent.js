// MOST RECENT
import React, { useState, useEffect, useCallback } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow, Autocomplete } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // Default: New York City

const libraries = ["places", "geometry"];

const categories = [
  { type: "restaurant", label: "Restaurant" },
  { type: "bakery", label: "Bakery" },
  { type: "cafe", label: "Cafe" },
  { type: "ice_cream_shop", label: "Ice Cream Shop" },
];

const MapComponent = ({ places }) => {
  const [map, setMap] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [filteredPlaces, setFilteredPlaces] = useState(places);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Handles map instance
  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  // Handles autocomplete instance
  const onAutocompleteLoad = (auto) => {
    setAutocomplete(auto);
  };

  // Handles place selection from autocomplete
  const onPlaceSelected = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        map.panTo(place.geometry.location);
        map.setZoom(15);
      }
    }
  };

  // Handles filtering by category
  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredPlaces(places);
    } else {
      setFilteredPlaces(places.filter((place) => place.type === selectedCategory));
    }
  }, [selectedCategory, places]);

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={libraries}>
      <div className="flex flex-col items-center mb-4">
        {/* Autocomplete Input */}
        <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceSelected}>
          <input type="text" placeholder="Search for a place..." className="w-96 p-2 border rounded mb-2" />
        </Autocomplete>

        {/* Category Filters */}
        <div className="mb-4">
          {categories.map((category) => (
            <button
              key={category.type}
              className={`px-4 py-2 m-1 rounded ${
                selectedCategory === category.type ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => setSelectedCategory(category.type)}
            >
              {category.label}
            </button>
          ))}
          <button
            className={`px-4 py-2 m-1 rounded ${
              selectedCategory === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setSelectedCategory("all")}
          >
            All
          </button>
        </div>
      </div>

      {/* Google Map */}
      <GoogleMap mapContainerStyle={mapContainerStyle} zoom={12} center={defaultCenter} onLoad={onLoad}>
        {filteredPlaces.map((place) => (
          <Marker
            key={place.id}
            position={{ lat: place.lat, lng: place.lng }}
            onClick={() => setSelectedPlace(place)}
          />
        ))}

        {selectedPlace && (
          <InfoWindow position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }} onCloseClick={() => setSelectedPlace(null)}>
            <div>
              <h3 className="text-lg font-bold">{selectedPlace.name}</h3>
              <p>{selectedPlace.rating ? `Rating: ${selectedPlace.rating}` : "No rating available"}</p>
              <p>{selectedPlace.address}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
