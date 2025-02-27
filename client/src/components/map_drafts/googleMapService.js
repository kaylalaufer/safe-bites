// File: utils/googleMapService.js

/**
 * Initializes and returns a new Google Map instance.
 * @param {HTMLElement} container - The DOM element where the map is rendered.
 * @param {Object} center - An object with lat and lng properties.
 * @param {number} zoom - The initial zoom level.
 *
OLD, but worked -- export function initializeMap(container, center, zoom) {
    return new google.maps.Map(container, {
      center: center,
      zoom: zoom,
    });
  }*/

export const initializeMap = (mapRef, center, zoom) => {
    if (!window.google || !window.google.maps) {
        console.error("Google Maps API not loaded.");
        return;
    }

    const map = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: false,
    });

    return map;
};
  

/**
 * Adds markers to the map based on an array of marker data.
 * @param {google.maps.Map} map - The map instance.
 * @param {Array} markersData - Array of objects: { name, lat, lng, info }.
 */
export function addMarkers(map, markersData) {
markersData.forEach(markerData => {
    const marker = new google.maps.Marker({
    position: { lat: markerData.lat, lng: markerData.lng },
    map: map,
    title: markerData.name,
    });
    // Optionally attach an info window if additional info is provided.
    if (markerData.info) {
    const infoWindow = new google.maps.InfoWindow({
        content: markerData.info,
    });
    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });
    }
});
}

export const updateMarkerVisibility = (markers, filteredIds) => {
    markers.forEach(marker => {
        marker.setVisible(filteredIds.includes.marker.id);
    });
};

/**
 * Sets up the Google Places Autocomplete on a given input element.
 * @param {HTMLElement} inputElement - The input element for autocomplete.
 * @param {google.maps.Map} map - The map instance to re-center on selection.
 * @param {Function} onPlaceSelected - Callback function with the selected place details.
 */
export function setupAutocomplete(inputElement, map, onPlaceSelected) {
const autocomplete = new google.maps.places.Autocomplete(inputElement, {
    types: ['establishment'],
    // Uncomment and adjust the following line to restrict to a specific country:
    // componentRestrictions: { country: 'us' },
});

autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    if (!place.geometry) {
    alert("No details available for input: '" + place.name + "'");
    return;
    }
    // Center the map on the selected place.
    if (place.geometry.location) {
    map.setCenter(place.geometry.location);
    map.setZoom(15);
    // Optionally add a marker at the selected location.
    new google.maps.Marker({
        position: place.geometry.location,
        map: map,
    });
    }
    onPlaceSelected(place);
});
return autocomplete;
}  