import L from "leaflet";
import "leaflet/dist/leaflet.css";
import flights from "./data/mockFlights.json";

// 🕒 UTC-klok
function startUtcClock() {
  const el = document.getElementById("utc-clock");
  if (!el) return;
  const tick = () => {
    const n = new Date();
    el.textContent =
      `${String(n.getUTCHours()).padStart(2, "0")}:` +
      `${String(n.getUTCMinutes()).padStart(2, "0")}:` +
      `${String(n.getUTCSeconds()).padStart(2, "0")} UTC`;
  };
  tick();
  setInterval(tick, 1000);
}

// 🗺️ Map — één wereld
const WORLD_BOUNDS = L.latLngBounds(L.latLng(-85, -180), L.latLng(85, 180));
const map = L.map("map", {
  center: [25, 20],
  zoom: 2.2,
  minZoom: 2,
  maxBounds: WORLD_BOUNDS,
  maxBoundsViscosity: 1.0,
  worldCopyJump: false,
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
  noWrap: true,
  bounds: WORLD_BOUNDS,
}).addTo(map);

// 🌗 Dag/nacht overlay (vaste nachtversie)
function addDayNightOverlay() {
  const s = document.createElement("script");
  s.src = "/leaflet.terminator.fixed.js"; // <<< let op: exact deze naam
  s.onload = () => {
    if (typeof L.terminator !== "function") {
      console.warn("❌ Terminator plugin niet geladen");
      return;
    }

    const terminator = L.terminator({
      fillColor: "#001f3f",
      fillOpacity: 0.35,
      color: "#001f3f",
      weight: 0,
    });

    terminator.addTo(map);
    terminator.setTime(new Date());
    terminator.redraw();

    setInterval(() => {
      terminator.setTime(new Date());
      terminator.redraw();
    }, 60000);
  };
  document.head.appendChild(s);
}
addDayNightOverlay();

// ✈️ Vluchten
function renderOnMap(list) {
  list.forEach(f => {
    const { route, airline, status, position } = f;
    if (!route?.origin || !route?.destination) return;
    const { lat: oLat, lon: oLon } = route.origin;
    const { lat: dLat, lon: dLon } = route.destination;

    L.polyline([[oLat, oLon], [dLat, dLon]], {
      color: "#0078d7",
      weight: 2,
      opacity: 0.7,
    }).addTo(map);

    if (position?.lat && position?.lon) {
      L.marker([position.lat, position.lon])
        .addTo(map)
        .bindPopup(
          `<b>${f.flightId}</b><br>${airline.name}<br>
           <small>${route.origin.iata} → ${route.destination.iata}</small><br>
           <small>Status: ${status}</small>`
        );
    }
  });
}

// 🚀 Start
renderOnMap(flights);
startUtcClock();

console.log("🌍 KLM Flight Map — terminator fixed script actief");
