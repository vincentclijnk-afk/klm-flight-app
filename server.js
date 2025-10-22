// server.js
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = 3001;

app.use(cors());

// ✈️ Vluchten ophalen
app.get("/api/flights", async (req, res) => {
  const direction = req.query.direction || "D"; // D = vertrek, A = aankomst
  const url = `https://api.schiphol.nl/public-flights/flights?flightDirection=${direction}&includedelays=false&page=0&sort=%2BscheduleTime`;

  try {
    const response = await fetch(url, {
      headers: {
        app_id: process.env.SCHIPHOL_APP_ID,
        app_key: process.env.SCHIPHOL_APP_KEY,
        ResourceVersion: "v4",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Schiphol API fout:", text);
      return res.status(response.status).json({ error: "API request failed", text });
    }

    const data = await response.json();

    // ✈️ Compacte data teruggeven
    const flights = (data.flights || []).map((f) => ({
      flight: f.flightName || "Onbekend",
      route: f.route?.destinations?.join(", ") || "Onbekend",
      time: f.scheduleTime || "Onbekend",
      // random lat/lon om tijdelijk markers te tonen
      lat: 52.3086 + (Math.random() - 0.5) * 2, // rond Schiphol
      lon: 4.7639 + (Math.random() - 0.5) * 2,
    }));

    res.json(flights);
  } catch (err) {
    console.error("🚨 Backend error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🌍 Start server
app.listen(PORT, () => {
  console.log(`✅ Backend draait op http://localhost:${PORT}`);
});