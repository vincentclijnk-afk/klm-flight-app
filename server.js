// server.js
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 🚦 CORS openzetten (alleen tijdens dev)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

const BASE_URL = "https://api.schiphol.nl/public-flights";

// 🔒 Proxy endpoint: /api/flights
app.get("/api/:endpoint", async (req, res) => {
  try {
    const { endpoint } = req.params;
    const query = new URLSearchParams(req.query).toString();
    const url = `${BASE_URL}/${endpoint}?${query}`;

    const response = await fetch(url, {
      headers: {
        "app_id": process.env.SCHIPHOL_APP_ID,
        "app_key": process.env.SCHIPHOL_APP_KEY,
        "ResourceVersion": "v4",
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy failed" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy running on http://localhost:${PORT}`);
});
