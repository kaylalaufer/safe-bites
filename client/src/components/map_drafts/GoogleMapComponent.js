import React, { useEffect, useRef } from "react";

const GoogleMapComponent = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    const CONFIGURATION = {
      capabilities: {
        search: true,
        distances: false,
        directions: false,
        contacts: true,
        atmospheres: true,
        thumbnails: true,
      },
      pois: [
        { placeId: "ChIJP0KOWoxZwokRmvPiQAIaH1A" },
        { placeId: "ChIJp-cWE4pZwokRmUI8_BIF8dg" },
        { placeId: "ChIJETquaPVZwokRVYYGSKrg4E0" },
      ],
      mapRadius: 1500,
      mapOptions: {
        center: { lat: 40.7127753, lng: -74.0059728 },
        fullscreenControl: true,
        mapTypeControl: true,
        streetViewControl: false,
        zoom: 16,
        zoomControl: true,
        maxZoom: 20,
        mapId: "",
      },
    };

    const loadGoogleMaps = () => {
      if (!window.google) {
        console.error("Google Maps API is not loaded.");
        return;
      }
      new window.NeighborhoodDiscovery(CONFIGURATION);
    };

    if (window.google) {
      loadGoogleMaps();
    } else {
      window.initMap = loadGoogleMaps;
    }
  }, []);

  return (
    <div className="neighborhood-discovery">
      <div className="map" ref={mapRef} style={{ width: "100%", height: "500px" }} />
    </div>
  );
};

export default GoogleMapComponent;
