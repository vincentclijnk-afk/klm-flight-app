import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./App.css";

// ✈️ Icoon voor vliegtuigen
const planeIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/190/190601.png",
  iconSize: [25, 25],
  iconAnchor: [12, 12],
});

function App() {
  const [flights, setFlights] = useState([]);
  const [direction, setDirection] = useState("D");
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // 🛰️ Vluchten ophalen
  const fetchFlights = async () => {
    try {
      const res = await fetch(`http://192.168.68.77:3001/api/flights?direction=${direction}`);
      if (!res.ok) throw new Error("Failed to fetch flights");
      const data = await res.json();
      setFlights(data);
      setError(null);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message);
      setFlights([]);
    }
  };

  // ⏱️ Elke 60 seconden verversen
  useEffect(() => {
    fetchFlights();
    const interval = setInterval(fetchFlights, 60000);
    return () => clearInterval(interval);
  }, [direction]);

  return (
    <div className="App">
      {/* ===== Paneel bovenaan ===== */}
      <div className="panel">
        <h2>KLM Flight App – {direction === "D" ? "Vertrekken" : "Aankomsten"}</h2>
        <div className="buttons">
          <button
            className={direction === "D" ? "active" : ""}
            onClick={() => setDirection("D")}
          >
            Vertrek
          </button>
          <button
            className={direction === "A" ? "active" : ""}
            onClick={() => setDirection("A")}
          >
            Aankomst
          </button>
          <button onClick={fetchFlights} className="refresh">
            Verversen
          </button>
        </div>

        <p>Laatst bijgewerkt om {lastUpdated ? lastUpdated : "…"}</p>
        {error && <div className="error">❌ {error}</div>}

        {flights.length > 0 ? (
          <ul className="flight-list">
            {flights.map((f, i) => (
              <li key={i}>
                <strong>{f.flight}</strong> – {f.route} – {f.time}
              </li>
            ))}
          </ul>
        ) : (
          <p>Geen vluchten gevonden.</p>
        )}
      </div>

      {/* ===== Fade overgang ===== */}
      <div className="fade-divider"></div>

      {/* ===== Kaart ===== */}
      <div className="map-container">
        <MapContainer
          center={[52.3086, 4.7639]} // Schiphol
          zoom={5}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          worldCopyJump={false}
          maxBounds={[
            [-85, -180],
            [85, 180],
          ]}
          maxBoundsViscosity={1.0}
          dragging={true}
          zoomControl={true}
          minZoom={2}
          maxZoom={8}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          />

          {flights.map((f, i) => (
            <Marker key={i} position={[f.lat, f.lon]} icon={planeIcon}>
              <Popup>
                <strong>{f.flight}</strong>
                <br />
                {f.route}
                <br />
                {f.time}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;
