import React from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "600px",
};

const defaultCenter = {
  lat: 40.7128, // Default to NYC
  lng: -74.006,
};

const MapComponent = ({ markers }) => {
  return (
      <GoogleMap mapContainerStyle={containerStyle} center={defaultCenter} zoom={12}>
        {markers.map((marker, index) => (
          <Marker key={index} position={{ lat: marker.lat, lng: marker.lng }} />
        ))}
      </GoogleMap>
  );
};

export default MapComponent;
