import React, { useState, useEffect } from "react";
import "./index.css";
import plane from "/klm-plane.png"; // vliegtuigsymbool uit public-map

function App() {
  const [flightDirection, setFlightDirection] = useState("D"); // D = Departures, A = Arrivals
  const [flights, setFlights] = useState([]);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [error, setError] = useState(null);
  const [showPlane, setShowPlane] = useState(false);

  const fetchFlights = async () => {
    try {
      setError(null);
      setShowPlane(true);
      setFlights([]);
      setLastUpdateTime("Bezig met laden...");

      const url = `${import.meta.env.VITE_SCHIPHOL_API_URL}/${flightDirection === "D" ? "flights" : "flights/arrivals"}?app_id=${import.meta.env.VITE_SCHIPHOL_APP_ID}&app_key=${import.meta.env.VITE_SCHIPHOL_APP_KEY}&includedelays=false`;

      const response = await fetch(url, {
        headers: {
          resourceversion: "v4",
        },
      });

      if (!response.ok) {
        throw new Error(`API-fout: ${response.status}`);
      }

      const data = await response.json();
      setFlights(data.flights || []);
      setLastUpdateTime(`Geladen om ${new Date().toLocaleTimeString()}`);
    } catch (err) {
      setError("Kon vluchtinformatie niet laden.");
      setShowPlane(false);
      setLastUpdateTime(null);
    }
  };

  useEffect(() => {
    fetchFlights();
    const interval = setInterval(fetchFlights, 60000);
    return () => clearInterval(interval);
  }, [flightDirection]);

  return (
    <div className="app-container">
      <h1>KLM Flight App – {flightDirection === "D" ? "Vertrekken" : "Aankomsten"}</h1>

      <div className="button-container">
        <button
          onClick={() => setFlightDirection("A")}
          className={`button ${flightDirection === "A" ? "active" : ""}`}
        >
          Aankomsten
        </button>
        <button
          onClick={() => setFlightDirection("D")}
          className={`button ${flightDirection === "D" ? "active" : ""}`}
        >
          Vertrekken
        </button>
        <button onClick={fetchFlights} className="button refresh">
          Verversen
        </button>
      </div>

      <div className="status">
        {lastUpdateTime && <p>Laatste update: {lastUpdateTime}</p>}
        {!lastUpdateTime && <p>Bezig met laden...</p>}
        <p style={{ color: "green" }}>🟢 Auto-refresh elke 60s</p>
      </div>

      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>{error}</p>
      )}

      {flights.length > 0 && (
        <p style={{ marginTop: "20px", color: "darkblue", fontWeight: "bold" }}>
          ✈️ Aantal ontvangen vluchten: {flights.length}
        </p>
      )}

      {showPlane && (
        <img
          src={plane}
          alt="vliegtuig"
          className={`plane ${flightDirection === "A" ? "arrival" : "departure"}`}
        />
      )}
    </div>
  );
}

export default App;