import React, { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function getSubsolarPoint(date = new Date()) {
  const dayOfYear = Math.floor(
    (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) -
      Date.UTC(date.getUTCFullYear(), 0, 0)) /
      86400000
  );
  const minutes =
    date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
  const γ = (2 * Math.PI * (dayOfYear - 1 + minutes / 1440)) / 365;

  const EoT =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(γ) -
      0.032077 * Math.sin(γ) -
      0.014615 * Math.cos(2 * γ) -
      0.040849 * Math.sin(2 * γ));

  const δ =
    0.006918 -
    0.399912 * Math.cos(γ) +
    0.070257 * Math.sin(γ) -
    0.006758 * Math.cos(2 * γ) +
    0.000907 * Math.sin(2 * γ) -
    0.002697 * Math.cos(3 * γ) +
    0.00148 * Math.sin(3 * γ);

  const lat = (δ * 180) / Math.PI;
  const lon = ((720 - minutes - EoT) / 4 + 540) % 360 - 180;
  return { lat, lon };
}

function createTerminator(date = new Date()) {
  const points = [];
  const { lat: decl } = getSubsolarPoint(date);
  const declRad = (decl * Math.PI) / 180;

  for (let lon = -180; lon <= 180; lon += 2) {
    const lonRad = (lon * Math.PI) / 180;
    const latRad = Math.atan(-Math.cos(lonRad) / Math.tan(declRad));
    points.push([latRad * (180 / Math.PI), lon]);
  }
  const ring = points.concat(points[0]);
  return L.polygon(ring, {
    color: "none",
    fillColor: "#334155",
    fillOpacity: 0.35,
    interactive: false,
  });
}

function DayNightAndSun() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    let terminator = createTerminator(new Date());
    terminator.addTo(map);

    const sunIcon = L.divIcon({
      className: "",
      html:
        '<div style="width:36px;height:36px;border-radius:50%;' +
        'background: radial-gradient(circle, #ffd54d 0%, #ffb300 60%, #ff8f00 100%);' +
        'box-shadow:0 0 18px 6px rgba(255,191,0,0.55);"></div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const { lat, lon } = getSubsolarPoint(new Date());
    const sunMarker = L.marker([lat, lon], { icon: sunIcon, interactive: false }).addTo(map);

    const update = () => {
      const now = new Date();
      if (terminator) map.removeLayer(terminator);
      terminator = createTerminator(now);
      terminator.addTo(map);

      const s = getSubsolarPoint(now);
      sunMarker.setLatLng([s.lat, s.lon]);
    };

    const timer = setInterval(update, 60000);
    update();

    return () => {
      clearInterval(timer);
      if (terminator) map.removeLayer(terminator);
      if (sunMarker) map.removeLayer(sunMarker);
    };
  }, [map]);

  return null;
}

export default function App() {
  return (
    <MapContainer
      style={{ height: "100vh", width: "100vw" }}
      center={[0, 0]}
      zoom={2}
      zoomControl={true}
      preferCanvas={true}
      worldCopyJump={false}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <DayNightAndSun />
    </MapContainer>
  );
}
