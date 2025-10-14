import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ☀️ Zonicoon
const sunIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/869/869869.png",
  iconSize: [50, 50],
  iconAnchor: [25, 25],
});

function SunAndTerminator() {
  const map = useMap();
  const [sunPos, setSunPos] = useState({ lat: 0, lng: 0 });

  // ☀️ Zonpositie berekenen
  const calcSun = (time) => {
    const minutes = time.getUTCHours() * 60 + time.getUTCMinutes();
    const solarLng = 180 - minutes / 4;
    const dayOfYear =
      Math.floor((time - new Date(time.getFullYear(), 0, 0)) / 86400000);
    const solarLat =
      23.44 * Math.sin(((2 * Math.PI) / 365) * (dayOfYear - 81));
    return { lat: solarLat, lng: solarLng };
  };

  // 🌓 Terminatorlijn + verlenging voor wereldranden
  const createTerminator = (date) => {
    const { lat: subLat, lng: subLng } = calcSun(date);
    const coords = [];
    const rad = Math.PI / 180;

    // iets voorbij 180° voor zachte overgang (wrap)
    for (let lon = -200; lon <= 200; lon++) {
      const lat =
        Math.atan(-Math.cos((lon - subLng) * rad) / Math.tan(subLat * rad)) /
        rad;
      coords.push([lat, lon]);
    }

    // correct afsluiten via beide polen
    return [
      [90, -200],
      ...coords,
      [-90, 200],
      [90, 200],
      [90, -200],
    ];
  };

  useEffect(() => {
    const now = new Date();
    const sun = calcSun(now);
    setSunPos(sun);

    const polygon = L.polygon(createTerminator(now), {
      color: "none",
      fillColor: "#000814",
      fillOpacity: 0.45,
      interactive: false,
      noWrap: true, // belangrijk: niet herhalen maar laten doorlopen
    }).addTo(map);

    const update = () => {
      const updated = new Date();
      const newSun = calcSun(updated);
      setSunPos(newSun);
      polygon.setLatLngs(createTerminator(updated));
    };

    const interval = setInterval(update, 60000);
    return () => {
      clearInterval(interval);
      polygon.remove();
    };
  }, [map]);

  return <Marker position={[sunPos.lat, sunPos.lng]} icon={sunIcon} />;
}

export default function App() {
  return (
    <MapContainer
      center={[10, 0]}
      zoom={2.55}
      minZoom={2.5}
      maxZoom={6}
      zoomSnap={0.1}
      zoomDelta={0.1}
      noWrap={true}
      worldCopyJump={false}
      maxBounds={[
        [-82, -179.9],
        [82, 179.9],
      ]}
      maxBoundsViscosity={1.0}
      style={{ height: "100vh", width: "100vw" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        noWrap={true}
      />
      <SunAndTerminator />
    </MapContainer>
  );
}
