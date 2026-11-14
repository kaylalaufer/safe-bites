import { useState } from 'react';

export const useMap = () => {
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.006 });
  const [zoom, setZoom] = useState(12);
  const [mapBounds, setMapBounds] = useState(null);
  const [searchPlace, setSearchPlace] = useState(null);

  const updateMapCenter = (lat, lng, newZoom = 16) => {
    setMapCenter({ lat, lng });
    setZoom(newZoom);
  };

  const updateBounds = (bounds) => {
    setMapBounds(bounds);
  };

  const setSearchLocation = (place) => {
    setSearchPlace(place);
    updateMapCenter(place.lat, place.lng);
  };

  return {
    mapCenter,
    zoom,
    mapBounds,
    searchPlace,
    updateMapCenter,
    updateBounds,
    setSearchLocation
  };
};
