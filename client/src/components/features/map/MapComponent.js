import React, { useCallback, useRef, useState, useEffect } from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import { useAuth } from "../auth/AuthProvider";

const containerStyle = {
  width: "100%",
  height: "600px",
};

const defaultCenter = {
  lat: 40.7128, // NYC fallback
  lng: -74.0060,
};

const BOUNDS_SETTLE_MS = 200;

function sameBounds(previous, next) {
  if (!previous || !next) return false;
  const close = (left, right) => Math.abs(left - right) < 1e-5;
  return (
    close(previous.north, next.north) &&
    close(previous.south, next.south) &&
    close(previous.east, next.east) &&
    close(previous.west, next.west)
  );
}

const MapComponent = ({ markers, mapCenter = null, zoom = 12, onBoundsChange }) => {
  const { user } = useAuth();
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [userCenter, setUserCenter] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);
  const boundsTimer = useRef(null);
  const lastBounds = useRef(null);
  const onBoundsChangeRef = useRef(onBoundsChange);
  const navigate = useNavigate();

  onBoundsChangeRef.current = onBoundsChange;

  const publishSettledBounds = useCallback(() => {
    if (boundsTimer.current) clearTimeout(boundsTimer.current);

    boundsTimer.current = setTimeout(() => {
      const map = mapRef.current;
      const notify = onBoundsChangeRef.current;
      if (!map || !notify) return;

      const bounds = map.getBounds();
      if (!bounds) return;

      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const next = {
        north: ne.lat(),
        east: ne.lng(),
        south: sw.lat(),
        west: sw.lng(),
      };

      if (sameBounds(lastBounds.current, next)) return;
      lastBounds.current = next;
      notify(next);
    }, BOUNDS_SETTLE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (boundsTimer.current) clearTimeout(boundsTimer.current);
    };
  }, []);

  // Search supplies a center. Saved-home centering stays in place until then,
  // and a later search still zooms even when the zoom number did not change.
  useEffect(() => {
    if (!mapReady || !mapCenter || !mapRef.current) return;
    mapRef.current.panTo(mapCenter);
    mapRef.current.setZoom(zoom);
  }, [mapReady, mapCenter, zoom]);

  const handleLoad = useCallback((map) => {
    mapRef.current = map;
    setMapReady(true);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchUserLocation = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("lat, lng")
        .eq("id", user.id)
        .single();

      if (!error && data?.lat && data?.lng) {
        setUserCenter({ lat: data.lat, lng: data.lng });
      } else {
        console.error("Failed to fetch user location", error);
      }
    };

    fetchUserLocation();
  }, [user]);

  const center = mapCenter || userCenter || defaultCenter;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onLoad={handleLoad}
      onIdle={publishSettledBounds}
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
