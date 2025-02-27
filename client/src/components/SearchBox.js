import React, { useRef } from "react";
import { Autocomplete } from "@react-google-maps/api";

const SearchBox = ({ onSelect }) => {
    const autocompleteRef = useRef(null);

    const handlePlaceSelect = () => {
        const place = autocompleteRef.current.getPlace();
        if (place && place.geometry) {
            const location = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                name: place.name,
            };
            onSelect(location);
        }
    };

    return (
        <Autocomplete onLoad={(auto) => (autocompleteRef.current = auto)} onPlaceChanged={handlePlaceSelect}>
            <input type="text" placeholder="Search for a restaurant..." className="border p-2 w-full" />
        </Autocomplete>
    );
};

export default SearchBox;
