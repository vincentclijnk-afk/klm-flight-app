const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 3001;

app.use(cors());

app.get("/flights", async (req, res) => {
  try {
    const direction = req.query.direction || "D";
    const url = `${process.env.VITE_SCHIPHOL_API_URL}?flightDirection=${direction}`;

    const response = await fetch(url, {
      headers: {
        app_id: process.env.VITE_SCHIPHOL_APP_ID,
        app_key: process.env.VITE_SCHIPHOL_APP_KEY,
        ResourceVersion: "v4",
      },
    });

    if (!response.ok) {
      throw new Error(`Schiphol API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("❌ Fout bij ophalen vluchtinformatie:", error.message);
    res.status(500).json({ error: "Fout bij ophalen vluchtinformatie" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy server running on http://localhost:${PORT}`);
});