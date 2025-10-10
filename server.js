// server.js
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = 5000;

// Mockdata (fallback)
const mockFlights = {
  flights: [
    { callsign: "KLM809", lat: 47.635, lon: 21.141, velocity: 908, heading: 100, registration: "PH-BQA", status: "🛫 In de lucht" },
    { callsign: "KLM896", lat: 25.276, lon: 55.296, velocity: 850, heading: 290, registration: "PH-BQD", status: "🛫 In de lucht" },
    { callsign: "6E1852", lat: 19.076, lon: 72.877, velocity: 830, heading: 320, registration: "VT-IHS", status: "🛫 In de lucht" }
  ]
};

// OpenSky en ADS-B API endpoints
const OPEN_SKY_URL = "https://opensky-network.org/api/states/all";
const ADSB_URL = "https://api.adsbexchange.com/v2/lat/0/lon/0/dist/400";

// Route: /api/flights
app.get("/api/flights", async (req, res) => {
  try {
    console.log("🛰️ Ophalen van OpenSky data...");
    const response = await fetch(OPEN_SKY_URL);

    if (!response.ok) throw new Error("OpenSky HTTP " + response.status);

    const data = await response.json();
    if (!data || !data.states) throw new Error("Geen geldige data van OpenSky");

    // Filter alleen KLM (KL400–KL900) en IndiGo (6Exxxx)
    const flights = data.states
      .map((f) => ({
        callsign: f[1]?.trim(),
        lat: f[6],
        lon: f[5],
        velocity: f[9],
        heading: f[10],
        registration: f[0],
        status: "🛫 In de lucht",
      }))
      .filter(
        (f) =>
          (f.callsign?.startsWith("KLM") &&
            parseInt(f.callsign.slice(3)) >= 400 &&
            parseInt(f.callsign.slice(3)) <= 900) ||
          f.callsign?.startsWith("6E")
      );

    return res.json({ flights });
  } catch (error) {
    console.warn("⚠️ OpenSky mislukt:", error.message);
    console.log("➡️ Gebruik mockdata");
    return res.json(mockFlights);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend draait op http://localhost:${PORT}`);
});
