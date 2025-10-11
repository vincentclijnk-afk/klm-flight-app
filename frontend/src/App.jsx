// frontend/src/App.jsx
import React, { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@joergdietrich/leaflet.terminator";

// --- Zonpositie (NOAA-achtige benadering, heel stabiel) ---
function getSubsolarPoint(date = new Date()) {
  // fraction of year in radians
  const dayOfYear = Math.floor(
    (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) -
      Date.UTC(date.getUTCFullYear(), 0, 0)) /
      86400000
  );
  const minutes =
    date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
  const γ = (2 * Math.PI * (dayOfYear - 1 + minutes / 1440)) / 365;

  // Equation of Time (minutes)
  const EoT =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(γ) -
      0.032077 * Math.sin(γ) -
      0.014615 * Math.cos(2 * γ) -
      0.040849 * Math.sin(2 * γ));

  // Solar declination (radians)
  const δ =
    0.006918 -
    0.399912 * Math.cos(γ) +
    0.070257 * Math.sin(γ) -
    0.006758 * Math.cos(2 * γ) +
    0.000907 * Math.sin(2 * γ) -
    0.002697 * Math.cos(3 * γ) +
    0.00148 * Math.sin(3 * γ);

  const lat = (δ * 180) / Math.PI;
  // Subsolar longitude (°E). Positief = oost, negatief = west.
  const lon = (720 - minutes - EoT) / 4;

  // Normaliseer naar [-180, 180]
  const normLon = ((lon + 540) % 360) - 180;
  return { lat, lon: normLon };
}

// --- Leaflet custom component voor terminator + zon ---
function DayNightAndSun() {
  const map = useMap();

  useEffect(() => {
    // 1) Terminator (nacht) via plugin – super stabiel en netjes afgerond
    const t = L.terminator(new Date());
    t.setStyle({
      // rustige, half-transparante schaduw
      fillColor: "#334155",       // grijsblauw
      fillOpacity: 0.35,
      stroke: false,
      interactive: false,
      className: "night-shade",
    });
    t.addTo(map);

    // 2) Zon-icoon
    const sunIcon = L.divIcon({
      className: "sun-icon",
      html:
        '<div style="width:36px;height:36px;border-radius:50%;' +
        'background: radial-gradient(ellipse at center, #ffd54d 0%, #ffb300 60%, #ff8f00 100%);' +
        'box-shadow: 0 0 18px 6px rgba(255,191,0,0.55);"></div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const { lat, lon } = getSubsolarPoint(new Date());
    const sunMarker = L.marker([lat, lon], {
      icon: sunIcon,
      interactive: false,
      zIndexOffset: 1000,
    }).addTo(map);

    // 3) Periodiek bijwerken (elke 60 sec); ook meteen bij eerste tick
    const update = () => {
      const now = new Date();
      t.setTime(now);
      t.redraw();
      const s = getSubsolarPoint(now);
      sunMarker.setLatLng([s.lat, s.lon]);
    };
    const id = setInterval(update, 60000);

    // kleine kick om direct te syncen
    update();

    return () => {
      clearInterval(id);
      map.removeLayer(t);
      map.removeLayer(sunMarker);
    };
  }, [map]);

  return null;
}

export default function App() {
  // Kaart netjes centreren en vergrendelen zodat hij altijd mooi in beeld staat
  const maxBounds = [
    [-60, -180], // zuid, west
    [80, 180],   // noord, oost
  ];

  return (
    <MapContainer
      className="map-root"
      center={[20, 0]}
      zoom={3.0}
      minZoom={2.4}
      zoomSnap={0.1}
      maxBounds={maxBounds}
      maxBoundsViscosity={1.0}
      worldCopyJump={false}
      zoomControl={true}
      preferCanvas={true}
      attributionControl={false}
    >
      <TileLayer
        // Rustige OSM tiles
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        noWrap={true}
        bounds={maxBounds}
      />
      <DayNightAndSun />
    </MapContainer>
  );
}
