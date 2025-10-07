import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import SunCalc from "suncalc";
import "leaflet-terminator";
import "./index.css";

const App = () => {
  const mapRef = useRef();
  const [showTerminator, setShowTerminator] = useState(true);
  const [terminatorLayer, setTerminatorLayer] = useState(null);
  const [sunMarker, setSunMarker] = useState(null);

  // ✅ Zorg dat viewport-hoogte klopt op Android
  const setDynamicHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };

  // ☀️ Dag/nachtgrens tekenen
  const drawTerminator = () => {
    const map = mapRef.current;
    if (!map) return;

    if (terminatorLayer) map.removeLayer(terminatorLayer);
    if (sunMarker) map.removeLayer(sunMarker);

    const now = new Date();
    const terminator = L.terminator(now, { fillOpacity: 0.35, color: "black" });
    terminator.addTo(map);
    setTerminatorLayer(terminator);

    const sunPos = SunCalc.getPosition(now, 0, 0);
    const sunLat = (sunPos.altitude * 180) / Math.PI;
    const sunLng = (-sunPos.azimuth * 180) / Math.PI + 180;

    const sunIcon = L.divIcon({
      html: "☀️",
      className: "sun-icon",
      iconSize: [30, 30],
    });

    const sun = L.marker([sunLat, sunLng], { icon: sunIcon }).addTo(map);
    setSunMarker(sun);
  };

  // 🎯 Zodra de kaart geladen is → forceren dat alles in beeld is
  useEffect(() => {
    setDynamicHeight();
    window.addEventListener("resize", setDynamicHeight);
    window.addEventListener("orientationchange", setDynamicHeight);

    const map = mapRef.current;

    // Initieel tekenen
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
        const bounds = L.latLngBounds([[-85, -180], [85, 180]]);
        map.fitBounds(bounds, { padding: [0, 0], animate: false });
        drawTerminator();
      }
    }, 400);

    // 👉 Extra zoom-correctie na 1 seconde (zorgt dat hele wereld zichtbaar is)
    setTimeout(() => {
      const map = mapRef.current;
      if (map) {
        const bounds = L.latLngBounds([[-85, -180], [85, 180]]);
        map.fitBounds(bounds, { padding: [0, 0], animate: false });
      }
    }, 1000);

    // Herhaal dag/nacht elke 5 minuten
    const interval = setInterval(drawTerminator, 5 * 60 * 1000);

    return () => {
      window.removeEventListener("resize", setDynamicHeight);
      window.removeEventListener("orientationchange", setDynamicHeight);
      clearInterval(interval);
    };
  }, []);

  // 🌗 Toggle dag/nacht aan of uit
  const toggleTerminator = () => {
    const map = mapRef.current;
    if (!map) return;
    if (showTerminator) {
      if (terminatorLayer) map.removeLayer(terminatorLayer);
      if (sunMarker) map.removeLayer(sunMarker);
    } else {
      drawTerminator();
    }
    setShowTerminator(!showTerminator);
  };

  return (
    <div className="app-container">
      <div className="map-overlay">
        <h2>🌍 Wereldkaart met Real-Time Dag/Nachtgrens + Zonpositie</h2>
        <button onClick={toggleTerminator} className="toggle-btn">
          {showTerminator ? "🌞 Verberg dag/nacht" : "🌜 Toon dag/nacht"}
        </button>
      </div>

      <MapContainer
        ref={mapRef}
        center={[0, 0]}
        zoom={1}
        minZoom={1}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        zoomControl={true}
        worldCopyJump={false}
        style={{ width: "100%", height: "calc(var(--vh, 1vh) * 100)" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> bijdragers'
          noWrap={true}
        />
      </MapContainer>
    </div>
  );
};

export default App;
