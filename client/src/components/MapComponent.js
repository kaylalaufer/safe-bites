import React, { useRef, useState, useEffect } from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const containerStyle = {
  width: "100%",
  height: "600px",
};

const defaultCenter = {
  lat: 40.7128, // NYC fallback
  lng: -74.0060,
};

const MapComponent = ({ markers, zoom = 12, onBoundsChange }) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [userCenter, setUserCenter] = useState(null);
  const mapRef = useRef(null);
  const navigate = useNavigate();

  const handleBoundsChanged = () => {
    if (mapRef.current) {
      const bounds = mapRef.current.getBounds();
      if (bounds && onBoundsChange) {
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        onBoundsChange({
          north: ne.lat(),
          east: ne.lng(),
          south: sw.lat(),
          west: sw.lng(),
        });
      }
    }
  };

  useEffect(() => {
    const fetchUserLocation = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("lat, lng")
          .eq("id", user.id)
          .single();

        if (!error && data?.lat && data?.lng) {
          setUserCenter({ lat: data.lat, lng: data.lng });
          console.log("User location fetched successfully", data);
        } else {
          console.error("Failed to fetch user location", error);
        }
      }
    };

    fetchUserLocation();
  }, []);

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={userCenter || defaultCenter}
      zoom={zoom}
      onLoad={(map) => (mapRef.current = map)}
      onBoundsChanged={handleBoundsChanged}
    >
      {markers.map((marker, index) => (
        <Marker
          key={index}
          position={{ lat: marker.lat, lng: marker.lng }}
          onClick={() => setSelectedMarker(marker)}
          icon={{
            url: marker.isNew
              ? "http://maps.google.com/mapfiles/ms/icons/pink-dot.png"
              : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
          }}
        />
      ))}

      {selectedMarker && (
        <InfoWindow
          position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div className="w-30 p-0 m--10">
            <h3 className="font-semibold text-sm mt-0">{selectedMarker.name}</h3>
            <p className="text-xs italic text-gray-600">{(selectedMarker.place_type || []).join(", ")}</p>
            <p className="text-xs text-gray-600">{selectedMarker.location}</p>
            {selectedMarker.isNew ? (
              <button
                className="mt-2 px-2 py-1 text-xs bg-pink-500 text-white rounded hover:bg-pink-600"
                onClick={() =>
                  navigate(`/create?restaurantId=${selectedMarker.id}&name=${encodeURIComponent(selectedMarker.name)}&location=${encodeURIComponent(selectedMarker.location)}&place_type=${encodeURIComponent(selectedMarker.place_type)}`)
                }
              >
                Add Review
              </button>
            ) : (
              <button
                className="mt-2 px-2 py-1 text-xs bg-pink-500 text-white rounded hover:bg-pink-600"
                onClick={() => navigate(`/restaurant/${selectedMarker.id}`)}
              >
                View Details
              </button>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default MapComponent;
