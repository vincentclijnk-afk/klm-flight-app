import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./lib/leaflet.terminator.min.js";

export default function App() {
  const mapRef = useRef(null);
  const terminatorRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapRef.current._leaflet_id) mapRef.current._leaflet_id = null;

    // 🌍 Kaart aanmaken
    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 8,
      worldCopyJump: false,
      noWrap: true,
    });

    // 🗺️ Basis-tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 8,
      attribution: "&copy; OpenStreetMap",
      noWrap: true,
    }).addTo(map);

    // 🌗 Terminator in het overlayPane (boven de tiles)
    if (typeof L.terminator === "function") {
      const terminator = L.terminator({
        fillOpacity: 0.35,   // transparantie
        color: "#000000",
        weight: 0,
        interactive: false,
        pane: "overlayPane", // overlayPane zit boven tilePane
      });
      terminator.addTo(map);
      terminatorRef.current = terminator;

      // update elke minuut
      const interval = setInterval(() => {
        const updated = L.terminator({
          fillOpacity: 0.35,
          color: "#000000",
          weight: 0,
          interactive: false,
          pane: "overlayPane",
        });
        terminatorRef.current.setLatLngs(updated.getLatLngs());
      }, 60000);

      return () => clearInterval(interval);
    } else {
      console.error("❌ Leaflet.Terminator niet geladen!");
    }
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
