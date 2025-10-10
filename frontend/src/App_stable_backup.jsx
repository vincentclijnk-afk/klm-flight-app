import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function App() {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    console.log("🌍 Leaflet kaart geladen...");

    if (mapRef.current._leaflet_id) {
      mapRef.current._leaflet_id = null;
    }

    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 8,
      worldCopyJump: false,
      noWrap: true, // voorkomt oneindig herhalen van tiles
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 8,
      attribution: "&copy; OpenStreetMap",
      noWrap: true, // ook hier nodig!
    }).addTo(map);

    // zachte rand, zodat kaart wel iets kan bewegen
    const southWest = L.latLng(-85, -180);
    const northEast = L.latLng(85, 180);
    const bounds = L.latLngBounds(southWest, northEast);
    map.setMaxBounds(bounds);

    return () => map.remove();
  }, []);

  return (
    <div
      ref={mapRef}
      id="map"
      style={{
        height: "100vh",
        width: "100vw",
        backgroundColor: "#aad3df",
        margin: 0,
        padding: 0,
      }}
    />
  );
}
