import React, { useEffect, useState } from "react";

const USE_SCHIPHOL = false;
const REFRESH_INTERVAL = 120; // seconden

// Mockdata voor beide richtingen
const mockDepartures = [
  { id: "KL0871", route: "AMS → DEL", airline: "KLM", status: "Scheduled", time: "10:25" },
  { id: "KL0877", route: "AMS → BOM", airline: "KLM", status: "Departed", time: "09:15" },
];

const mockArrivals = [
  { id: "AI0123", route: "DEL → AMS", airline: "Air India", status: "Landed", time: "08:55" },
  { id: "BA0429", route: "LHR → AMS", airline: "British Airways", status: "Expected", time: "11:05" },
];

export default function App() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [animate, setAnimate] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [fly, setFly] = useState(false);
  const [lastSuccess, setLastSuccess] = useState(true);
  const [toast, setToast] = useState(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const [flightDirection, setFlightDirection] = useState("D"); // D = Departures, A = Arrivals

  const triggerPulse = () => {
    setPulse(true);
    setFly(true);
    setTimeout(() => setPulse(false), 1500);
    setTimeout(() => setFly(false), 3000);
  };

  const showToast = (message, success = true) => {
    setToast({ message, success });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchFlights = async () => {
    setLoading(true);
    setError("");
    setAnimate(false);

    try {
      let data = [];

      if (USE_SCHIPHOL) {
        const response = await fetch(
          `https://api.schiphol.nl/public-flights/flights?flightDirection=${flightDirection}`,
          {
            headers: {
              resourceversion: "v4",
              app_id: "YOUR_APP_ID_HERE",
              app_key: "YOUR_APP_KEY_HERE",
              Accept: "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Schiphol API reageert niet");

        const json = await response.json();
        data =
          json.flights?.map((f) => ({
            id: f.flightName,
            route:
              flightDirection === "D"
                ? `AMS → ${f.route?.destinations?.[0] || "?"}`
                : `${f.route?.destinations?.[0] || "?"} → AMS`,
            airline: f.prefixIATA || f.prefixICAO,
            status: f.publicFlightState?.flightStates?.join(", "),
            time: f.scheduleDateTime?.slice(11, 16),
          })) || [];

        setLastSuccess(true);
        showToast("Live data bijgewerkt", true);
      } else {
        data = flightDirection === "D" ? mockDepartures : mockArrivals;
        setLastSuccess(false);
        showToast(
          `Mockdata (${flightDirection === "D" ? "Vertrekken" : "Aankomsten"}) geladen`,
          false
        );
      }

      if (!data.length) throw new Error("Geen data ontvangen");

      setFlights(data);
      setLastUpdate(new Date());
      setAnimate(false);
      setTimeout(() => setAnimate(true), 50);
      triggerPulse();
      setCountdown(REFRESH_INTERVAL);
    } catch {
      setLastSuccess(false);
      setFlights(flightDirection === "D" ? mockDepartures : mockArrivals);
      setLastUpdate(new Date());
      setAnimate(false);
      setTimeout(() => setAnimate(true), 50);
      triggerPulse();
      showToast("API niet bereikbaar — mockdata geladen", false);
      setCountdown(REFRESH_INTERVAL);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
    const interval = setInterval(fetchFlights, REFRESH_INTERVAL * 1000);
    return () => clearInterval(interval);
  }, [flightDirection]); // herlaadt data als richting verandert

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const renderSkeletons = () =>
    Array.from({ length: 4 }).map((_, i) => (
      <li
        key={i}
        className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-sky-100 shadow-sm animate-pulse flex justify-between items-center"
      >
        <div className="space-y-2 w-1/2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-100 rounded w-1/2"></div>
        </div>
        <div className="text-right space-y-2 w-1/3">
          <div className="h-3 bg-gray-200 rounded w-1/2 ml-auto"></div>
          <div className="h-4 bg-gray-100 rounded w-2/3 ml-auto"></div>
        </div>
      </li>
    ));

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-lg">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen relative overflow-hidden bg-ocean animate-waves">
      {/* Pulse-lijn */}
      <div
        className={`fixed top-[20px] left-0 h-[3px] w-full transition-all duration-500 ${
          pulse
            ? lastSuccess
              ? "bg-sky-500 opacity-100 animate-pulse"
              : "bg-red-400 opacity-100 animate-pulse"
            : "opacity-0"
        }`}
      ></div>

      {/* Condensstreep */}
      {fly && <div className="planeTrail"></div>}

      {/* Vliegtuig */}
      {fly && (
        <svg
          className="animate-planeFly text-sky-600"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="28"
          height="28"
        >
          <path d="M2 12l20-5v2l-8 2v6l-2-1-2 1v-6l-8-2v-2z" />
        </svg>
      )}

      {/* Header */}
      <div className="pt-14 p-6 max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-3">
          <h1 className="text-3xl font-semibold text-gray-800 flex items-center gap-2">
            {flightDirection === "D" ? "🛫 Vertrekken" : "🛬 Aankomsten"}{" "}
            <span>– Amsterdam</span>
          </h1>

          <div className="flex gap-2">

<button
  onClick={() =>
    setFlightDirection((prev) => (prev === "D" ? "A" : "D"))
  }
  className={`w-[170px] h-[64px] rounded-lg text-sm font-medium transition-all shadow-sm flex flex-col items-center justify-center border select-none
    ${
      flightDirection === "D"
        ? "bg-white/70 border-sky-300 hover:bg-sky-100 text-sky-700"
        : "bg-white/70 border-emerald-300 hover:bg-emerald-100 text-emerald-700"
    }`}
>
  <span className="font-semibold text-base leading-tight">
    {flightDirection === "D" ? "🛫 Vertrekken" : "🛬 Aankomsten"}
  </span>
  <span className="text-xs text-gray-500 mt-0.5 leading-none">
    {flightDirection === "D"
      ? "klik om Aankomsten te tonen"
      : "klik om Vertrekken te tonen"}
  </span>
</button>

            <button
              onClick={fetchFlights}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${
                loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-sky-600 hover:bg-sky-700 text-white"
              }`}
            >
              {loading ? "⏳ Laden..." : "🔄 Verversen"}
            </button>
          </div>
        </div>

        {/* Info bar */}
        <div
          className={`w-full text-sm rounded-md mb-6 py-1 px-3 flex items-center justify-center gap-2 font-medium tracking-wide shadow-sm backdrop-blur-sm ${
            lastSuccess
              ? flightDirection === "D"
                ? "bg-sky-200/60 text-sky-800"
                : "bg-emerald-200/60 text-emerald-800"
              : "bg-slate-300/60 text-slate-700"
          }`}
        >
          <span>
            {lastSuccess
              ? `Live data ${
                  flightDirection === "D" ? "Vertrekken" : "Aankomsten"
                } – Schiphol API`
              : `Mockdata ${
                  flightDirection === "D" ? "Vertrekken" : "Aankomsten"
                } actief`}
          </span>
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              lastSuccess
                ? flightDirection === "D"
                  ? "bg-sky-600"
                  : "bg-emerald-600"
                : "bg-slate-500"
            } ${pulse ? "animate-ping" : ""}`}
          ></span>
        </div>

        {/* Update-info + countdown */}
        <div className="mb-6 text-sm text-gray-600 flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-2">
            Laatste update:{" "}
            <span className="font-mono">
              {lastUpdate
                ? lastUpdate.toLocaleTimeString("nl-NL", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                : "Onbekend"}
            </span>
            <span
              className={`inline-block w-4 h-4 rounded-full shadow-sm ${
                lastSuccess
                  ? "bg-sky-500 shadow-sky-300"
                  : "bg-red-500 shadow-red-300"
              }`}
              title={lastSuccess ? "Update gelukt" : "Mockdata actief"}
            ></span>
          </div>
          <p className="text-xs text-gray-500 mt-2 sm:mt-0">
            Volgende update in <span className="font-mono">{countdown}s</span>
          </p>
        </div>

        {/* Vluchtenlijst */}
        <ul
          className={`grid gap-4 transition-all duration-700 ${
            animate ? "opacity-100 scale-[1.00]" : "opacity-0 scale-[0.98]"
          }`}
        >
          {loading ? (
            renderSkeletons()
          ) : (
            flights.map((f) => (
              <li
                key={f.id}
                className="p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-sky-100 shadow-sm hover:shadow-md transition-all flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-800">{f.route}</p>
                  <p className="text-sm text-gray-500">{f.airline}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm ${
                      f.status === "Scheduled"
                        ? "text-sky-600"
                        : f.status === "Departed"
                        ? "text-gray-500"
                        : f.status === "Landed"
                        ? "text-emerald-600"
                        : "text-sky-700"
                    }`}
                  >
                    {f.status}
                  </p>
                  <p className="font-mono text-gray-700">{f.time}</p>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Toastmelding */}
      {toast && (
        <div
          className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-medium shadow-lg transition-all flex items-center gap-2 ${
            toast.success ? "bg-sky-600 text-white" : "bg-red-500 text-white"
          } animate-toastFade`}
        >
          <span className="text-lg">{toast.success ? "✅" : "⚠️"}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
