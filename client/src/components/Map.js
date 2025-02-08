import React, { useEffect } from "react";

const Map = () => {
    useEffect(() => {
        window.initMap = () => {
            console.log("Map initialized");
            new window.google.maps.Map(document.getElementById("map"), {
                center: { lat: 40.7128, lng: -74.0060 }, // New York City
                zoom: 10,
            });
        };

        // Load the map once the Google API is available
        if (!window.google) {
          if (!document.querySelector(`script[src*="maps.googleapis.com"]`)) {
              const script = document.createElement("script");
              script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD6ZB4vnwo2wGZo_JjqyUEoMxKewgg3JOY&callback=initMap`;
              script.async = true; // Non-blocking
              script.defer = true; // Waits until HTML parsing is done
              script.onload = window.initMap; // Initialize the map after loading
              document.body.appendChild(script);
          }
      } else if (window.google) {
        window.initMap();
      }
    }, []);

    return <div id="map" style={{ height: "500px", width: "100%" }}></div>;
};

export default Map;
