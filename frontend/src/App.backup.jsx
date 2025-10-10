import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function App() {
  const mapRef = useRef(null);

  useEffect(() => {
    console.log("🗺️ Leaflet wordt geïnitialiseerd...");

    if (!mapRef.current) {
      console.error("❌ mapRef.current niet gevonden");
      return;
    }

    // Kaart aanmaken
    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      worldCopyJump: false, // voorkomt herhalende wereld
      maxBounds: [
        [-90, -180],
        [90, 180],
      ],
      maxBoundsViscosity: 1.0,
    });

    // OpenStreetMap-laag toevoegen
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      noWrap: true, // zorgt dat de kaart niet herhaalt
    }).addTo(map);

    console.log("✅ Kaart succesvol geladen");
    return () => map.remove();
  }, []);

  return <div ref={mapRef} className="leaflet-container"></div>;
}
