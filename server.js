const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();

dotenv.config();
const app = express();
app.use(cors());

const PORT = 3001;

app.get("/api/flights", async (req, res) => {
  try {
    const direction = req.query.direction || "D";
    const url = `${process.env.VITE_SCHIPHOL_API_URL}?flightDirection=${direction}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        ResourceVersion: "v4",
        app_id: process.env.VITE_SCHIPHOL_APP_ID,
        app_key: process.env.VITE_SCHIPHOL_APP_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Schiphol API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`✅ Proxy server running on http://localhost:${PORT}`));