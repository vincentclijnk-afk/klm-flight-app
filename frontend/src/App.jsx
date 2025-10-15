import React, { useEffect, useState } from "react";
import "./index.css";

function App() {
  const [flights, setFlights] = useState([]);
  const [direction, setDirection] = useState("D"); // D = Departures, A = Arrivals
  const [loading, setLoading] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [testMessage, setTestMessage] = useState("");

  const fetchFlights = async () => {
    setLoading(true);
    setTestMessage("🧩 Test Schiphol API-verbinding...");
    document.querySelector(".plane-wrapper")?.classList.add("fly");

    try {
      const res = await fetch(
        `https://api.schiphol.nl/public-flights/flights?flightDirection=${direction}&includedelays=false&page=0&sort=%2BscheduleTime`,
        {
          headers: {
            Accept: "application/json",
            "app_id": import.meta.env.VITE_APP_ID,
            "app_key": import.meta.env.VITE_APP_KEY,
            ResourceVersion: "v4",
          },
        }
      );

      if (!res.ok) throw new Error("API reageert niet");
      const data = await res.json();

      setFlights(data.flights?.slice(0, 5) || []);
      setApiAvailable(true);
      setTestMessage("✅ Schiphol API actief");
    } catch (err) {
      console.warn("API-fout, mockdata gebruikt:", err);
      setFlights([
        direction === "D"
          ? { route: "AMS → DEL", airline: "KLM", status: "Scheduled", time: "10:25" }
          : { route: "DEL → AMS", airline: "Air India", status: "Landed", time: "08:55" },
      ]);
      setApiAvailable(false);
      setTestMessage("⚠️ Schiphol API niet beschikbaar, mockdata gebruikt");
    } finally {
      setLoading(false);
      setLastUpdate(new Date().toLocaleTimeString());
      setTimeout(() => document.querySelector(".plane-wrapper")?.classList.remove("fly"), 4000);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, [direction]);

  return (
    <div className="app-container">
      {/* ✈️ vliegtuig bovenin */}
      <div className="plane-wrapper">
        <svg
          className="plane"
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
          fill="#0A3D91"
        >
          <path d="M2 34 L42 34 L62 44 L58 46 L42 38 L2 38 Z" />
          <path d="M10 28 L42 34 L10 40 Z" fill="#0056B3" />
        </svg>
        <div className="smoke"></div>
      </div>

      <h1>{direction === "D" ? "Vertrekken" : "Aankomsten"}</h1>

      <div className="controls">
        <button onClick={() => setDirection(direction === "D" ? "A" : "D")} disabled={loading}>
          {direction === "D"
            ? "Aankomsten (klik voor Vertrekken)"
            : "Vertrekken (klik voor Aankomsten)"}
        </button>

        <button onClick={fetchFlights} disabled={loading}>
          {loading ? "Bezig met verversen..." : "🔄 Verversen"}
        </button>

        <div className={`api-status ${apiAvailable ? "on" : "off"}`}>
          {apiAvailable ? "Schiphol API actief" : "Mockdata actief"}
        </div>
      </div>

      <div className="test-message">
        {testMessage && <p>{testMessage}</p>}
      </div>

      <div className="update-info">
        {lastUpdate && <span>Laatste update: {lastUpdate}</span>}
      </div>

      <div className="flights-list">
        {loading ? (
          <p>Vluchten laden...</p>
        ) : (
          flights.map((f, i) => (
            <div key={i} className="flight-card">
              <strong>{f.route}</strong>
              <span>{f.airline}</span>
              <span>
                {f.status} <b>{f.time}</b>
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
