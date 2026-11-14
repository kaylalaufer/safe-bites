import React, { useRef, useState } from "react";
import { Autocomplete } from "@react-google-maps/api";

const SearchBox = ({ onSelect }) => {
    const autocompleteRef = useRef(null);
    const inputRef = useRef(null);
    const [inputValue, setInputValue] = useState("");

    const handlePlaceSelect = () => {
        const place = autocompleteRef.current.getPlace();
        if (place && place.geometry) {
            const location = {
                name: place.name || "",
                location: place.formatted_address || "",
                place_id: place.place_id || "",
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                types: place.types || [],
            };
            onSelect(location); // Pass full object up
        }
    };   
    
    const clearSearch = () => {
        setInputValue("");
        inputRef.current.value = "";
      };    

      return (
        <div className="relative w-full">
          <Autocomplete
            onLoad={(auto) => (autocompleteRef.current = auto)}
            onPlaceChanged={handlePlaceSelect}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search for a restaurant or location..."
              className="border p-2 w-full pr-10"
            />
          </Autocomplete>
          {inputValue && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black text-sm"
            >
              ✕
            </button>
          )}
        </div>
      );
    };

export default SearchBox;
