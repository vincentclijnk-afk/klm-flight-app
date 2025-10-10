import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Marker icoon instellen (zodat het pinnetje zichtbaar is)
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Hoofdcomponent
function App() {
  return (
    <MapContainer
      center={[10, -15]}                // middenpositie (mooi evenwicht)
      zoom={2.55}                       // perfecte zoom volgens je screenshot
      minZoom={2.5}
      maxZoom={6}
      zoomSnap={0.1}
      zoomDelta={0.1}
      zoomControl={true}
      worldCopyJump={false}
      noWrap={true}
      maxBounds={[[-82, -179.9], [82, 179.9]]}   // voorkomt scrollen naar blauw
      maxBoundsViscosity={1.0}                   // houdt kaart vast binnen grenzen
      dragging={true}
      inertia={false}
      style={{ height: "100vh", width: "100vw" }} // volledig scherm
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        noWrap={true}
      />

      {/* Testmarker */}
      <Marker position={[10, -15]} icon={markerIcon}>
        <Popup>Marker</Popup>
      </Marker>
    </MapContainer>
  );
}

export default App;
