import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [direction, setDirection] = useState("D"); // D = Departures, A = Arrivals
  const [useSchiphol, setUseSchiphol] = useState(true); // toggle voor live / mock

  // Mockdata voor fallback of test
  const mockFlights = [
    {
      id: "KLM0871",
      route: "AMS → DEL",
      airline: "KLM",
      status: "Scheduled",
      time: "10:25",
    },
    {
      id: "KLM0877",
      route: "AMS → BOM",
      airline: "KLM",
      status: "Departed",
      time: "09:15",
    },
  ];

  // Environment-variabelen uit .env
  const appId = import.meta.env.VITE_APP_ID;
  const appKey = import.meta.env.VITE_APP_KEY;
const fetchFlights = async () => {
  try {
    setError(null);
    setShowPlane(true);
    setFlights([]);
    setLastUpdateTime("Bezig met laden...");

    const response = await fetch(`${import.meta.env.VITE_SCHIPHOL_API_URL}/${flightDirection === "D" ? "flights" : "flights/arrivals"}?app_id=${import.meta.env.VITE_SCHIPHOL_APP_ID}&app_key=${import.meta.env.VITE_SCHIPHOL_APP_KEY}&includedelays=false`, {
      headers: {
        resourceversion: "v4",
      },
    });

    if (!response.ok) {
      throw new Error(`API-fout: ${response.status}`);
    }

    const data = await response.json();

    // Test: toon aantal vluchten op het scherm
    setFlights(data.flights || []);
    setLastUpdateTime(`Geladen ${new Date().toLocaleTimeString()}`);
  } catch (err) {
    console.error(err);
    setError("Kon vluchtinformatie niet laden.");
    setShowPlane(false);
  }
};
   try {
      console.log("📡 Ophalen van Schiphol API...");
      const url = `https://api.schiphol.nl/public-flights/flights?flightDirection=${direction}&includedelays=false&page=0&sort=%2BscheduleTime`;

      const response = await fetch(url, {
        headers: {
          "ResourceVersion": "v4",
          "app_id": appId,
          "app_key": appKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Schiphol API fout (${response.status})`);
      }

      const data = await response.json();
      const lijst = data.flights || data.rows || [];

      console.log(`✅ ${lijst.length} vluchten ontvangen van Schiphol`);
      setFlights(lijst);
    } catch (err) {
      console.warn("⚠️ Schiphol API mislukt:", err.message);
      setError(err.message);
      setFlights(mockFlights);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction, useSchiphol]);

  return (
    <div className="app-container">
      <h1>✈️ Vluchten vanuit Amsterdam</h1>
{flights.length > 0 && (
  <p style={{ marginTop: "1rem", color: "darkblue" }}>
    ✈️ Aantal ontvangen vluchten: {flights.length}
  </p>
)}
      <div className="controls">
        <button onClick={() => setDirection(direction === "D" ? "A" : "D")}>
          {direction === "D"
            ? "Aankomsten (klik voor Vertrekken)"
            : "Vertrekken (klik voor Aankomsten)"}
        </button>

        <button onClick={fetchFlights}>🔄 Verversen</button>

        {/* 🟢🔴 Statusknop */}
        <button
          onClick={() => setUseSchiphol(!useSchiphol)}
          style={{
            backgroundColor: useSchiphol ? "#0077cc" : "#888",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: useSchiphol ? "#00c853" : "#d32f2f",
              boxShadow: `0 0 6px ${useSchiphol ? "#00c853aa" : "#d32f2faa"}`,
            }}
          ></span>
          {useSchiphol ? "Schiphol API actief" : "Mockdata actief"}
        </button>
      </div>

      {loading && <p>⏳ Gegevens laden...</p>}

      {!loading && error && (
        <p className="error">⚠️ Schiphol API niet bereikbaar — mockdata geladen</p>
      )}

      <div className="flights-list">
        {!loading && flights.length > 0 ? (
          flights.map((flight, index) => (
            <div className="flight-card" key={index}>
              <div className="flight-route">
                <strong>
                  {flight.route?.destinations?.[0] ||
                    flight.destination ||
                    flight.route ||
                    "Onbekend"}
                </strong>
              </div>
              <div className="flight-info">
                <span>{flight.prefixICAO || flight.airline || "KLM"}</span>
                <span>{flight.flightName || flight.id || "-"}</span>
              </div>
              <div className="flight-status">
                <span>
                  {flight.publicFlightState?.flightStates?.[0] ||
                    flight.status ||
                    "Unknown"}
                </span>
                <span>
                  {flight.scheduleDateTime?.substring(11, 16) ||
                    flight.time ||
                    "--:--"}
                </span>
              </div>
            </div>
          ))
        ) : (
          !loading && <p>Geen vluchten gevonden</p>
        )}
      </div>

      <footer>
        <p>
          {useSchiphol
            ? "📡 Live Schiphol data"
            : "📁 Mockdata (testmodus)"}{" "}
          • Richting: {direction === "D" ? "Vertrekkend" : "Aankomend"}
        </p>
      </footer>
    </div>
  );
}

export default App;
