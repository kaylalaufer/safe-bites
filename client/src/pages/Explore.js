/*import React, { useState, useEffect } from "react";
import MapComponent from "../components/MAP/MapComponent";

const Explore = () => {
  const [showMap, setShowMap] = useState(true);

  useEffect(() => {
    setShowMap(true); // Ensure map stays mounted
  }, []);

  return (
    <div>
      <h1>Explore Allergy-Friendly Places</h1>
      {showMap && <MapComponent />}
    </div>
  );
};

export default Explore;*/

import React, { useState } from "react";
import MapComponent from "../components/MapComponent";
import SearchBox from "../components/SearchBox";

const Explore = () => {
    const [markers, setMarkers] = useState([]);

    // Handle adding new restaurant locations to the map
    const handleSelect = (location) => {
        setMarkers([...markers, location]);
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Explore Allergy-Friendly Restaurants</h2>
            <SearchBox onSelect={handleSelect} />
            <MapComponent markers={markers} />
        </div>
    );
};

export default Explore;
