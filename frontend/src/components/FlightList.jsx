import React from "react";

export default function FlightList({ flights, loading, error }) {
  if (loading) {
    return <p>Bezig met laden...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>⚠️ {error}</p>;
  }

  if (!flights || flights.length === 0) {
    return <p>Geen vluchten gevonden.</p>;
  }

  return (
    <div className="p-4">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-blue-100">
            <th className="border p-2">Vluchtnummer</th>
            <th className="border p-2">Route</th>
            <th className="border p-2">Tijd</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {flights.map((f, i) => (
            <tr key={i} className="hover:bg-blue-50">
              <td className="border p-2">{f.flightName || f.flight || "–"}</td>
              <td className="border p-2">{f.route || `${f.origin || ""} → ${f.destination || ""}`}</td>
              <td className="border p-2">{f.scheduledTime || f.time || "?"}</td>
              <td className="border p-2">{f.status || "Onbekend"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
