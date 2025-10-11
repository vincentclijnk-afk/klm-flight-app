import React, { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ☀️ Bereken huidige zonpositie (gecorrigeerd)
function calculateSunPosition() {
  const now = new Date();
  const rad = Math.PI / 180;
  const jd = now.getTime() / 86400000 + 2440587.5;
  const n = jd - 2451545.0;

  const Ls = (280.46 + 0.9856474 * n) % 360;
  const g = (357.528 + 0.9856003 * n) % 360;
  const lambda = Ls + 1.915 * Math.sin(g * rad) + 0.02 * Math.sin(2 * g * rad);
  const epsilon = 23.439 - 0.0000004 * n;
  const dec = Math.asin(Math.sin(epsilon * rad) * Math.sin(lambda * rad)) / rad;

  // ✅ Zon beweegt van oost naar west over de dag
  const timeUTC = now.getUTCHours() + now.getUTCMinutes() / 60;
  const lng = (180 - (timeUTC / 24) * 360); // Correctie voor richting

  const lat = dec;
  console.log("Zonpositie:", lat.toFixed(2), lng.toFixed(2));
  return [lat, lng];
}

// ☀️ Zon als marker
function SunMarker() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const icon = L.divIcon({
      html: `<div style="
        width: 40px;
        height: 40px;
        background: radial-gradient(circle, #FFD700 40%, #FFA500 80%);
        border-radius: 50%;
        border: 3px solid #FF8C00;
        box-shadow: 0 0 20px rgba(255,215,0,0.9);
      "></div>`,
      className: "",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const drawSun = () => {
      const [lat, lng] = calculateSunPosition();
      if (map._sunMarker) map.removeLayer(map._sunMarker);
      const marker = L.marker([lat, lng], { icon });
      marker.addTo(map);
      map._sunMarker = marker;
    };

    drawSun();
    const interval = setInterval(drawSun, 60000);
    return () => clearInterval(interval);
  }, [map]);

  return null;
}

// 🌒 Dag/nachtlaag — gesynchroniseerd met zon
function DayNightLayer() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const drawLayer = () => {
      const coords = [];
      const now = new Date();
      const rad = Math.PI / 180;
      const jd = now.getTime() / 86400000 + 2440587.5;
      const n = jd - 2451545.0;

      const Ls = (280.46 + 0.9856474 * n) % 360;
      const g = (357.528 + 0.9856003 * n) % 360;
      const lambda = Ls + 1.915 * Math.sin(g * rad) + 0.02 * Math.sin(2 * g * rad);
      const epsilon = 23.439 - 0.0000004 * n;
      const dec = Math.asin(Math.sin(epsilon * rad) * Math.sin(lambda * rad)) / rad;

      // Zonpositie gebruiken voor de terminatorlijn
      const [sunLat, sunLng] = calculateSunPosition();

      for (let lng = -180; lng <= 180; lng += 2) {
        const hourAngle = (lng - sunLng) * rad;
        const lat = Math.atan(-Math.cos(hourAngle) / Math.tan(dec * rad)) / rad;
        coords.push([lat, lng]);
      }

      if (map._terminatorLayer) map.removeLayer(map._terminatorLayer);

      const polygonCoords = [coords.concat([[90, 180], [90, -180]])];
      const layer = L.polygon(polygonCoords, {
        color: "none",
        fillColor: "#001d3d",
        fillOpacity: 0.45,
        interactive: false,
      });

      layer.addTo(map);
      map._terminatorLayer = layer;
    };

    drawLayer();
    const interval = setInterval(drawLayer, 60000);
    return () => clearInterval(interval);
  }, [map]);

  return null;
}

// 🌍 Hoofdcomponent
export default function App() {
  return (
    <MapContainer
      center={[0, 0]}
      zoom={3}
      style={{ height: "100vh", width: "100vw" }}
      worldCopyJump={true}
      zoomControl={false}
      maxBounds={[
        [-90, -180],
        [90, 180],
      ]}
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <DayNightLayer />
      <SunMarker />
    </MapContainer>
  );
}
