import { useEffect, useState } from "react";

// ⚙️ Ophalen Schiphol Public API-data (of mock als fallback)
export function useFlights() {
  const [flights, setFlights] = useState([]);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const res = await fetch("https://api.schiphol.nl/public-flights/flights?includedelays=false", {
          headers: {
            Accept: "application/json",
            app_id: "YOUR_APP_ID",
            app_key: "YOUR_APP_KEY",
            ResourceVersion: "v4",
          },
        });
        if (!res.ok) throw new Error("API-fout");
        const data = await res.json();

        // Filter op KLM long-haul & IndiGo routes
        const filtered = data.flights.filter(f =>
          (f.prefixICAO === "KLM" && f.route?.destinations?.some(c => ["DEL", "BOM", "JFK", "SIN", "CPT"].includes(c))) ||
          (f.prefixICAO === "IGO" && f.route?.destinations?.some(c => ["DEL", "BOM"].includes(c)))
        );

        setFlights(filtered);
      } catch (err) {
        console.warn("API niet bereikbaar, mockdata gebruikt", err);
        setFlights([]);
      }
    };

    fetchFlights();
    const interval = setInterval(fetchFlights, 5 * 60 * 1000); // elke 5 min
    return () => clearInterval(interval);
  }, []);

  return flights;
}
