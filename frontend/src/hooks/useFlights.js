import { useEffect, useState } from "react";

export function useFlights(type = "departures") {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Automatisch backend URL bepalen
  const hostname = window.location.hostname;
  const backendHost =
    hostname === "localhost" || hostname === "127.0.0.1"
      ? "http://localhost:3001"
      : `http://${hostname}:3001`;

  const API_URL = `${backendHost}/api/flights?type=${type}`;
  console.log("✈️ Ophalen van:", API_URL);

  useEffect(() => {
    async function fetchFlights() {
      try {
        setLoading(true);
        const response = await fetch(API_URL);
        const data = await response.json();
        if (data.error) {
          setError(data.error);
        } else {
          setFlights(data);
        }
      } catch (err) {
        setError("Fout bij laden van vluchten");
      } finally {
        setLoading(false);
      }
    }

    fetchFlights();

    // Auto-refresh elke 60 sec
    const interval = setInterval(fetchFlights, 60000);
    return () => clearInterval(interval);
  }, [type]);

  return { flights, loading, error };
}